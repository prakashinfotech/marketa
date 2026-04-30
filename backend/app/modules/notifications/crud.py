import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from . import model

_logger = logging.getLogger(__name__)

class NotificationCRUD:
    def create_notification(self, db: Session, user_id: int, type: str, title: str, message: str, ad_id: int = None, data: dict = None) -> model.Notification:
        try:
            notification = model.Notification(
                user_id=user_id,
                type=type,
                title=title,
                message=message,
                ad_id=ad_id,
                data=data
            )
            db.add(notification)
            db.commit()
            db.refresh(notification)
            return notification
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Error creating notification: %s", str(e))
            return None

    def get_my_notifications(self, db: Session, user_id: int) -> dict:
        try:
            notifications = db.query(model.Notification).filter(
                model.Notification.user_id == user_id
            ).order_by(model.Notification.created_at.desc()).all()
            
            data = []
            for n in notifications:
                data.append({
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "ad_id": n.ad_id,
                    "is_read": n.is_read,
                    "data": n.data,
                    "created_at": str(n.created_at)
                })
            return {"success": True, "msg": "Notifications fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Error fetching notifications: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def mark_as_read(self, db: Session, user_id: int, notification_id: int) -> dict:
        try:
            notification = db.query(model.Notification).filter(
                model.Notification.id == notification_id,
                model.Notification.user_id == user_id
            ).first()
            if not notification:
                return {"success": False, "msg": "Notification not found.", "data": {}}
            
            notification.is_read = True
            db.commit()
            return {"success": True, "msg": "Notification marked as read.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Error marking notification as read: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def mark_all_as_read(self, db: Session, user_id: int) -> dict:
        try:
            db.query(model.Notification).filter(
                model.Notification.user_id == user_id,
                model.Notification.is_read == False
            ).update({"is_read": True})
            db.commit()
            return {"success": True, "msg": "All notifications marked as read.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Error marking all notifications as read: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def get_unread_count(self, db: Session, user_id: int) -> dict:
        try:
            count = db.query(model.Notification).filter(
                model.Notification.user_id == user_id,
                model.Notification.is_read == False
            ).count()
            return {"success": True, "msg": "Unread count fetched.", "data": {"unread_count": count}}
        except SQLAlchemyError as e:
            _logger.error("Error fetching unread count: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {"unread_count": 0}}

notification_crud = NotificationCRUD()
