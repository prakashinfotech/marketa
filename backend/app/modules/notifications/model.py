"""
Database model for the Notifications module.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON  # using dialect-specific JSON for broader compatibility, or we can use generic JSON
from sqlalchemy.types import JSON as GenericJSON

from app.db.session import Base
from common_models import CommonModelMixin

class Notification(Base, CommonModelMixin):
    __tablename__ = "notifications"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(30))  # e.g., wishlist_update, search_alert
    title = Column(String(200))
    message = Column(Text)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    data = Column(GenericJSON, nullable=True)  # Store arbitrary JSON like {"old_price": 5000, "new_price": 4500}

    user = relationship("User")
    ad = relationship("Ad")
