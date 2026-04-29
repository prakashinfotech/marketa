from sqlalchemy.orm import Session
from .model import ContactMessage
from . import schema
import logging

_logger = logging.getLogger(__name__)

class ContactCRUD:
    def create_message(self, db: Session, payload: schema.ContactCreateRequest, user_id: int = None) -> dict:
        try:
            new_msg = ContactMessage(
                user_id=user_id,
                name=payload.name,
                email=payload.email,
                subject=payload.subject,
                message=payload.message
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)
            
            _logger.info(f"New contact message received from {payload.email}")
            return {
                "success": True, 
                "msg": "Thank you! We have received your message and our team will call you back shortly.",
                "data": {"id": new_msg.id}
            }
        except Exception as e:
            db.rollback()
            _logger.exception("Error saving contact message: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def list_messages(self, db: Session) -> dict:
        try:
            msgs = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
            data = []
            for m in msgs:
                data.append({
                    "id": m.id,
                    "name": m.name,
                    "email": m.email,
                    "subject": m.subject,
                    "message": m.message,
                    "is_resolved": m.is_resolved,
                    "created_at": str(m.created_at),
                    "user_id": m.user_id
                })
            return {"success": True, "msg": "Messages fetched.", "data": data}
        except Exception as e:
            _logger.exception("Error listing contact messages: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": []}

    def resolve_message(self, db: Session, msg_id: int) -> dict:
        try:
            msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
            if not msg:
                return {"success": False, "msg": "Message not found.", "data": {}}
            
            msg.is_resolved = True
            db.commit()
            return {"success": True, "msg": "Message marked as resolved.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error resolving message: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

contact = ContactCRUD()
