import logging
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

from app.modules.ads.model import Ad, AdImage, AdAttributeValue
from app.modules.ads import schema

_logger = logging.getLogger(__name__)

UPLOAD_BASE = "uploads/users"


def _get_ad_upload_dir(user_id: int, ad_id: int) -> str:
    """Returns the structured upload directory for a specific ad: uploads/users/{user_id}/ads/{ad_id}/"""
    path = os.path.join(UPLOAD_BASE, str(user_id), "ads", str(ad_id))
    os.makedirs(path, exist_ok=True)
    return path


def _save_image_file(file: UploadFile, upload_dir: str) -> str:
    """Saves an uploaded image to disk and returns the relative URL path."""
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)
    # Return URL relative to the static mount (e.g. /uploads/users/1/ads/5/abc.jpg)
    return f"/{filepath}"


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
        _logger.info("Attempting to create ad: title=%s, user_id=%s, category_id=%s", payload.title, user_id, payload.category_id)
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

            # Save images into structured user/ad directory
            if images:
                upload_dir = _get_ad_upload_dir(user_id, ad.id)
                for i, file in enumerate(images):
                    image_url = _save_image_file(file, upload_dir)
                    img = AdImage(
                        ad_id=ad.id,
                        image_url=image_url,
                        display_order=i,
                        is_primary=(i == 0),
                    )
                    db.add(img)
                _logger.info("Saved %d images for ad_id=%s in %s", len(images), ad.id, upload_dir)

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

    def get_similar_ads(self, db: Session, ad_id: int, limit: int = 6) -> dict:
        """Returns similar ads based on same category and similar price range."""
        _logger.info("Fetching similar ads for ad_id=%d", ad_id)
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": True, "msg": "Ad not found.", "data": []}

            query = db.query(Ad).filter(
                Ad.id != ad_id,
                Ad.is_delete.isnot(True),
                Ad.status == "active",
                Ad.category_id == ad.category_id,
            )

            # Similar price range: ±50% of the ad's price
            if ad.price and ad.price > 0:
                from decimal import Decimal
                low = ad.price * Decimal("0.5")
                high = ad.price * Decimal("1.5")
                query = query.filter(Ad.price.between(low, high))

            ads = (
                query
                .options(joinedload(Ad.images), joinedload(Ad.category), joinedload(Ad.city), joinedload(Ad.user))
                .order_by(func.random())
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
                    "condition": a.condition,
                    "category": a.category.name if a.category else None,
                    "city": a.city.name if a.city else None,
                    "locality": a.locality,
                    "image": primary_img.image_url if primary_img else None,
                    "user_name": a.user.name if a.user else None,
                    "user_avatar": a.user.avatar if a.user else None,
                    "created_at": str(a.created_at) if a.created_at else None,
                })
            return {"success": True, "msg": "Similar ads fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching similar ads: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def get_ads_by_ids(self, db: Session, ad_ids: list) -> dict:
        """Returns ads matching the given IDs, preserving the order of IDs."""
        _logger.info("Fetching ads by IDs: %s", ad_ids[:10])
        try:
            if not ad_ids:
                return {"success": True, "msg": "No IDs provided.", "data": []}
            ads = (
                db.query(Ad)
                .filter(Ad.id.in_(ad_ids), Ad.is_delete.isnot(True), Ad.status == "active")
                .options(joinedload(Ad.images), joinedload(Ad.category), joinedload(Ad.city), joinedload(Ad.user))
                .all()
            )
            # Build a map and return in the same order as requested
            ad_map = {}
            for a in ads:
                primary_img = next((img for img in a.images if img.is_primary), None)
                ad_map[a.id] = {
                    "id": a.id,
                    "uuid": a.uuid,
                    "title": a.title,
                    "price": str(a.price) if a.price else None,
                    "condition": a.condition,
                    "category": a.category.name if a.category else None,
                    "city": a.city.name if a.city else None,
                    "locality": a.locality,
                    "image": primary_img.image_url if primary_img else None,
                    "user_name": a.user.name if a.user else None,
                    "user_avatar": a.user.avatar if a.user else None,
                    "created_at": str(a.created_at) if a.created_at else None,
                }
            # Preserve requested order
            data = [ad_map[aid] for aid in ad_ids if aid in ad_map]
            return {"success": True, "msg": "Ads fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching ads by IDs: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def get_my_ads(self, db: Session, user_id: int, status: str = None) -> dict:
        """Returns all ads posted by the current user, optionally filtered by status."""
        _logger.info("Fetching ads for user_id=%d, status=%s", user_id, status)
        try:
            from app.modules.chat.model import ChatRoom
            query = db.query(Ad).filter(Ad.user_id == user_id, Ad.is_delete.isnot(True))
            if status:
                query = query.filter(Ad.status == status)
                
            ads = (
                query
                .options(joinedload(Ad.images), joinedload(Ad.category), joinedload(Ad.city))
                .order_by(Ad.created_at.desc())
                .all()
            )
            data = []
            for a in ads:
                primary_img = next((img for img in a.images if img.is_primary), None)
                inquiry_count = db.query(ChatRoom).filter(
                    ChatRoom.ad_id == a.id,
                    ChatRoom.is_delete.isnot(True),
                ).count()
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
                    "inquiry_count": inquiry_count,
                    "created_at": str(a.created_at) if a.created_at else None,
                })
            return {"success": True, "msg": "Ads fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching user ads: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def list_active_ads(self, db: Session, category_id: int = None, city_id: int = None, search_query: str = None,
                         min_price: float = None, max_price: float = None, condition: str = None, ad_type: str = None,
                         sort_by: str = None, limit: int = 20, offset: int = 0,
                         attribute_filters: dict = None) -> dict:
        """Lists active ads with optional category/city/price/condition/sort/attribute filters and keyword search."""
        _logger.info("Listing active ads: category=%s, city=%s, search=%s, price_range=(%s, %s), attr_filters=%s",
                     category_id, city_id, search_query, min_price, max_price, attribute_filters)
        try:
            query = db.query(Ad).filter(Ad.status == "active", Ad.is_delete.isnot(True))
            if category_id:
                query = query.filter(Ad.category_id == category_id)
            if city_id:
                query = query.filter(Ad.city_id == city_id)
            if search_query:
                from sqlalchemy import or_
                from app.modules.categories.model import Category
                query = query.outerjoin(Ad.category).filter(
                    or_(
                        Ad.title.ilike(f"%{search_query}%"),
                        Ad.description.ilike(f"%{search_query}%"),
                        Category.name.ilike(f"%{search_query}%")
                    )
                )
            if min_price is not None:
                query = query.filter(Ad.price >= min_price)
            if max_price is not None:
                query = query.filter(Ad.price <= max_price)
            if condition:
                query = query.filter(Ad.condition == condition)
            if ad_type:
                query = query.filter(Ad.ad_type == ad_type)

            # ── Category-specific attribute filtering ──────────────────────────
            if attribute_filters and isinstance(attribute_filters, dict):
                for attr_id_str, attr_value in attribute_filters.items():
                    if not attr_value:
                        continue
                    try:
                        attr_id = int(attr_id_str)
                    except (ValueError, TypeError):
                        continue
                    # Subquery: find ad IDs that have this attribute with this value
                    sub = (
                        db.query(AdAttributeValue.ad_id)
                        .filter(
                            AdAttributeValue.attribute_id == attr_id,
                            AdAttributeValue.value == str(attr_value),
                        )
                        .subquery()
                    )
                    query = query.filter(Ad.id.in_(sub))

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
                .options(
                    joinedload(Ad.images),
                    joinedload(Ad.category),
                    joinedload(Ad.city),
                    joinedload(Ad.user),
                    joinedload(Ad.attribute_values).joinedload(AdAttributeValue.attribute),
                )
                .offset(offset)
                .limit(limit)
                .all()
            )

            data = []
            for a in ads:
                primary_img = next((img for img in a.images if img.is_primary), None)
                # Fetch attribute specs for this ad
                attr_specs = []
                if a.attribute_values:
                    for av in a.attribute_values:
                        if av.attribute and av.value:
                            attr_specs.append({
                                "name": av.attribute.name,
                                "value": av.value,
                            })
                data.append({
                    "id": a.id,
                    "uuid": a.uuid,
                    "title": a.title,
                    "price": str(a.price) if a.price else None,
                    "price_negotiable": a.price_negotiable,
                    "condition": a.condition,
                    "ad_type": a.ad_type,
                    "category": a.category.name if a.category else None,
                    "category_id": a.category.id if a.category else None,
                    "city": a.city.name if a.city else None,
                    "locality": a.locality,
                    "image": primary_img.image_url if primary_img else None,
                    "user_id": a.user.id if a.user else None,
                    "user_name": a.user.name if a.user else None,
                    "user_avatar": a.user.avatar if a.user else None,
                    "views_count": a.views_count,
                    "attribute_specs": attr_specs,
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

    def increment_view(self, db: Session, ad_id: int) -> dict:
        """Atomically increments the view count for an ad by 1."""
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found."}
            ad.views_count = (ad.views_count or 0) + 1
            db.commit()
            return {"success": True, "msg": "View counted.", "views_count": ad.views_count}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Error incrementing view for ad %d: %s", ad_id, e)
            return {"success": False, "msg": "Error."}

    def get_ad_detail(self, db: Session, ad_id: int) -> dict:
        """Gets full detail for a single ad."""
        _logger.info("Fetching details for ad_id=%d", ad_id)
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
                "category_id": ad.category_id,
                "city": ad.city.name if ad.city else None,
                "city_id": ad.city_id,
                "state_id": ad.city.state_id if ad.city else None,
                "locality": ad.locality,
                "images": [{"id": img.id, "url": img.image_url, "is_primary": img.is_primary} for img in images],
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

    def update_ad(
        self,
        db: Session,
        ad_id: int,
        user_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        price=None,
        price_negotiable: Optional[bool] = None,
        condition: Optional[str] = None,
        ad_type: Optional[str] = None,
        category_id: Optional[int] = None,
        city_id: Optional[int] = None,
        locality: Optional[str] = None,
        images: Optional[List[UploadFile]] = None,
        removed_image_ids: Optional[List[int]] = None,
    ) -> dict:
        """Updates an ad with optional image add/remove. Only the owner can update."""
        _logger.info("User %d attempting to update ad %d", user_id, ad_id)
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found.", "data": {}}
            if ad.user_id != user_id:
                return {"success": False, "msg": "You do not have permission to update this ad.", "data": {}}

            old_price = ad.price

            # Update text fields
            if title is not None:
                ad.title = title
            if description is not None:
                ad.description = description
            if price is not None:
                from decimal import Decimal, InvalidOperation
                try:
                    ad.price = Decimal(str(price))
                except (InvalidOperation, ValueError):
                    pass
            if price_negotiable is not None:
                ad.price_negotiable = price_negotiable
            if condition is not None:
                ad.condition = condition
            if ad_type is not None:
                ad.ad_type = ad_type
            if category_id is not None:
                ad.category_id = category_id
            if city_id is not None:
                ad.city_id = city_id
            if locality is not None:
                ad.locality = locality

            # ── Remove images ────────────────────────────────────────────────
            if removed_image_ids:
                imgs_to_remove = (
                    db.query(AdImage)
                    .filter(AdImage.id.in_(removed_image_ids), AdImage.ad_id == ad.id)
                    .all()
                )
                for img in imgs_to_remove:
                    # Delete file from disk
                    file_path = img.image_url.lstrip("/")
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        _logger.info("Deleted image file: %s", file_path)
                    db.delete(img)
                _logger.info("Removed %d images from ad %d", len(imgs_to_remove), ad.id)

            # ── Add new images ───────────────────────────────────────────────
            if images:
                upload_dir = _get_ad_upload_dir(user_id, ad.id)
                # Get max current display_order
                existing_images = db.query(AdImage).filter(AdImage.ad_id == ad.id).all()
                max_order = max((img.display_order for img in existing_images), default=-1)
                has_primary = any(img.is_primary for img in existing_images)

                for i, file in enumerate(images):
                    image_url = _save_image_file(file, upload_dir)
                    img = AdImage(
                        ad_id=ad.id,
                        image_url=image_url,
                        display_order=max_order + 1 + i,
                        is_primary=(not has_primary and i == 0),
                    )
                    db.add(img)
                _logger.info("Added %d new images to ad %d", len(images), ad.id)

            # ── Ensure there's always a primary image ────────────────────────
            db.flush()
            remaining = db.query(AdImage).filter(AdImage.ad_id == ad.id).order_by(AdImage.display_order).all()
            if remaining and not any(img.is_primary for img in remaining):
                remaining[0].is_primary = True

            db.commit()
            db.refresh(ad)
            
            # Phase 5: Trigger notification if price dropped
            new_price = ad.price
            _logger.info("Ad %d price check - new: %s, old: %s", ad.id, new_price, old_price)
            if new_price is not None and old_price is not None and new_price < old_price:
                from app.modules.notifications.crud import notification_crud
                _logger.info("Price dropped for ad %d. Notifying %d favorites.", ad.id, len(ad.favorites))
                for fav in ad.favorites:
                    notification_crud.create_notification(
                        db=db,
                        user_id=fav.user_id,
                        type="wishlist_update",
                        title="Price Dropped on Wishlist Item! 📉",
                        message=f"The price for '{ad.title}' has dropped to ₹{ad.price}.",
                        ad_id=ad.id,
                        data={"old_price": str(old_price), "new_price": str(ad.price)}
                    )

            return {"success": True, "msg": "Ad updated successfully.", "data": {"id": ad.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error updating ad: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def change_ad_status(self, db: Session, ad_id: int, user_id: int, payload: schema.AdStatusUpdate) -> dict:
        """Changes the status of an ad."""
        _logger.info("User %d attempting to change status of ad %d to %s", user_id, ad_id, payload.status)
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found.", "data": {}}
            if ad.user_id != user_id:
                return {"success": False, "msg": "You do not have permission to modify this ad.", "data": {}}

            old_status = ad.status
            ad.status = payload.status
            db.commit()
            
            # Phase 5: Notify wishlist users about status change (e.g. Sold)
            if old_status != ad.status:
                from app.modules.notifications.crud import notification_crud
                status_emoji = "🛒" if payload.status == "sold" else "ℹ️"
                for fav in ad.favorites:
                    notification_crud.create_notification(
                        db=db,
                        user_id=fav.user_id,
                        type="wishlist_update",
                        title=f"Wishlist Item Status Changed {status_emoji}",
                        message=f"The ad '{ad.title}' has been marked as '{payload.status}'.",
                        ad_id=ad.id,
                        data={"old_status": old_status, "new_status": ad.status}
                    )

            return {"success": True, "msg": f"Ad marked as {payload.status}.", "data": {"id": ad.id, "status": ad.status}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error changing ad status: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def delete_ad(self, db: Session, ad_id: int, user_id: int) -> dict:
        """Soft deletes an ad and removes its image folder from disk."""
        _logger.info("User %d attempting to delete ad %d", user_id, ad_id)
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found.", "data": {}}
            if ad.user_id != user_id:
                return {"success": False, "msg": "You do not have permission to delete this ad.", "data": {}}

            ad.is_delete = True
            from datetime import datetime
            ad.deleted_at = datetime.utcnow()
            db.commit()

            # Clean up image files from disk
            ad_dir = os.path.join(UPLOAD_BASE, str(user_id), "ads", str(ad_id))
            if os.path.isdir(ad_dir):
                shutil.rmtree(ad_dir, ignore_errors=True)
                _logger.info("Deleted image directory: %s", ad_dir)

            return {"success": True, "msg": "Ad deleted successfully.", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error deleting ad: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}


ad = AdCRUD()
