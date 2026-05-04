"""
Database model for Recently Viewed Ads.
"""

from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base
from common_models import CommonModelMixin


class RecentlyViewed(Base, CommonModelMixin):
    """
    Tracks which ads a user has recently viewed.
    """
    __tablename__ = "recently_viewed_ads"
    __table_args__ = (
        UniqueConstraint("user_id", "ad_id", name="uq_user_ad_recently_viewed"),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user = relationship("User")
    ad = relationship("Ad")
