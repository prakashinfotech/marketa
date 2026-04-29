"""
Database model for the Search Alerts module.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class SearchAlert(Base, CommonModelMixin):
    __tablename__ = "search_alerts"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keyword = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    min_price = Column(Numeric(12, 2), nullable=True)
    max_price = Column(Numeric(12, 2), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="search_alerts")
    category = relationship("Category")
    city = relationship("City")
