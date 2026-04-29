from pydantic import BaseModel, EmailStr
from typing import Optional, Any

class ContactCreateRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(BaseModel):
    success: bool
    msg: str
    data: Optional[Any] = None
