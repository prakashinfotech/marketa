import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import get_current_user_optional, get_current_admin_user
from . import schema, crud
from app.modules.users.model import User

_logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/submit/", response_model=schema.ContactResponse)
def submit_contact_form(
    payload: schema.ContactCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Submits a contact inquiry. Associates with current_user if logged in.
    """
    try:
        user_id = current_user.id if current_user else None
        _logger.info("Submit contact form request from user_id: %s", user_id)
        response = crud.contact.create_message(db=db, payload=payload, user_id=user_id)
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error submitting contact form: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

@router.get("/", response_model=schema.ContactResponse)
def list_contact_inquiries(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """ Lists all contact inquiries. Admin only. """
    try:
        _logger.info("Listing all contact inquiries by admin")
        response = crud.contact.list_messages(db)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error listing contact inquiries: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )

@router.patch("/{msg_id}/resolve/", response_model=schema.ContactResponse)
def resolve_contact_inquiry(
    msg_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """ Marks an inquiry as resolved. Admin only. """
    try:
        _logger.info("Resolving contact inquiry id: %s", msg_id)
        response = crud.contact.resolve_message(db, msg_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error resolving contact inquiry: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
