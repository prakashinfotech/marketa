"""
Database model for the Reviews module.
Users can rate and review sellers after a transaction.
"""

from sqlalchemy import Column, Integer, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class Review(Base, CommonModelMixin):
    """
    Represents a user review/rating for another user (seller).
    Rating is 1-5 stars, enforced by a check constraint.
    """
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating_range"),
    )

    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=True)  # optional, link to transaction
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)

    # ── Relationships ────────────────────────────────────────────────────────
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_written")
    reviewed_user = relationship("User", foreign_keys=[reviewed_user_id], back_populates="reviews_received")
    ad = relationship("Ad", back_populates="reviews")
