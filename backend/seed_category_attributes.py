"""
Seed script: Populates category-specific dynamic attributes (filters).
Run: cd backend && python seed_category_attributes.py

This script is idempotent — running it multiple times won't create duplicates.
It looks up categories by slug and creates attributes only if they don't already exist.
"""

import sys
import os

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Import ALL models so SQLAlchemy relationships resolve correctly
from app.db.session import SessionLocal
from app.modules.categories.model import Category, CategoryAttribute
from app.modules.ads.model import Ad, AdImage, AdAttributeValue
from app.modules.users.model import User
from app.modules.chat.model import ChatRoom, Message
from app.modules.favorites.model import Favorite
from app.modules.reports.model import AdReport
from app.modules.reviews.model import Review
from app.modules.search_alerts.model import SearchAlert
from app.modules.locations.model import *

# ── Define attributes per category slug ──────────────────────────────────────
CATEGORY_ATTRIBUTES = {
    "cars-bikes": [
        {"name": "Vehicle Type", "slug": "vehicle_type", "field_type": "select", "is_required": False, "display_order": 0,
         "options": ["Car", "Bike", "Scooter", "Commercial Vehicle"]},
        {"name": "Brand", "slug": "brand", "field_type": "select", "is_required": False, "display_order": 1,
         "options": ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "MG", "BMW", "Mercedes", "Audi", "Volkswagen", "Hero", "Bajaj", "TVS", "Royal Enfield", "Yamaha", "Suzuki", "KTM", "Kawasaki", "Other"]},
        {"name": "Fuel Type", "slug": "fuel_type", "field_type": "select", "is_required": False, "display_order": 2,
         "options": ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"]},
        {"name": "Transmission", "slug": "transmission", "field_type": "select", "is_required": False, "display_order": 3,
         "options": ["Manual", "Automatic", "AMT", "CVT", "DCT"]},
        {"name": "Year", "slug": "year", "field_type": "number", "is_required": False, "display_order": 4, "options": None},
        {"name": "KM Driven", "slug": "km_driven", "field_type": "number", "is_required": False, "display_order": 5, "options": None},
        {"name": "No. of Owners", "slug": "num_owners", "field_type": "select", "is_required": False, "display_order": 6,
         "options": ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner & above"]},
    ],
    "mobiles": [
        {"name": "Brand", "slug": "brand", "field_type": "select", "is_required": False, "display_order": 1,
         "options": ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google", "Nothing", "Motorola", "Nokia", "Other"]},
        {"name": "RAM", "slug": "ram", "field_type": "select", "is_required": False, "display_order": 2,
         "options": ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"]},
        {"name": "Storage", "slug": "storage", "field_type": "select", "is_required": False, "display_order": 3,
         "options": ["16 GB", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"]},
        {"name": "OS", "slug": "os", "field_type": "select", "is_required": False, "display_order": 4,
         "options": ["Android", "iOS", "Other"]},
    ],
    "electronics": [
        {"name": "Type", "slug": "electronics_type", "field_type": "select", "is_required": False, "display_order": 1,
         "options": ["TV", "Laptop", "Camera", "AC", "Washing Machine", "Refrigerator", "Printer", "Monitor", "Speaker", "Other"]},
        {"name": "Brand", "slug": "brand", "field_type": "select", "is_required": False, "display_order": 2,
         "options": ["Samsung", "LG", "Sony", "Dell", "HP", "Apple", "Lenovo", "Asus", "Whirlpool", "Haier", "Bosch", "Other"]},
        {"name": "Warranty", "slug": "warranty", "field_type": "boolean", "is_required": False, "display_order": 3, "options": None},
    ],
    "real-estate": [
        {"name": "Property Type", "slug": "property_type", "field_type": "select", "is_required": False, "display_order": 1,
         "options": ["Apartment", "House / Villa", "Plot / Land", "PG / Hostel", "Commercial Office", "Commercial Shop", "Farm House"]},
        {"name": "BHK", "slug": "bhk", "field_type": "select", "is_required": False, "display_order": 2,
         "options": ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"]},
        {"name": "Furnished", "slug": "furnished", "field_type": "select", "is_required": False, "display_order": 3,
         "options": ["Fully Furnished", "Semi Furnished", "Unfurnished"]},
        {"name": "Area (sq ft)", "slug": "area_sqft", "field_type": "number", "is_required": False, "display_order": 4, "options": None},
        {"name": "Parking", "slug": "parking", "field_type": "boolean", "is_required": False, "display_order": 5, "options": None},
    ],
}


def seed():
    db = SessionLocal()
    created_count = 0
    skipped_count = 0

    try:
        for cat_slug, attributes in CATEGORY_ATTRIBUTES.items():
            # Find category by slug (case-insensitive)
            category = db.query(Category).filter(Category.slug == cat_slug).first()
            if not category:
                print(f"  ⚠ Category '{cat_slug}' not found in database. Skipping.")
                continue

            print(f"\n📂 Category: {category.name} (id={category.id}, slug={cat_slug})")

            for attr_def in attributes:
                # Check if attribute already exists
                existing = (
                    db.query(CategoryAttribute)
                    .filter(
                        CategoryAttribute.category_id == category.id,
                        CategoryAttribute.slug == attr_def["slug"]
                    )
                    .first()
                )
                if existing:
                    print(f"   ✓ Attribute '{attr_def['name']}' already exists (id={existing.id}). Skipping.")
                    skipped_count += 1
                    continue

                attr = CategoryAttribute(
                    category_id=category.id,
                    name=attr_def["name"],
                    slug=attr_def["slug"],
                    field_type=attr_def["field_type"],
                    options=attr_def["options"],
                    is_required=attr_def["is_required"],
                    display_order=attr_def["display_order"],
                )
                db.add(attr)
                print(f"   ✚ Created attribute: {attr_def['name']} ({attr_def['field_type']})")
                created_count += 1

        db.commit()
        print(f"\n{'='*50}")
        print(f"✅ Done! Created: {created_count}, Skipped: {skipped_count}")
        print(f"{'='*50}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding category attributes...")
    seed()
