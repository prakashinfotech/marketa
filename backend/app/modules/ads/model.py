"""
Database models for the Ads module.
Contains Ad (main listing), AdImage, and AdAttributeValue tables.
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey,
    Text, Float, DateTime, Numeric,
)
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class Ad(Base, CommonModelMixin):
    """
    Main classifieds listing table.
    Each ad belongs to a user, a category, and a city.
    """
    __tablename__ = "ads"

    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=True)  # nullable for "Contact for price"
    price_negotiable = Column(Boolean, default=False)
    condition = Column(String(20), nullable=True)  # new, like_new, used, refurbished
    ad_type = Column(String(20), nullable=False, default="sell")  # sell, buy, rent, service, job
    status = Column(String(20), nullable=False, default="active")  # draft, active, expired, sold, removed
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    locality = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_premium = Column(Boolean, default=False)
    premium_expiry = Column(DateTime, nullable=True)
    views_count = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)

    # ── Relationships ────────────────────────────────────────────────────────
    user = relationship("User", back_populates="ads")
    category = relationship("Category", back_populates="ads")
    city = relationship("City", back_populates="ads")
    images = relationship("AdImage", back_populates="ad", cascade="all, delete-orphan")
    attribute_values = relationship("AdAttributeValue", back_populates="ad", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="ad", cascade="all, delete-orphan")
    chat_rooms = relationship("ChatRoom", back_populates="ad", cascade="all, delete-orphan")
    reports = relationship("AdReport", back_populates="ad", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="ad")


class AdImage(Base, CommonModelMixin):
    """
    Images attached to an ad.
    First image (display_order=0 or is_primary=True) is the thumbnail.
    """
    __tablename__ = "ad_images"

    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    image_url = Column(String, nullable=False)
    display_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    ad = relationship("Ad", back_populates="images")


class AdAttributeValue(Base, CommonModelMixin):
    """
    Stores dynamic attribute values for each ad.
    Links an ad to a category_attribute with the user-entered value.

    Example: Ad(iPhone 15) → attribute(Storage) → value("128 GB")
    """
    __tablename__ = "ad_attribute_values"

    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    attribute_id = Column(Integer, ForeignKey("category_attributes.id"), nullable=False)
    value = Column(String, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────────
    ad = relationship("Ad", back_populates="attribute_values")
    attribute = relationship("CategoryAttribute", back_populates="ad_values")
