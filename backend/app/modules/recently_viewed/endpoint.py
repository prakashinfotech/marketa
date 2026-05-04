"""
FastAPI endpoints for Recently Viewed Ads.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.modules.users.endpoint import get_current_user
from app.modules.users.model import User
from app.modules.ads.model import Ad
from app.modules.recently_viewed import crud, schema

router = APIRouter()

@router.post("/", response_model=dict)
def add_recently_viewed(
    req: schema.AddRecentlyViewedReq,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add an ad to the user's recently viewed history.
    """
    ad = db.query(Ad).filter(Ad.uuid == req.ad_uuid, Ad.is_delete == False).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
        
    crud.add_recently_viewed(db, current_user.id, ad.id)
    return {"success": True, "message": "Ad added to recently viewed"}


@router.get("/me/", response_model=dict)
def get_recently_viewed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the user's recently viewed ads.
    """
    data = crud.get_recently_viewed(db, current_user.id)
    return {"success": True, "data": data}


@router.delete("/", response_model=dict)
def clear_recently_viewed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Clear all recently viewed ads for the user.
    """
    crud.clear_recently_viewed(db, current_user.id)
    return {"success": True, "message": "Recently viewed history cleared"}
