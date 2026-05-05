from pydantic import BaseModel, Field
from typing import Optional

class StateCreate(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)

class StateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    slug: Optional[str] = Field(None, max_length=120)

class CityCreate(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)
    state_id: int
    is_popular: Optional[bool] = False

class CityUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    slug: Optional[str] = Field(None, max_length=120)
    state_id: Optional[int] = None
    is_popular: Optional[bool] = None

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list | None = None
