from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base
from common_models import CommonModelMixin

class ContactMessage(Base, CommonModelMixin):
    __tablename__ = "contact_messages"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)

    # Relationship
    user = relationship("User", backref="contact_messages")
