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
from app.modules.chatbot import endpoint as chatbot
from app.modules.search_alerts import endpoint as search_alerts
from app.modules.notifications import endpoint as notifications
from app.modules.reports import endpoint as reports

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(ads.router, prefix="/ads", tags=["Ads"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(search_alerts.router, prefix="/alerts", tags=["Search Alerts"])
api_router.include_router(notifications.router, tags=["Notifications"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
