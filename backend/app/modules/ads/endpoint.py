import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.modules.users.model import User
from . import schema, crud

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.post("/create/", response_model=schema.Response)
def create_ad(
    title: str = Form(...),
    category_id: int = Form(...),
    city_id: int = Form(...),
    description: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    price_negotiable: Optional[bool] = Form(False),
    condition: Optional[str] = Form(None),
    ad_type: str = Form("sell"),
    locality: Optional[str] = Form(None),
    attribute_values: Optional[str] = Form(None),  # JSON string
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new ad with images and dynamic attributes."""
    try:
        _logger.info("Create ad request from user: %s, title: %s", current_user.id, title)

        from decimal import Decimal, InvalidOperation
        price_val = None
        if price:
            try:
                price_val = Decimal(price)
            except (InvalidOperation, ValueError):
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "msg": "Invalid price value.", "data": {}},
                )

        payload = schema.AdCreate(
            title=title,
            description=description,
            price=price_val,
            price_negotiable=price_negotiable,
            condition=condition,
            ad_type=ad_type,
            category_id=category_id,
            city_id=city_id,
            locality=locality,
        )

        # Parse attribute values from JSON string
        attr_values = None
        if attribute_values:
            try:
                attr_values = json.loads(attribute_values)
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "msg": "Invalid attribute_values format.", "data": {}},
                )

        response = crud.ad.create_ad(
            db=db,
            payload=payload,
            user_id=current_user.id,
            images=images if images else None,
            attribute_values=attr_values,
        )
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error creating ad: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.get("/me/", response_model=schema.Response)
def get_my_ads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all ads posted by the logged-in user."""
    try:
        _logger.info("Fetching ads for user: %s", current_user.id)
        response = crud.ad.get_my_ads(db=db, user_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching user ads: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.get("/list/", response_model=schema.Response)
def list_ads(
    category_id: Optional[int] = Query(None),
    city_id: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    condition: Optional[str] = Query(None),
    ad_type: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Lists active ads with optional filters."""
    try:
        _logger.info("Listing ads: category=%s, city=%s, search=%s", category_id, city_id, search_query)
        response = crud.ad.list_active_ads(
            db=db, category_id=category_id, city_id=city_id, search_query=search_query,
            min_price=min_price, max_price=max_price, condition=condition, ad_type=ad_type,
            sort_by=sort_by, limit=limit, offset=offset,
        )
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error listing ads: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.get("/{ad_id}/", response_model=schema.Response)
def get_ad_detail(
    ad_id: int,
    db: Session = Depends(get_db),
):
    """Returns full detail for a single ad."""
    try:
        _logger.info("Fetching ad detail: %s", ad_id)
        response = crud.ad.get_ad_detail(db=db, ad_id=ad_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 404,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching ad detail: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
