from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


class AdCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = None
    price_negotiable: Optional[bool] = False
    condition: Optional[str] = None  # new, like_new, used, refurbished
    ad_type: str = Field(default="sell", max_length=20)  # sell, buy, rent, service
    category_id: int
    city_id: int
    locality: Optional[str] = None


class AdAttributeValueCreate(BaseModel):
    attribute_id: int
    value: str

class AdUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = None
    price_negotiable: Optional[bool] = None
    condition: Optional[str] = None
    ad_type: Optional[str] = None
    category_id: Optional[int] = None
    city_id: Optional[int] = None
    locality: Optional[str] = None

class AdStatusUpdate(BaseModel):
    status: str = Field(..., description="Must be one of: active, sold, inactive, expired")


class AdsByIdsRequest(BaseModel):
    ids: List[int] = Field(..., max_length=20)

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list | None = None
