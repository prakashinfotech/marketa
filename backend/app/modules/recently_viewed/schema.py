"""
Pydantic schemas for Recently Viewed Ads.
"""

from pydantic import BaseModel


class AddRecentlyViewedReq(BaseModel):
    ad_uuid: str


class RecentlyViewedRes(BaseModel):
    id: int
    uuid: str
    ad_uuid: str
    title: str
    price: float | None
    image: str | None
    city: str | None
    locality: str | None

    class Config:
        from_attributes = True
