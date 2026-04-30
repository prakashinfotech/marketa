import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from sqlalchemy.exc import SQLAlchemyError

from . import model, schema
from app.modules.ads.model import Ad

_logger = logging.getLogger(__name__)

class SearchAlertCRUD:
    def create_alert(self, db: Session, user_id: int, payload: schema.SearchAlertCreate) -> dict:
        try:
            # Check if an identical alert already exists for the user
            existing = db.query(model.SearchAlert).filter(
                model.SearchAlert.user_id == user_id,
                model.SearchAlert.keyword == payload.keyword,
                model.SearchAlert.category_id == payload.category_id,
                model.SearchAlert.city_id == payload.city_id,
            ).first()

            if existing:
                return {"success": False, "msg": "An identical alert already exists.", "data": {}}

            new_alert = model.SearchAlert(
                user_id=user_id,
                keyword=payload.keyword,
                category_id=payload.category_id,
                city_id=payload.city_id,
                min_price=payload.min_price,
                max_price=payload.max_price,
                is_active=True
            )
            db.add(new_alert)
            db.commit()
            db.refresh(new_alert)
            return {"success": True, "msg": "Alert created successfully.", "data": new_alert}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error creating search alert: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def get_my_alerts(self, db: Session, user_id: int) -> dict:
        try:
            alerts = db.query(model.SearchAlert).options(
                joinedload(model.SearchAlert.category),
                joinedload(model.SearchAlert.city)
            ).filter(model.SearchAlert.user_id == user_id).order_by(model.SearchAlert.created_at.desc()).all()
            
            data = []
            for alert in alerts:
                data.append({
                    "id": alert.id,
                    "keyword": alert.keyword,
                    "category_id": alert.category_id,
                    "category_name": alert.category.name if alert.category else None,
                    "city_id": alert.city_id,
                    "city_name": alert.city.name if alert.city else None,
                    "min_price": float(alert.min_price) if alert.min_price else None,
                    "max_price": float(alert.max_price) if alert.max_price else None,
                    "is_active": alert.is_active,
                    "created_at": str(alert.created_at)
                })
            return {"success": True, "msg": "Alerts fetched successfully.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching search alerts: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def toggle_alert_status(self, db: Session, user_id: int, alert_id: int, payload: schema.SearchAlertUpdate) -> dict:
        try:
            alert = db.query(model.SearchAlert).filter(
                model.SearchAlert.id == alert_id,
                model.SearchAlert.user_id == user_id
            ).first()
            
            if not alert:
                return {"success": False, "msg": "Alert not found.", "data": {}}
            
            alert.is_active = payload.is_active
            db.commit()
            return {"success": True, "msg": f"Alert {'activated' if payload.is_active else 'paused'}.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error toggling alert: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def delete_alert(self, db: Session, user_id: int, alert_id: int) -> dict:
        try:
            alert = db.query(model.SearchAlert).filter(
                model.SearchAlert.id == alert_id,
                model.SearchAlert.user_id == user_id
            ).first()
            
            if not alert:
                return {"success": False, "msg": "Alert not found.", "data": {}}
            
            db.delete(alert)
            db.commit()
            return {"success": True, "msg": "Alert deleted.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error deleting alert: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def check_matching_alerts(self, db: Session, ad: Ad):
        """
        Background task method.
        Given a newly created ad, finds all active alerts that match its criteria.
        """
        try:
            _logger.info("Checking matching alerts for new ad: %s", ad.title)
            
            # Start query for active alerts where the user is NOT the seller
            query = db.query(model.SearchAlert).filter(
                model.SearchAlert.is_active == True,
                model.SearchAlert.user_id != ad.user_id
            )
            
            alerts = query.all()
            matches = []

            for alert in alerts:
                # Check keyword in title or description
                keyword = alert.keyword.lower()
                title_match = keyword in (ad.title.lower() if ad.title else "")
                desc_match = keyword in (ad.description.lower() if ad.description else "")
                
                if not (title_match or desc_match):
                    continue
                
                # Check category
                if alert.category_id and alert.category_id != ad.category_id:
                    continue
                    
                # Check city
                if alert.city_id and alert.city_id != ad.city_id:
                    continue
                    
                # Check price
                if ad.price is not None:
                    if alert.min_price and ad.price < alert.min_price:
                        continue
                    if alert.max_price and ad.price > alert.max_price:
                        continue
                
                matches.append(alert)
                
            if matches:
                from app.modules.notifications.crud import notification_crud
                _logger.info("Found %d matching alerts for ad %d", len(matches), ad.id)
                for m in matches:
                    notification_crud.create_notification(
                        db=db,
                        user_id=m.user_id,
                        type="search_alert",
                        title="New Search Alert Match! 🎯",
                        message=f"An ad '{ad.title}' matching your alert '{m.keyword}' was just posted.",
                        ad_id=ad.id,
                        data={"keyword": m.keyword, "price": str(ad.price) if ad.price else None}
                    )
                    
            return matches

        except Exception as e:
            _logger.exception("Error in check_matching_alerts: %s", str(e))

search_alert = SearchAlertCRUD()
