"""
Database models for the Chat module.
Contains ChatRoom and Message tables for buyer-seller communication.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class ChatRoom(Base, CommonModelMixin):
    """
    Represents a chat conversation between a buyer and seller about a specific ad.
    Unique constraint on (ad_id, buyer_id) — one chat room per buyer per ad.
    """
    __tablename__ = "chat_rooms"
    __table_args__ = (
        # One chat room per buyer per ad
        {"comment": "unique(ad_id, buyer_id) enforced at application level"},
    )

    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    last_message_at = Column(DateTime, nullable=True)

    # ── Relationships ────────────────────────────────────────────────────────
    ad = relationship("Ad", back_populates="chat_rooms")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="chat_rooms_as_buyer")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="chat_rooms_as_seller")
    messages = relationship("Message", back_populates="chat_room", cascade="all, delete-orphan")


class Message(Base, CommonModelMixin):
    """
    Individual message within a chat room.
    """
    __tablename__ = "messages"

    chat_room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    chat_room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")
