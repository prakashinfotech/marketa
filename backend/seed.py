"""
Database Seed Script
Populates the database with default States, Cities, Categories, and Category Attributes.
"""

import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
import app.db.base  # Import all models to register relationships

from app.modules.locations.model import State, City
from app.modules.categories.model import Category, CategoryAttribute

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_locations(db: Session):
    logger.info("Seeding locations...")
    
    # Check if already seeded
    if db.query(State).first():
        logger.info("Locations already seeded, skipping.")
        return

    # Seed States
    states_data = [
        {"name": "Maharashtra", "slug": "maharashtra"},
        {"name": "Gujarat", "slug": "gujarat"},
        {"name": "Karnataka", "slug": "karnataka"},
        {"name": "Delhi", "slug": "delhi"}
    ]
    
    db_states = {}
    for data in states_data:
        state = State(**data)
        db.add(state)
        db_states[data["name"]] = state
    
    db.commit()

    # Seed Cities
    cities_data = [
        {"name": "Mumbai", "slug": "mumbai", "state": "Maharashtra", "is_popular": True},
        {"name": "Pune", "slug": "pune", "state": "Maharashtra", "is_popular": True},
        {"name": "Ahmedabad", "slug": "ahmedabad", "state": "Gujarat", "is_popular": True},
        {"name": "Surat", "slug": "surat", "state": "Gujarat", "is_popular": False},
        {"name": "Bangalore", "slug": "bangalore", "state": "Karnataka", "is_popular": True},
        {"name": "New Delhi", "slug": "new-delhi", "state": "Delhi", "is_popular": True},
    ]

    for data in cities_data:
        state_obj = db_states[data["state"]]
        city = City(
            name=data["name"],
            slug=data["slug"],
            state_id=state_obj.id,
            is_popular=data["is_popular"]
        )
        db.add(city)
    
    db.commit()
    logger.info("Locations seeded successfully.")


def seed_categories(db: Session):
    logger.info("Seeding categories...")

    if db.query(Category).first():
        logger.info("Categories already seeded, skipping.")
        return

    # Top-level categories
    categories_data = [
        {"name": "Mobiles", "slug": "mobiles", "icon_url": "📱", "display_order": 1},
        {"name": "Cars & Bikes", "slug": "cars-bikes", "icon_url": "🚗", "display_order": 2},
        {"name": "Electronics", "slug": "electronics", "icon_url": "💻", "display_order": 3},
        {"name": "Real Estate", "slug": "real-estate", "icon_url": "🏠", "display_order": 4},
    ]

    db_categories = {}
    for data in categories_data:
        cat = Category(**data)
        db.add(cat)
        db_categories[data["name"]] = cat
    
    db.commit()

    # Sub-categories
    subcategories_data = [
        {"name": "Mobile Phones", "slug": "mobile-phones", "parent": "Mobiles"},
        {"name": "Tablets", "slug": "tablets", "parent": "Mobiles"},
        {"name": "Cars", "slug": "cars", "parent": "Cars & Bikes"},
        {"name": "Bikes", "slug": "bikes", "parent": "Cars & Bikes"},
        {"name": "Laptops", "slug": "laptops", "parent": "Electronics"},
        {"name": "TVs", "slug": "tvs", "parent": "Electronics"},
    ]

    db_subcategories = {}
    for data in subcategories_data:
        parent_obj = db_categories[data["parent"]]
        cat = Category(
            name=data["name"],
            slug=data["slug"],
            parent_id=parent_obj.id
        )
        db.add(cat)
        db_subcategories[data["name"]] = cat

    db.commit()

    # Dynamic Attributes for specific categories (e.g., Cars)
    car_cat = db_subcategories["Cars"]
    attributes_data = [
        {
            "category_id": car_cat.id,
            "name": "Fuel Type",
            "slug": "fuel-type",
            "field_type": "select",
            "options": ["Petrol", "Diesel", "CNG", "Electric"],
            "is_required": True,
            "display_order": 1
        },
        {
            "category_id": car_cat.id,
            "name": "Transmission",
            "slug": "transmission",
            "field_type": "select",
            "options": ["Manual", "Automatic"],
            "is_required": True,
            "display_order": 2
        },
        {
            "category_id": car_cat.id,
            "name": "Year",
            "slug": "year",
            "field_type": "number",
            "options": None,
            "is_required": True,
            "display_order": 3
        }
    ]

    for data in attributes_data:
        attr = CategoryAttribute(**data)
        db.add(attr)

    db.commit()
    logger.info("Categories and Attributes seeded successfully.")


def run():
    db = SessionLocal()
    try:
        seed_locations(db)
        seed_categories(db)
        logger.info("Database seeding completed successfully! ✅")
    except Exception as e:
        db.rollback()
        logger.error("Error during seeding: %s", str(e))
    finally:
        db.close()


if __name__ == "__main__":
    run()
