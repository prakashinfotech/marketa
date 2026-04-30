from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.modules.reports import schema, crud
from app.modules.users.model import User

router = APIRouter()

@router.post("/", response_model=schema.Response)
def create_report(
    payload: schema.ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a report for an ad."""
    return crud.report_crud.create_report(db, user_id=current_user.id, payload=payload)

@router.get("/admin/", response_model=schema.Response)
def get_admin_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """(Admin) Get all reports."""
    return crud.report_crud.get_admin_reports(db)

@router.put("/admin/{report_id}/status/", response_model=schema.Response)
def update_report_status(
    report_id: int,
    payload: schema.ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """(Admin) Update the status of a report."""
    return crud.report_crud.update_report_status(db, report_id=report_id, status=payload.status)
