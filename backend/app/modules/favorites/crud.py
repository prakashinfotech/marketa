from sqlalchemy.orm import Session
from .model import Favorite
from app.modules.ads.model import Ad
from . import schema
import logging

_logger = logging.getLogger(__name__)

class FavoriteCRUD:
    def toggle_favorite(self, db: Session, user_id: int, ad_uuid: str) -> dict:
        """ Adds to favorites if not exists, else removes it. """
        try:
            ad = db.query(Ad).filter(Ad.uuid == ad_uuid, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found.", "data": {}}

            existing = db.query(Favorite).filter(
                Favorite.user_id == user_id, 
                Favorite.ad_id == ad.id
            ).first()

            if existing:
                db.delete(existing)
                db.commit()
                return {"success": True, "msg": "Removed from favorites.", "data": {"is_favorite": False}}
            
            new_fav = Favorite(user_id=user_id, ad_id=ad.id)
            db.add(new_fav)
            db.commit()
            return {"success": True, "msg": "Added to favorites.", "data": {"is_favorite": True}}

        except Exception as e:
            db.rollback()
            _logger.exception("Error toggling favorite: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def get_my_favorites(self, db: Session, user_id: int) -> dict:
        try:
            favs = db.query(Favorite).filter(Favorite.user_id == user_id).all()
            data = []
            for f in favs:
                if f.ad and not f.ad.is_delete:
                    data.append({
                        "id": f.ad.id,
                        "uuid": f.ad.uuid,
                        "title": f.ad.title,
                        "price": f.ad.price,
                        "city": f.ad.city.name if f.ad.city else "Unknown",
                        "created_at": str(f.ad.created_at),
                        "image": f.ad.images[0].image_path if f.ad.images else None
                    })
            return {"success": True, "msg": "Favorites fetched.", "data": data}
        except Exception as e:
            _logger.exception("Error fetching favorites: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": []}

favorite = FavoriteCRUD()
