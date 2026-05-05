from pydantic import BaseModel, Field
from typing import Optional, List, Any

class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=150)
    slug: str = Field(..., max_length=170)
    parent_id: Optional[int] = None
    icon_url: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    slug: Optional[str] = Field(None, max_length=170)
    parent_id: Optional[int] = None
    icon_url: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryAttributeCreate(BaseModel):
    category_id: int
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)
    field_type: str = Field(..., max_length=20) # text, number, select, multi_select, boolean
    options: Optional[List[str]] = None
    is_required: Optional[bool] = False
    display_order: Optional[int] = 0

class CategoryAttributeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    slug: Optional[str] = Field(None, max_length=120)
    field_type: Optional[str] = Field(None, max_length=20)
    options: Optional[List[str]] = None
    is_required: Optional[bool] = None
    display_order: Optional[int] = None

class Response(BaseModel):
    success: bool
    msg: str
    data: dict | list | None = None
