import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_admin_user
from . import schema, crud

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get("/", response_model=schema.Response)
def list_categories(db: Session = Depends(get_db)):
    """List all categories as a hierarchical tree."""
    try:
        _logger.info("Fetching all categories")
        response = crud.category.get_all_categories(db=db)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching categories: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.get("/{category_id}/attributes/", response_model=schema.Response)
def list_category_attributes(category_id: int, db: Session = Depends(get_db)):
    """List all dynamic attributes for a specific category."""
    try:
        _logger.info("Fetching attributes for category_id: %s", category_id)
        response = crud.category.get_category_attributes(db=db, category_id=category_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching attributes: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.post("/", response_model=schema.Response)
def create_category(
    payload: schema.CategoryCreate, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin_user)
):
    """Create a new category or sub-category (Admin only)."""
    try:
        _logger.info("Create category request for: %s", payload.name)
        response = crud.category.create_category(db=db, payload=payload)
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error creating category: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/attributes/", response_model=schema.Response)
def create_attribute(
    payload: schema.CategoryAttributeCreate, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin_user)
):
    """Create a new dynamic attribute for a category (Admin only)."""
    try:
        _logger.info("Create category attribute request for: %s", payload.name)
        response = crud.category.create_attribute(db=db, payload=payload)
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error creating attribute: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
