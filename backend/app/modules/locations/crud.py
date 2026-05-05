import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.modules.locations.model import State, City
from app.modules.locations import schema

_logger = logging.getLogger(__name__)

class LocationCRUD:
    def get_all_states(self, db: Session):
        _logger.info("Fetching all states")
        try:
            states = db.query(State).all()
            data = [{"id": s.id, "name": s.name, "slug": s.slug} for s in states]
            return {"success": True, "msg": "States fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching states: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_cities_by_state(self, db: Session, state_id: int):
        _logger.info(f"Fetching cities for state_id={state_id}")
        try:
            cities = db.query(City).filter(City.state_id == state_id).all()
            data = [{"id": c.id, "name": c.name, "slug": c.slug, "is_popular": c.is_popular} for c in cities]
            return {"success": True, "msg": "Cities fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching cities for state {state_id}: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_popular_cities(self, db: Session):
        _logger.info("Fetching popular cities")
        try:
            cities = db.query(City).filter(City.is_popular == True).all()
            data = [{"id": c.id, "name": c.name, "slug": c.slug, "state_id": c.state_id} for c in cities]
            return {"success": True, "msg": "Popular cities fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching popular cities: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def create_state(self, db: Session, payload: schema.StateCreate):
        _logger.info(f"Creating state: {payload.name}")
        try:
            state = State(name=payload.name, slug=payload.slug)
            db.add(state)
            db.commit()
            db.refresh(state)
            _logger.info(f"State created successfully: id={state.id}, name={state.name}")
            return {"success": True, "msg": "State created.", "data": {"id": state.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating state: {e}")
            return {"success": False, "msg": "Database error or duplicate.", "data": None}

    def create_city(self, db: Session, payload: schema.CityCreate):
        _logger.info(f"Creating city '{payload.name}' for state_id={payload.state_id}")
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
            _logger.info(f"City created successfully: id={city.id}, name={city.name}")
            return {"success": True, "msg": "City created.", "data": {"id": city.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating city: {e}")
            return {"success": False, "msg": "Database error or duplicate.", "data": None}

    def update_state(self, db: Session, state_id: int, payload: schema.StateUpdate):
        _logger.info(f"Updating state_id={state_id}")
        try:
            state = db.query(State).filter(State.id == state_id).first()
            if not state:
                return {"success": False, "msg": "State not found.", "data": None}
            
            update_data = payload.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(state, key, value)
            
            db.commit()
            db.refresh(state)
            return {"success": True, "msg": "State updated.", "data": {"id": state.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error updating state {state_id}: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

    def delete_state(self, db: Session, state_id: int):
        _logger.info(f"Deleting state_id={state_id}")
        try:
            state = db.query(State).filter(State.id == state_id).first()
            if not state:
                return {"success": False, "msg": "State not found.", "data": None}
            
            db.delete(state)
            db.commit()
            return {"success": True, "msg": "State deleted.", "data": None}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error deleting state {state_id}: {e}")
            return {"success": False, "msg": "Database error. Check for dependencies.", "data": None}

    def get_all_cities(self, db: Session):
        _logger.info("Fetching all cities for admin")
        try:
            cities = db.query(City).all()
            data = [
                {
                    "id": c.id, 
                    "name": c.name, 
                    "slug": c.slug, 
                    "state_id": c.state_id,
                    "is_popular": c.is_popular,
                    "state_name": c.state.name if c.state else "Unknown"
                } for c in cities
            ]
            return {"success": True, "msg": "Cities fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching all cities: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def update_city(self, db: Session, city_id: int, payload: schema.CityUpdate):
        _logger.info(f"Updating city_id={city_id}")
        try:
            city = db.query(City).filter(City.id == city_id).first()
            if not city:
                return {"success": False, "msg": "City not found.", "data": None}
            
            update_data = payload.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(city, key, value)
            
            db.commit()
            db.refresh(city)
            return {"success": True, "msg": "City updated.", "data": {"id": city.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error updating city {city_id}: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

    def delete_city(self, db: Session, city_id: int):
        _logger.info(f"Deleting city_id={city_id}")
        try:
            city = db.query(City).filter(City.id == city_id).first()
            if not city:
                return {"success": False, "msg": "City not found.", "data": None}
            
            db.delete(city)
            db.commit()
            return {"success": True, "msg": "City deleted.", "data": None}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error deleting city {city_id}: {e}")
            return {"success": False, "msg": "Database error. Check for dependencies.", "data": None}

location = LocationCRUD()
