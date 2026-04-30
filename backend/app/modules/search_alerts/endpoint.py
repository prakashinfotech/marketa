from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.modules.users.model import User

from . import schema, crud

router = APIRouter(
    prefix="/alerts",
    tags=["Search Alerts"],
)

@router.post("/", response_model=schema.Response)
def create_alert(
    payload: schema.SearchAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new search alert for the current user."""
    response = crud.search_alert.create_alert(db=db, user_id=current_user.id, payload=payload)
    return JSONResponse(
        status_code=201 if response.get("success") else 400,
        content=response
    )

@router.get("/me/", response_model=schema.Response)
def get_my_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all search alerts for the current user."""
    response = crud.search_alert.get_my_alerts(db=db, user_id=current_user.id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )

@router.put("/{alert_id}/toggle/", response_model=schema.Response)
def toggle_alert_status(
    alert_id: int,
    payload: schema.SearchAlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enable or disable a search alert."""
    response = crud.search_alert.toggle_alert_status(db=db, user_id=current_user.id, alert_id=alert_id, payload=payload)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )

@router.delete("/{alert_id}/", response_model=schema.Response)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a search alert."""
    response = crud.search_alert.delete_alert(db=db, user_id=current_user.id, alert_id=alert_id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )
