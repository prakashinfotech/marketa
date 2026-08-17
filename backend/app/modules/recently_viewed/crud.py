"""
CRUD operations for Recently Viewed Ads.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.modules.recently_viewed.model import RecentlyViewed
from app.modules.ads.model import Ad

def add_recently_viewed(db: Session, user_id: int, ad_id: int) -> None:
    """
    Adds an ad to the user's recently viewed list, or updates the viewed_at timestamp if it already exists.
    Keeps only the 20 most recent ads per user to save space.
    """
    # Check if already exists
    record = db.query(RecentlyViewed).filter(
        RecentlyViewed.user_id == user_id,
        RecentlyViewed.ad_id == ad_id
    ).first()

    if record:
        record.viewed_at = datetime.now(timezone.utc)
    else:
        record = RecentlyViewed(user_id=user_id, ad_id=ad_id)
        db.add(record)
    
    db.commit()

    # Enforce limit of 20
    count = db.query(RecentlyViewed).filter(RecentlyViewed.user_id == user_id).count()
    if count > 20:
        # Delete oldest
        oldest_records = db.query(RecentlyViewed).filter(RecentlyViewed.user_id == user_id).order_by(RecentlyViewed.viewed_at.asc()).limit(count - 20).all()
        for old in oldest_records:
            db.delete(old)
        db.commit()


def get_recently_viewed(db: Session, user_id: int) -> list[dict]:
    """
    Gets the top 20 most recently viewed ads for the user.
    """
    records = db.query(RecentlyViewed).filter(
        RecentlyViewed.user_id == user_id
    ).order_by(RecentlyViewed.viewed_at.desc()).limit(20).all()

    results = []
    for r in records:
        ad = r.ad
        if ad and ad.status == "active" and not ad.is_delete:
            primary_img = next((img for img in ad.images if img.is_primary), None)
            if not primary_img and ad.images:
                primary_img = ad.images[0]
            
            results.append({
                "id": ad.id,
                "uuid": ad.uuid,  # Use ad.uuid as the main uuid for the response to match frontend expectations
                "ad_uuid": ad.uuid,
                "title": ad.title,
                "price": float(ad.price) if ad.price else None,
                "image": primary_img.image_url if primary_img else None,
                "city": ad.city.name if ad.city else None,
                "locality": ad.locality
            })
            
    return results


def clear_recently_viewed(db: Session, user_id: int) -> None:
    """
    Clears all recently viewed history for a user.
    """
    db.query(RecentlyViewed).filter(RecentlyViewed.user_id == user_id).delete()
    db.commit()
