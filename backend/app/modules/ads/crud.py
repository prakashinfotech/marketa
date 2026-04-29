import logging
import os
import uuid
from typing import List

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.modules.ads.model import Ad, AdImage, AdAttributeValue
from app.modules.ads import schema

_logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads/ads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AdCRUD:
    def create_ad(
        self,
        db: Session,
        payload: schema.AdCreate,
        user_id: int,
        images: List[UploadFile] = None,
        attribute_values: list = None,
    ) -> dict:
        """Creates a new ad with optional images and dynamic attributes."""
        try:
            ad = Ad(
                title=payload.title,
                description=payload.description,
                price=payload.price,
                price_negotiable=payload.price_negotiable,
                condition=payload.condition,
                ad_type=payload.ad_type,
                category_id=payload.category_id,
                city_id=payload.city_id,
                locality=payload.locality,
                user_id=user_id,
                status="active",
            )
            db.add(ad)
            db.flush()  # get ad.id before committing

            # Save images
            if images:
                for i, file in enumerate(images):
                    ext = os.path.splitext(file.filename)[1] or ".jpg"
                    filename = f"{ad.id}_{uuid.uuid4().hex[:8]}{ext}"
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, "wb") as f:
                        content = file.file.read()
                        f.write(content)
                    img = AdImage(
                        ad_id=ad.id,
                        image_url=f"/uploads/ads/{filename}",
                        display_order=i,
                        is_primary=(i == 0),
                    )
                    db.add(img)

            # Save attribute values
            if attribute_values:
                for av in attribute_values:
                    attr_val = AdAttributeValue(
                        ad_id=ad.id,
                        attribute_id=av["attribute_id"],
                        value=av["value"],
                    )
                    db.add(attr_val)

            db.commit()
            db.refresh(ad)
            _logger.info("Ad created: id=%s, title=%s", ad.id, ad.title)

            return {
                "success": True,
                "msg": "Ad posted successfully!",
                "data": {"id": ad.id, "uuid": ad.uuid},
            }
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error creating ad: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error creating ad: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def get_my_ads(self, db: Session, user_id: int) -> dict:
        """Returns all ads posted by the current user."""
        try:
            ads = (
                db.query(Ad)
                .filter(Ad.user_id == user_id, Ad.is_delete.isnot(True))
                .options(joinedload(Ad.images), joinedload(Ad.category), joinedload(Ad.city))
                .order_by(Ad.created_at.desc())
                .all()
            )
            data = []
            for a in ads:
                primary_img = next((img for img in a.images if img.is_primary), None)
                data.append({
                    "id": a.id,
                    "uuid": a.uuid,
                    "title": a.title,
                    "price": str(a.price) if a.price else None,
                    "condition": a.condition,
                    "status": a.status,
                    "category": a.category.name if a.category else None,
                    "city": a.city.name if a.city else None,
                    "image": primary_img.image_url if primary_img else None,
                    "views_count": a.views_count,
                    "created_at": str(a.created_at) if a.created_at else None,
                })
            return {"success": True, "msg": "Ads fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching user ads: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def list_active_ads(self, db: Session, category_id: int = None, city_id: int = None, search_query: str = None,
                         min_price: float = None, max_price: float = None, condition: str = None, ad_type: str = None,
                         sort_by: str = None, limit: int = 20, offset: int = 0) -> dict:
        """Lists active ads with optional category/city/price/condition/sort filters and keyword search."""
        try:
            query = db.query(Ad).filter(Ad.status == "active", Ad.is_delete.isnot(True))
            if category_id:
                query = query.filter(Ad.category_id == category_id)
            if city_id:
                query = query.filter(Ad.city_id == city_id)
            if search_query:
                query = query.filter(Ad.title.ilike(f"%{search_query}%"))
            if min_price is not None:
                query = query.filter(Ad.price >= min_price)
            if max_price is not None:
                query = query.filter(Ad.price <= max_price)
            if condition:
                query = query.filter(Ad.condition == condition)
            if ad_type:
                query = query.filter(Ad.ad_type == ad_type)

            total = query.count()

            # Sorting
            if sort_by == "price_low":
                query = query.order_by(Ad.price.asc().nullslast())
            elif sort_by == "price_high":
                query = query.order_by(Ad.price.desc().nullslast())
            elif sort_by == "oldest":
                query = query.order_by(Ad.created_at.asc())
            elif sort_by == "popular":
                query = query.order_by(Ad.views_count.desc())
            else:
                query = query.order_by(Ad.created_at.desc())

            ads = (
                query
                .options(joinedload(Ad.images), joinedload(Ad.category), joinedload(Ad.city), joinedload(Ad.user))
                .offset(offset)
                .limit(limit)
                .all()
            )

            data = []
            for a in ads:
                primary_img = next((img for img in a.images if img.is_primary), None)
                data.append({
                    "id": a.id,
                    "uuid": a.uuid,
                    "title": a.title,
                    "price": str(a.price) if a.price else None,
                    "price_negotiable": a.price_negotiable,
                    "condition": a.condition,
                    "ad_type": a.ad_type,
                    "category": a.category.name if a.category else None,
                    "city": a.city.name if a.city else None,
                    "locality": a.locality,
                    "image": primary_img.image_url if primary_img else None,
                    "user_id": a.user.id if a.user else None,
                    "user_name": a.user.name if a.user else None,
                    "user_avatar": a.user.avatar if a.user else None,
                    "views_count": a.views_count,
                    "created_at": str(a.created_at) if a.created_at else None,
                })

            return {
                "success": True,
                "msg": "Ads fetched.",
                "data": {"ads": data, "total": total},
            }
        except SQLAlchemyError as e:
            _logger.error("Database error listing ads: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {"ads": [], "total": 0}}

    def get_ad_detail(self, db: Session, ad_id: int) -> dict:
        """Gets full detail for a single ad."""
        try:
            ad = (
                db.query(Ad)
                .filter(Ad.id == ad_id, Ad.is_delete.isnot(True))
                .options(
                    joinedload(Ad.images),
                    joinedload(Ad.category),
                    joinedload(Ad.city),
                    joinedload(Ad.user),
                    joinedload(Ad.attribute_values),
                )
                .first()
            )
            if not ad:
                return {"success": False, "msg": "Ad not found.", "data": {}}

            # Increment views
            ad.views_count = (ad.views_count or 0) + 1
            db.commit()

            images = sorted(ad.images, key=lambda x: x.display_order)
            attrs = []
            for av in ad.attribute_values:
                attrs.append({
                    "name": av.attribute.name if av.attribute else "Unknown",
                    "value": av.value,
                })

            data = {
                "id": ad.id,
                "uuid": ad.uuid,
                "title": ad.title,
                "description": ad.description,
                "price": str(ad.price) if ad.price else None,
                "price_negotiable": ad.price_negotiable,
                "condition": ad.condition,
                "ad_type": ad.ad_type,
                "status": ad.status,
                "category": ad.category.name if ad.category else None,
                "city": ad.city.name if ad.city else None,
                "locality": ad.locality,
                "images": [{"url": img.image_url, "is_primary": img.is_primary} for img in images],
                "attributes": attrs,
                "user": {
                    "id": ad.user.id if ad.user else None,
                    "name": ad.user.name if ad.user else None,
                    "avatar": ad.user.avatar if ad.user else None,
                    "phone": ad.user.phone if ad.user else None,
                    "created_at": str(ad.user.created_at) if ad.user and ad.user.created_at else None,
                },
                "views_count": ad.views_count,
                "created_at": str(ad.created_at) if ad.created_at else None,
            }
            return {"success": True, "msg": "Ad details fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching ad detail: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}


ad = AdCRUD()
