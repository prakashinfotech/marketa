from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class SearchAlertCreate(BaseModel):
    keyword: str = Field(..., max_length=200, description="Keyword to alert on")
    category_id: Optional[int] = Field(None, description="Optional category ID filter")
    city_id: Optional[int] = Field(None, description="Optional city ID filter")
    min_price: Optional[Decimal] = Field(None, ge=0, description="Minimum price")
    max_price: Optional[Decimal] = Field(None, ge=0, description="Maximum price")

class SearchAlertUpdate(BaseModel):
    is_active: bool

class SearchAlertResponse(BaseModel):
    id: int
    keyword: str
    category_id: Optional[int]
    city_id: Optional[int]
    min_price: Optional[Decimal]
    max_price: Optional[Decimal]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list = {}
