"""
Database models for the Locations module.
Contains State and City tables for location-based ad browsing.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class State(Base, CommonModelMixin):
    """
    Represents an Indian state or union territory.
    """
    __tablename__ = "states"

    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)

    # ── Relationships ────────────────────────────────────────────────────────
    cities = relationship("City", back_populates="state", cascade="all, delete-orphan")
  
  
class City(Base, CommonModelMixin):
    """
    Represents a city within a state.
    """
    __tablename__ = "cities"

    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    is_popular = Column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    state = relationship("State", back_populates="cities")
    users = relationship("User", back_populates="city")
    ads = relationship("Ad", back_populates="city")
