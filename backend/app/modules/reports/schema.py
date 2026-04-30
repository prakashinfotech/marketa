from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class Response(BaseModel):
    success: bool
    data: Optional[Any] = None
    msg: Optional[str] = None

class ReportCreate(BaseModel):
    ad_id: int
    reason: str = Field(..., description="E.g., spam, fraud, offensive, duplicate, other")
    description: Optional[str] = None

class ReportStatusUpdate(BaseModel):
    status: str = Field(..., description="E.g., reviewed, resolved")

class ReportResponse(BaseModel):
    id: int
    ad_id: int
    reporter_id: int
    reason: str
    description: Optional[str]
    status: str
    created_at: datetime
    
    # Enrichment fields
    ad_title: Optional[str] = None
    reporter_name: Optional[str] = None

    class Config:
        from_attributes = True
