"""
Database model for the Favorites (Wishlist) module.
Allows users to save ads they are interested in.
"""

from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class Favorite(Base, CommonModelMixin):
    """
    Represents a user's saved/favorited ad.
    Unique constraint ensures a user can only favorite an ad once.
    """
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "ad_id", name="uq_user_ad_favorite"),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user = relationship("User", back_populates="favorites")
    ad = relationship("Ad", back_populates="favorites")
