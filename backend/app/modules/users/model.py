"""
Database model for the User entity.
Extended with phone, avatar, city, and verification fields for classifieds platform.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class User(Base, CommonModelMixin):
    """
    Represents a user in the system.
    Inherits id, uuid, created_at, modified_at, is_delete, deleted_at from CommonModelMixin.
    """
    __tablename__ = "users"

    name = Column(String, nullable=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String(15), unique=True, nullable=True, index=True)
    avatar = Column(String, nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    token_version = Column(Integer, default=0)
    role_id = Column(Integer, nullable=False, default=3)

    # ── Relationships ────────────────────────────────────────────────────────
    city = relationship("City", back_populates="users")
    ads = relationship("Ad", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    chat_rooms_as_buyer = relationship("ChatRoom", foreign_keys="ChatRoom.buyer_id", back_populates="buyer")
    chat_rooms_as_seller = relationship("ChatRoom", foreign_keys="ChatRoom.seller_id", back_populates="seller")
    sent_messages = relationship("Message", back_populates="sender")
    reviews_written = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewed_user_id", back_populates="reviewed_user")
    reports_filed = relationship("AdReport", back_populates="reporter")
    search_alerts = relationship("SearchAlert", back_populates="user", cascade="all, delete-orphan")
