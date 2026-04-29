import uuid as _uuid
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_mixin


@declarative_mixin
class CommonModelMixin:
    """
    Common mixin for all SQLAlchemy models to provide id, uuid,
    created_at, modified_at, is_delete, and deleted_at fields automatically.

    Usage:
        class YourModel(Base, CommonModelMixin):
            __tablename__ = "your_table"
            # add your custom columns here
    """
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(_uuid.uuid4()))

    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
