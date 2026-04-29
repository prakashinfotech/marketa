"""
API v1 Router — aggregates all module routers under /api/v1.

When you add a new module, register it here:
    from app.modules import your_module
    api_router.include_router(your_module.router, prefix="/your-module", tags=["Your Module"])
"""

from fastapi import APIRouter

from app.modules import users
from app.modules.contact import endpoint as contact
from app.modules.favorites import endpoint as favorites
from app.modules.locations import endpoint as locations
from app.modules.categories import endpoint as categories
from app.modules.ads import endpoint as ads
from app.modules.chat import endpoint as chat

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(ads.router, prefix="/ads", tags=["Ads"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
