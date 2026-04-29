import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import get_current_user
from . import schema, crud
from app.modules.users.model import User

_logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me/", response_model=schema.FavoriteResponse)
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Returns the list of ads favorited by the logged-in user. """
    try:
        _logger.info("Fetching favorites for user: %s", current_user.id)
        response = crud.favorite.get_my_favorites(db, current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching favorites: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )

@router.post("/toggle/", response_model=schema.FavoriteResponse)
def toggle_favorite(
    payload: schema.FavoriteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Toggles favorite status for an ad. """
    try:
        _logger.info("Toggling favorite for ad: %s, user: %s", payload.ad_uuid, current_user.id)
        response = crud.favorite.toggle_favorite(db, current_user.id, payload.ad_uuid)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error toggling favorite: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )
