"""
Database models for the Categories module.
Contains Category (self-referencing hierarchy) and CategoryAttribute
(dynamic form fields per category).
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

from app.db.session import Base
from common_models import CommonModelMixin


class Category(Base, CommonModelMixin):
    """
    Represents a product/service category.
    Self-referencing: parent_id points to another Category row to build a tree.

    Example hierarchy:
        Cars & Bikes (parent_id=null)
          ├── Cars (parent_id=1)
          └── Bikes (parent_id=1)
    """
    __tablename__ = "categories"

    name = Column(String(150), nullable=False, index=True)
    slug = Column(String(170), nullable=False, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    icon_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # ── Relationships ────────────────────────────────────────────────────────
    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent", cascade="all, delete-orphan")
    attributes = relationship("CategoryAttribute", back_populates="category", cascade="all, delete-orphan")
    ads = relationship("Ad", back_populates="category")


class CategoryAttribute(Base, CommonModelMixin):
    """
    Dynamic form fields per category.
    For example, 'Fuel Type' (select) for Cars, 'RAM' (select) for Mobiles.

    field_type can be: text, number, select, multi_select, boolean
    options stores JSON array for select/multi_select, e.g. ["Petrol", "Diesel", "CNG"]
    """
    __tablename__ = "category_attributes"

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), nullable=False)
    field_type = Column(String(20), nullable=False, default="text")  # text, number, select, multi_select, boolean
    options = Column(JSON, nullable=True)  # e.g. ["Petrol", "Diesel", "CNG"]
    is_required = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    # ── Relationships ────────────────────────────────────────────────────────
    category = relationship("Category", back_populates="attributes")
    ad_values = relationship("AdAttributeValue", back_populates="attribute")
