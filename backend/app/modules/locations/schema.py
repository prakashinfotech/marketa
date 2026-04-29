from pydantic import BaseModel, Field
from typing import Optional

class StateCreate(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)

class CityCreate(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)
    state_id: int
    is_popular: Optional[bool] = False

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list | None = None
