"""
Database model for the Packages module.
Premium ad plans that users can purchase for better visibility.
"""

from sqlalchemy import Column, Integer, String, Text, Numeric
from sqlalchemy.dialects.postgresql import JSON

from app.db.session import Base
from common_models import CommonModelMixin


class AdPackage(Base, CommonModelMixin):
    """
    Represents a premium ad package/plan.
    Example: "Featured" (₹99, 7 days), "Urgent" (₹199, 14 days)
    """
    __tablename__ = "ad_packages"

    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    duration_days = Column(Integer, nullable=False)
    features = Column(JSON, nullable=True)  # e.g. {"highlight": true, "top_placement": true}
