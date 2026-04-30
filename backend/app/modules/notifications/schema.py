from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    type: Optional[str]
    title: Optional[str]
    message: Optional[str]
    ad_id: Optional[int]
    is_read: bool
    data: Optional[Any]
    created_at: datetime

    class Config:
        orm_mode = True

class NotificationCountResponse(BaseModel):
    unread_count: int

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list | int = {}
