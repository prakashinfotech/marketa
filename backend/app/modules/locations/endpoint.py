import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_admin_user
from . import schema, crud

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get("/states/", response_model=schema.Response)
def list_states(db: Session = Depends(get_db)):
    """List all states."""
    try:
        _logger.info("Fetching all states")
        response = crud.location.get_all_states(db=db)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching states: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.get("/states/{state_id}/cities/", response_model=schema.Response)
def list_cities_by_state(state_id: int, db: Session = Depends(get_db)):
    """List cities in a specific state."""
    try:
        _logger.info("Fetching cities for state_id: %s", state_id)
        response = crud.location.get_cities_by_state(db=db, state_id=state_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching cities: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.get("/cities/popular/", response_model=schema.Response)
def list_popular_cities(db: Session = Depends(get_db)):
    """List popular cities for the homepage."""
    try:
        _logger.info("Fetching popular cities")
        response = crud.location.get_popular_cities(db=db)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching popular cities: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.post("/states/", response_model=schema.Response)
def create_state(
    payload: schema.StateCreate, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin_user)
):
    """Create a new state (Admin only)."""
    try:
        _logger.info("Create state request for: %s", payload.name)
        response = crud.location.create_state(db=db, payload=payload)
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error creating state: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/cities/", response_model=schema.Response)
def create_city(
    payload: schema.CityCreate, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin_user)
):
    """Create a new city (Admin only)."""
    try:
        _logger.info("Create city request for: %s", payload.name)
        response = crud.location.create_city(db=db, payload=payload)
        return JSONResponse(
            status_code=201 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error creating city: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.get("/cities/", response_model=schema.Response)
def list_all_cities(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    """List all cities (Admin only)."""
    try:
        _logger.info("Fetching all cities for admin")
        response = crud.location.get_all_cities(db=db)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Unexpected error fetching all cities: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": []},
        )


@router.put("/states/{state_id}", response_model=schema.Response)
def update_state(
    state_id: int,
    payload: schema.StateUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    """Update a state (Admin only)."""
    try:
        _logger.info("Update state request for id: %s", state_id)
        response = crud.location.update_state(db=db, state_id=state_id, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Unexpected error updating state: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.delete("/states/{state_id}", response_model=schema.Response)
def delete_state(
    state_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    """Delete a state (Admin only)."""
    try:
        _logger.info("Delete state request for id: %s", state_id)
        response = crud.location.delete_state(db=db, state_id=state_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Unexpected error deleting state: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.put("/cities/{city_id}", response_model=schema.Response)
def update_city(
    city_id: int,
    payload: schema.CityUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    """Update a city (Admin only)."""
    try:
        _logger.info("Update city request for id: %s", city_id)
        response = crud.location.update_city(db=db, city_id=city_id, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Unexpected error updating city: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.delete("/cities/{city_id}", response_model=schema.Response)
def delete_city(
    city_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    """Delete a city (Admin only)."""
    try:
        _logger.info("Delete city request for id: %s", city_id)
        response = crud.location.delete_city(db=db, city_id=city_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response,
        )
    except Exception as e:
        _logger.exception("Unexpected error deleting city: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

