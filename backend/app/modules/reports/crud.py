from sqlalchemy.orm import Session
from . import model, schema
from app.modules.ads.model import Ad
import logging

_logger = logging.getLogger(__name__)

class ReportCRUD:
    
    def create_report(self, db: Session, user_id: int, payload: schema.ReportCreate):
        ad = db.query(Ad).filter(Ad.id == payload.ad_id, Ad.is_delete.isnot(True)).first()
        if not ad:
            return {"success": False, "msg": "Ad not found."}
            
        # Prevent duplicate reports from same user on same ad
        existing = db.query(model.AdReport).filter(
            model.AdReport.ad_id == payload.ad_id,
            model.AdReport.reporter_id == user_id
        ).first()
        
        if existing:
            return {"success": False, "msg": "You have already reported this ad."}
            
        new_report = model.AdReport(
            ad_id=payload.ad_id,
            reporter_id=user_id,
            reason=payload.reason,
            description=payload.description,
            status="pending"
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        return {"success": True, "msg": "Report submitted successfully. Thank you for your feedback.", "data": {"id": new_report.id}}

    def get_admin_reports(self, db: Session):
        reports = db.query(model.AdReport).order_by(model.AdReport.created_at.desc()).all()
        
        result = []
        for r in reports:
            data = schema.ReportResponse.model_validate(r).model_dump()
            data['ad_title'] = r.ad.title if r.ad else "Unknown Ad"
            data['reporter_name'] = r.reporter.name if r.reporter else "Unknown User"
            result.append(data)
            
        return {"success": True, "msg": "Reports retrieved.", "data": result}
        
    def update_report_status(self, db: Session, report_id: int, status: str):
        report = db.query(model.AdReport).filter(model.AdReport.id == report_id).first()
        if not report:
            return {"success": False, "msg": "Report not found."}
            
        report.status = status
        db.commit()
        return {"success": True, "msg": "Report status updated.", "data": {}}

report_crud = ReportCRUD()
