from pydantic import BaseModel
from typing import Optional, List, Any

class FavoriteCreateRequest(BaseModel):
    ad_uuid: str

class FavoriteResponse(BaseModel):
    success: bool
    msg: str
    data: Optional[Any] = None
