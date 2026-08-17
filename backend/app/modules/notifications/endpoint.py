import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.modules.users.model import User
from . import schema, crud

router = APIRouter()
_logger = logging.getLogger(__name__)

@router.get("/me/", response_model=schema.Response)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user."""
    response = crud.notification_crud.get_my_notifications(db=db, user_id=current_user.id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )

@router.get("/me/unread-count/", response_model=schema.Response)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get unread notification count for the current user."""
    response = crud.notification_crud.get_unread_count(db=db, user_id=current_user.id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )

@router.put("/{notification_id}/read/", response_model=schema.Response)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    response = crud.notification_crud.mark_as_read(db=db, user_id=current_user.id, notification_id=notification_id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )

@router.put("/read-all/", response_model=schema.Response)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user."""
    response = crud.notification_crud.mark_all_as_read(db=db, user_id=current_user.id)
    return JSONResponse(
        status_code=200 if response.get("success") else 400,
        content=response
    )
