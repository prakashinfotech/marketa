# Marketa — Backend Rules (FastAPI Skill File)

> **Scope:** This file governs ALL Python code in the `backend/` directory. Claude MUST follow these patterns exactly.

---

## 1. CRUD Class Pattern

Every module has a CRUD class. This is where ALL business logic lives. Endpoints are thin controllers.

```python
"""
CRUD operations for the [Module] module.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from .model import MyModel
from . import schema

_logger = logging.getLogger(__name__)


class MyModelCRUD:

    def create_item(self, db: Session, payload: schema.CreateItemRequest) -> dict:
        """Creates a new item."""
        _logger.info("Attempting to create item: %s", payload.name)
        try:
            item = MyModel(
                name=payload.name,
                description=payload.description,
            )
            db.add(item)
            db.commit()
            db.refresh(item)
            _logger.info("Item created: id=%s", item.id)
            return {
                "success": True,
                "msg": "Item created successfully.",
                "data": {"id": item.id, "uuid": item.uuid},
            }
        except IntegrityError as e:
            db.rollback()
            _logger.error("Integrity error: %s", str(e))
            return {"success": False, "msg": "Item already exists.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Unexpected error: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}


# Global instance — used by endpoints
my_model = MyModelCRUD()
```

### CRUD Rules

1. **ALWAYS return** `{"success": bool, "msg": str, "data": any}` — no exceptions.
2. **ALWAYS catch** `SQLAlchemyError` and call `db.rollback()`.
3. **ALWAYS use `_logger`** — never `print()`.
4. **Class name:** `{Entity}CRUD` (e.g., `AdCRUD`, `UserCRUD`).
5. **Instance name:** lowercase singular at module level (e.g., `ad = AdCRUD()`).
6. **Soft delete:** Set `is_delete=True` and `deleted_at=datetime.utcnow()`, never hard `DELETE`.
7. **Filter soft-deleted:** Always add `.filter(Model.is_delete.isnot(True))` to queries.

---

## 2. Endpoint Pattern

Endpoints are thin controllers. They delegate to CRUD and wrap responses in `JSONResponse`.

```python
"""
API endpoints for [Module] management.
"""

import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user, get_current_admin_user
from . import schema, crud

_logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/create/", response_model=schema.Response)
def create_item(
    payload: schema.CreateItemRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Creates a new item."""
    try:
        _logger.info("Create item request by user: %s", current_user.email)
        response = crud.my_model.create_item(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
```

### Endpoint Rules

1. **Public routes:** No auth dependency.
2. **Protected routes:** `current_user = Depends(get_current_user)`.
3. **Admin routes:** `current_user = Depends(get_current_admin_user)`.
4. **ALWAYS wrap** CRUD calls in `try/except`.
5. **Status codes:** `200` for success, `400` for business logic failure, `500` for unexpected errors.
6. **ALWAYS use `JSONResponse`** — never return plain dicts from endpoints.

---

## 3. Schema Pattern

```python
"""
Pydantic schemas for the [Module] module.
"""

from pydantic import BaseModel
from typing import Optional, Any


class CreateItemRequest(BaseModel):
    name: str
    description: Optional[str] = None


class Response(BaseModel):
    success: bool
    msg: Optional[str] = None
    data: Optional[Any] = None
```

---

## 4. Model Pattern

```python
"""
Database model for the [Module] entity.
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class MyModel(Base, CommonModelMixin):
    """Description of what this model represents."""
    __tablename__ = "my_models"

    name = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="my_models")
```

---

## 5. __init__.py Pattern

```python
from .endpoint import router
from .crud import my_model as my_model_crud
```

---

## 6. main.py Structure

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles

import app.db.base  # Ensures all models are registered
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware
app.add_middleware(SessionMiddleware, secret_key="...")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# Static files (uploads)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# API routes
app.include_router(api_router, prefix="/api/v1")
```

---

## 7. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Module folders | lowercase plural | `users`, `ads`, `categories` |
| Model classes | singular PascalCase | `User`, `Ad`, `Category` |
| Table names | lowercase plural | `users`, `ads`, `categories` |
| CRUD classes | `{Entity}CRUD` | `UserCRUD`, `AdCRUD` |
| CRUD instances | lowercase singular | `user`, `ad` |
| Schema classes | descriptive PascalCase | `CreateAdRequest`, `UpdateUserRequest` |
| Endpoint functions | `verb_noun` | `create_ad`, `list_users`, `delete_faq` |
| API prefixes | lowercase with hyphens | `/users`, `/ads`, `/search-alerts` |
