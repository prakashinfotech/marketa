from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    chat_room_id: int

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRoomCreate(BaseModel):
    ad_id: int

class ChatRoomResponse(BaseModel):
    id: int
    ad_id: int
    buyer_id: int
    seller_id: int
    last_message_at: Optional[datetime]
    created_at: datetime
    
    # Extra fields for frontend
    ad_title: Optional[str] = None
    ad_image: Optional[str] = None
    other_user_name: Optional[str] = None
    other_user_avatar: Optional[str] = None
    last_message: Optional[str] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
