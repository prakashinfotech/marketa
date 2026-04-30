import json
import logging
import urllib.parse
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.modules.users.model import User
from app.modules.search_alerts.crud import search_alert
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
    background_tasks: BackgroundTasks = BackgroundTasks(),
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
        
        # If ad created successfully, trigger alert check in background
        if response.get("success") and response.get("data"):
            from app.modules.ads.model import Ad
            new_ad_id = response["data"].get("id")
            if new_ad_id:
                # We need to fetch the newly created Ad object to pass to the matching logic
                new_ad = db.query(Ad).filter(Ad.id == new_ad_id).first()
                if new_ad:
                    background_tasks.add_task(search_alert.check_matching_alerts, db, new_ad)

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
    status: Optional[str] = Query(None, description="Filter by status (e.g. active, sold, inactive)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all ads posted by the logged-in user."""
    try:
        _logger.info("Fetching ads for user: %s with status: %s", current_user.id, status)
        response = crud.ad.get_my_ads(db=db, user_id=current_user.id, status=status)
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
    attribute_filters: Optional[str] = Query(None, description="URL-encoded JSON object, e.g. {\"fuel_type\":\"Petrol\"}"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Lists active ads with optional filters including category-specific attributes."""
    try:
        # Parse attribute_filters from JSON string
        parsed_attr_filters = None
        if attribute_filters:
            try:
                decoded = urllib.parse.unquote(attribute_filters)
                parsed_attr_filters = json.loads(decoded)
            except (json.JSONDecodeError, ValueError):
                _logger.warning("Invalid attribute_filters JSON: %s", attribute_filters)
                parsed_attr_filters = None

        _logger.info("Listing ads: category=%s, city=%s, search=%s, attr_filters=%s", category_id, city_id, search_query, parsed_attr_filters)
        response = crud.ad.list_active_ads(
            db=db, category_id=category_id, city_id=city_id, search_query=search_query,
            min_price=min_price, max_price=max_price, condition=condition, ad_type=ad_type,
            sort_by=sort_by, limit=limit, offset=offset,
            attribute_filters=parsed_attr_filters,
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


@router.post("/by-ids/", response_model=schema.Response)
def get_ads_by_ids(
    payload: schema.AdsByIdsRequest,
    db: Session = Depends(get_db),
):
    """Returns ads matching a list of IDs, preserving the order of IDs provided."""
    try:
        _logger.info("Fetching ads by IDs: %s", payload.ids[:10])
        response = crud.ad.get_ads_by_ids(db=db, ad_ids=payload.ids)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Error fetching ads by IDs: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
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


@router.get("/{ad_id}/similar/", response_model=schema.Response)
def get_similar_ads(
    ad_id: int,
    db: Session = Depends(get_db),
):
    """Returns similar ads based on same category and similar price range."""
    try:
        _logger.info("Fetching similar ads for ad_id: %s", ad_id)
        response = crud.ad.get_similar_ads(db=db, ad_id=ad_id)
        return JSONResponse(status_code=200, content=response)
    except Exception as e:
        _logger.exception("Error fetching similar ads: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.post("/{ad_id}/view/")
def increment_view(
    ad_id: int,
    db: Session = Depends(get_db),
):
    """Increments the view count for an ad by 1. Called once on page load."""
    crud.ad.increment_view(db=db, ad_id=ad_id)
    return JSONResponse(status_code=200, content={"success": True, "msg": "OK"})

@router.put("/{ad_id}/update/", response_model=schema.Response)
def update_ad(
    ad_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    price_negotiable: Optional[bool] = Form(None),
    condition: Optional[str] = Form(None),
    ad_type: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    city_id: Optional[int] = Form(None),
    locality: Optional[str] = Form(None),
    removed_image_ids: Optional[str] = Form(None),  # JSON string e.g. "[1, 2, 3]"
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates an ad's details and images. Only the owner can update."""
    try:
        # Parse removed_image_ids from JSON string
        parsed_removed_ids = None
        if removed_image_ids:
            try:
                parsed_removed_ids = json.loads(removed_image_ids)
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "msg": "Invalid removed_image_ids format.", "data": {}},
                )

        # Parse price
        price_val = None
        if price:
            from decimal import Decimal, InvalidOperation
            try:
                price_val = Decimal(price)
            except (InvalidOperation, ValueError):
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "msg": "Invalid price value.", "data": {}},
                )

        response = crud.ad.update_ad(
            db=db,
            ad_id=ad_id,
            user_id=current_user.id,
            title=title,
            description=description,
            price=price_val,
            price_negotiable=price_negotiable,
            condition=condition,
            ad_type=ad_type,
            category_id=category_id,
            city_id=city_id,
            locality=locality,
            images=images if images else None,
            removed_image_ids=parsed_removed_ids,
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
        _logger.exception("Unexpected error updating ad: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.put("/{ad_id}/status/", response_model=schema.Response)
def change_ad_status(
    ad_id: int,
    payload: schema.AdStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Changes the status of an ad (e.g. active, sold, inactive)."""
    try:
        response = crud.ad.change_ad_status(db=db, ad_id=ad_id, user_id=current_user.id, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error changing ad status: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.delete("/{ad_id}/", response_model=schema.Response)
def delete_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft deletes an ad. Only the owner can delete."""
    try:
        response = crud.ad.delete_ad(db=db, ad_id=ad_id, user_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error deleting ad: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
