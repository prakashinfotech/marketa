"""
Database model for the Reports module.
Users can report ads that are spam, fraudulent, or offensive.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class AdReport(Base, CommonModelMixin):
    """
    Represents a user's report against an ad.
    Admins review and resolve reports.

    reason values: spam, fraud, offensive, duplicate, other
    status values: pending, reviewed, resolved
    """
    __tablename__ = "ad_reports"

    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(30), nullable=False)  # spam, fraud, offensive, duplicate, other
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, reviewed, resolved

    # ── Relationships ────────────────────────────────────────────────────────
    ad = relationship("Ad", back_populates="reports")
    reporter = relationship("User", back_populates="reports_filed")
