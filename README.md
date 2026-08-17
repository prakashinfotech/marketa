# Marketa — Full-Stack Classifieds Marketplace

A modern, full-stack classifieds platform built with **FastAPI + React + PostgreSQL**.
Buyers and sellers can post ads, search by category/location, chat in real time, and manage favorites — with an admin panel for moderation.

For day-to-day commands and conventions, see [CLAUDE.md](CLAUDE.md).
For git workflow & commit conventions, see [docs/GIT.md](docs/GIT.md).

---

## ✨ Highlights

### Backend (FastAPI)
- Modular per-domain structure (`app/modules/<entity>/`)
- JWT auth with role-based access control (Super Admin / Admin / User)
- Standardized response envelope: `{ success, msg, data }`
- Alembic migrations, PostgreSQL, branded transactional emails

### Frontend (React + Vite)
- **Lazy-loaded routes** — code-split per page (~310 KB initial JS)
- **Reusable UI primitives** in `src/components/ui/` (Button, Card, Input, Modal,
  Skeleton, EmptyState, Spinner, ImageWithSkeleton)
- **Global toast notifications** via `useToast()` hook
- **Error boundary** with friendly recovery UI (no white screen of death)
- **404 page** for unknown routes
- **Keyboard shortcuts** (`/` focus search, `?` help, `g h/a/m/f` jump, `Esc` close)
- **Web Share API** integration for ad sharing (with copy/WhatsApp/SMS/Email fallback)
- **Accessibility baselines**: skip-to-main, ARIA on modals/toasts, semantic HTML, focus rings
- **Image lazy-loading** with skeleton placeholders on ad cards

---

## 📁 Project Structure

```
fastapi-template/
├── main.py                      # FastAPI app entry point
├── pyproject.toml               # Project metadata & dependencies (uv/pip)
├── alembic.ini                  # Alembic configuration
├── common_models.py             # Shared SQLAlchemy mixin (id, uuid, timestamps, soft-delete)
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
│
├── alembic/                     # Database migrations
│   ├── env.py                   # Migration environment (loads settings + models)
│   ├── script.py.mako           # Migration file template
│   └── versions/                # Auto-generated migration files
│
├── app/
│   ├── __init__.py
│   │
│   ├── core/                    # Application-wide configuration
│   │   ├── config.py            # Settings (pydantic-settings, loads .env)
│   │   ├── security.py          # Password hashing, JWT creation
│   │   └── roles.py             # Role constants for RBAC
│   │
│   ├── db/                      # Database layer
│   │   ├── session.py           # SQLAlchemy engine, SessionLocal, Base
│   │   ├── base.py              # Model registry (import all models here for Alembic)
│   │   └── deps.py              # get_db() dependency
│   │
│   ├── api/                     # API layer
│   │   ├── deps.py              # Auth service (JWT decode + RBAC)
│   │   └── v1/
│   │       └── api.py           # Central router — register all module routers here
│   │
│   ├── modules/                 # Feature modules (one folder per domain entity)
│   │   └── users/               # ← Sample module
│   │       ├── __init__.py      # Exports: router, user_crud
│   │       ├── model.py         # SQLAlchemy model
│   │       ├── schema.py        # Pydantic request/response schemas
│   │       ├── crud.py          # Business logic (class-based)
│   │       └── endpoint.py      # FastAPI router endpoints
│   │
│   └── utils/                   # Shared utilities
│       ├── logger.py            # Centralized logging setup
│       └── email.py             # Email sending (SMTP, branded templates)
│
└── README.md                    # This file
```

---

## 🚀 Project Setup

### Prerequisites

- Python 3.12+
- PostgreSQL
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### 1. Clone & Navigate

```bash
# Copy template to your new project
cp -r fastapi-template/ my-new-project/
cd my-new-project/
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

**Required `.env` variables:**

| Variable           | Description               | Example                         |
| ------------------ | ------------------------- | ------------------------------- |
| `PG_USER`        | PostgreSQL username       | `postgres`                    |
| `PG_PASSWORD`    | PostgreSQL password       | `your_password`               |
| `PG_DBNAME`      | Database name             | `my_project_db`               |
| `PG_HOSTNAME`    | Database host             | `localhost`                   |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | (generate a long random string) |
| `SMTP_HOST`      | SMTP server hostname      | `smtp.gmail.com`              |
| `SMTP_PORT`      | SMTP server port          | `587`                         |
| `SMTP_USER`      | SMTP login email          | `you@gmail.com`               |
| `SMTP_PASSWORD`  | SMTP app password         | (Gmail App Password)            |
| `SMTP_FROM_NAME` | Sender display name       | `Marketa`                  |
| `FRONTEND_URL`   | Frontend base URL         | `http://localhost:3000`       |

### 3. Create Virtual Environment & Install Dependencies

**Using uv (recommended):**

```bash
# Create venv and install dependencies in one step
uv venv
source .venv/bin/activate
uv pip install -e .
```

**Using pip:**

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 4. Database Setup

```bash
# Create the PostgreSQL database
createdb my_project_db

# Or via psql
psql -U postgres -c "CREATE DATABASE my_project_db;"
```

### 5. Run Alembic Migrations

```bash
# Generate initial migration from your models
alembic revision --autogenerate -m "initial"

# Apply migrations to the database
alembic upgrade head
```

### 6. Run the Application

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open your browser:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🗄️ Alembic — Database Migrations

### Configuration

Alembic is pre-configured to:

- Load the database URL from your `.env` via `app.core.config.settings`
- Auto-detect models imported in `alembic/env.py`

### Common Commands

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View current migration status
alembic current

# View migration history
alembic history
```

### Adding Models to Alembic

When you create a new module with a model, you must import it in **two places**:

1. **`alembic/env.py`** — so Alembic can detect it:

   ```python
   from app.modules.your_module import model as your_module_model
   ```
2. **`app/db/base.py`** — so the app registry is complete:

   ```python
   from app.modules.your_module.model import YourModel
   ```

---

## 📦 Dependency Management

### Using uv (recommended)

```bash
# Add a new dependency
uv add package-name

# Add a dev dependency
uv add --dev pytest

# Sync dependencies
uv sync
```

### Using pip

```bash
# Install from pyproject.toml
pip install -e .

# Generate requirements.txt (if needed)
pip freeze > requirements.txt
```

---

## 🧩 How to Create a New Module

Follow these steps every time you add a new feature/entity:

### Step 1: Create Module Folder

```bash
mkdir -p app/modules/products
```

### Step 2: Create Module Files

Create these 5 files inside `app/modules/products/`:

#### `__init__.py`

```python
from .endpoint import router
from .crud import product as product_crud
```

#### `model.py`

```python
"""
Database model for the Product entity.
"""

from sqlalchemy import Column, String, Float, Boolean

from app.db.session import Base
from common_models import CommonModelMixin


class Product(Base, CommonModelMixin):
    __tablename__ = "products"

    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
```

#### `schema.py`

```python
"""
Pydantic schemas for the Product module.
"""

from pydantic import BaseModel
from typing import Optional, Any


class CreateProductRequest(BaseModel):
    name: str
    description: Optional[str] = None
    price: float


class GetAllProductsRequest(BaseModel):
    skip: int = 0
    limit: int = 100


class UpdateProductRequest(BaseModel):
    product_uuid: str
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


class DeleteProductRequest(BaseModel):
    product_uuid: str


class Response(BaseModel):
    success: bool
    data: Optional[Any] = None
    msg: Optional[str] = None
```

#### `crud.py`

```python
"""
CRUD operations for the Product module.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from .model import Product
from . import schema

_logger = logging.getLogger(__name__)


class ProductCRUD:

    def create_product(self, db: Session, payload: schema.CreateProductRequest) -> dict:
        try:
            new_product = Product(
                name=payload.name,
                description=payload.description,
                price=payload.price,
            )
            db.add(new_product)
            db.commit()
            db.refresh(new_product)
            return {"success": True, "msg": "Product created.", "data": {"uuid": new_product.uuid}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("DB error: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    # ... add list, update, delete methods following the same pattern


product = ProductCRUD()
```

#### `endpoint.py`

```python
"""
API endpoints for Product management.
"""

import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from . import schema, crud

_logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/create/", response_model=schema.Response)
def create_product(
    payload: schema.CreateProductRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        response = crud.product.create_product(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Error: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
```

### Step 3: Register the Module

**`app/api/v1/api.py`** — Add router:

```python
from app.modules import products
api_router.include_router(products.router, prefix="/products", tags=["Products"])
```

**`app/db/base.py`** — Add model import:

```python
from app.modules.products.model import Product
```

**`alembic/env.py`** — Add model import:

```python
from app.modules.products import model as product_model
```

### Step 4: Run Migration

```bash
alembic revision --autogenerate -m "add products table"
alembic upgrade head
```

---

## 📐 Coding Conventions

### API Response Format

**Every** API response follows this structure:

```json
{
    "success": true,
    "msg": "Human-readable message",
    "data": {}
}
```

For paginated lists:

```json
{
    "success": true,
    "msg": "Items fetched successfully.",
    "data": [...],
    "total": 50,
    "skip": 0,
    "limit": 100
}
```

Build responses as inline dicts in the CRUD layer:

```python
return {"success": True, "msg": "Created.", "data": {"id": 1}}
return {"success": False, "msg": "Not found.", "data": {}}
```

In endpoints, use `JSONResponse` to set the HTTP status code:

```python
return JSONResponse(
    status_code=200 if response.get("success") else 400,
    content={
        "success": response.get("success"),
        "msg": response.get("msg"),
        "data": response.get("data", {}),
    },
)
```

### Module Structure

Each module follows the same 5-file pattern:

| File            | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `__init__.py` | Exports `router` and CRUD instance                        |
| `model.py`    | SQLAlchemy model (inherits `Base` + `CommonModelMixin`) |
| `schema.py`   | Pydantic request/response schemas                           |
| `crud.py`     | Business logic (class-based, returns response dicts)        |
| `endpoint.py` | FastAPI router (thin controller, delegates to CRUD)         |

### Naming Conventions

- **Module folders**: lowercase, plural (`users`, `products`, `orders`)
- **Model classes**: singular PascalCase (`User`, `Product`)
- **Table names**: lowercase, plural (`users`, `products`)
- **CRUD classes**: `{Entity}CRUD` (`UserCRUD`, `ProductCRUD`)
- **CRUD instances**: lowercase singular (`user`, `product`)
- **Schema classes**: descriptive PascalCase (`CreateUserRequest`, `UserResponse`)

### Error Handling

- **CRUD layer**: Catch `SQLAlchemyError`, `IntegrityError`, and generic `Exception`. Always `db.rollback()` on error. Return `{"success": False, "msg": "...", "data": {}}`.
- **Endpoint layer**: Wrap CRUD calls in `try/except`. Catch unexpected exceptions and return 500 via `JSONResponse`.

---

## 🤖 AI Tool Instructions

When using AI tools (Antigravity, Claude, ChatGPT) to extend this project:

1. **Always follow the module structure** — 5 files per module (`__init__`, `model`, `schema`, `crud`, `endpoint`)
2. **Use inline dict responses** — CRUD returns `{"success": bool, "msg": str, "data": any}`, endpoints wrap with `JSONResponse`
3. **Register in 3 places** — `api/v1/api.py`, `db/base.py`, `alembic/env.py`
4. **Inherit CommonModelMixin** — Every model gets `id`, `uuid`, `created_at`, `modified_at`, `is_delete`, `deleted_at` automatically
5. **Class-based CRUD** — Each module has a CRUD class with a global instance
6. **Consistent response format** — `{"success": bool, "msg": str, "data": any}`
7. **Pagination** — Use `skip` and `limit` fields directly in schemas

---

## 📋 Quick Reference

```bash
# Run dev server
uvicorn main:app --reload --port 8000

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Add dependency (uv)
uv add package-name

# Add dependency (pip)
pip install package-name
```
