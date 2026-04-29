import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.modules.locations.model import State, City
from app.modules.locations import schema

_logger = logging.getLogger(__name__)

class LocationCRUD:
    def get_all_states(self, db: Session):
        try:
            states = db.query(State).all()
            data = [{"id": s.id, "name": s.name, "slug": s.slug} for s in states]
            return {"success": True, "msg": "States fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching states: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_cities_by_state(self, db: Session, state_id: int):
        try:
            cities = db.query(City).filter(City.state_id == state_id).all()
            data = [{"id": c.id, "name": c.name, "slug": c.slug, "is_popular": c.is_popular} for c in cities]
            return {"success": True, "msg": "Cities fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching cities for state {state_id}: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_popular_cities(self, db: Session):
        try:
            cities = db.query(City).filter(City.is_popular == True).all()
            data = [{"id": c.id, "name": c.name, "slug": c.slug, "state_id": c.state_id} for c in cities]
            return {"success": True, "msg": "Popular cities fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching popular cities: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def create_state(self, db: Session, payload: schema.StateCreate):
        try:
            state = State(name=payload.name, slug=payload.slug)
            db.add(state)
            db.commit()
            db.refresh(state)
            return {"success": True, "msg": "State created.", "data": {"id": state.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating state: {e}")
            return {"success": False, "msg": "Database error or duplicate.", "data": None}

    def create_city(self, db: Session, payload: schema.CityCreate):
        try:
            city = City(
                name=payload.name, 
                slug=payload.slug, 
                state_id=payload.state_id, 
                is_popular=payload.is_popular
            )
            db.add(city)
            db.commit()
            db.refresh(city)
            return {"success": True, "msg": "City created.", "data": {"id": city.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating city: {e}")
            return {"success": False, "msg": "Database error or duplicate.", "data": None}

location = LocationCRUD()
