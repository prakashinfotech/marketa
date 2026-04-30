"""
Metamodule for model registration.
Import ALL models here so Alembic can detect them for auto-generating migrations.

When you add a new module with a model, import it here:
    from app.modules.your_module.model import YourModel
"""

from app.db.session import Base  # noqa: F401

# ── Users ────────────────────────────────────────────────────────────────────
from app.modules.users.model import User  # noqa: F401

# ── Locations ────────────────────────────────────────────────────────────────
from app.modules.locations.model import State, City  # noqa: F401

# ── Categories ───────────────────────────────────────────────────────────────
from app.modules.categories.model import Category, CategoryAttribute  # noqa: F401

# ── Ads ──────────────────────────────────────────────────────────────────────
from app.modules.ads.model import Ad, AdImage, AdAttributeValue  # noqa: F401

# ── Favorites ────────────────────────────────────────────────────────────────
from app.modules.favorites.model import Favorite  # noqa: F401

# ── Chat ─────────────────────────────────────────────────────────────────────
from app.modules.chat.model import ChatRoom, Message  # noqa: F401

# ── Reviews ──────────────────────────────────────────────────────────────────
from app.modules.reviews.model import Review  # noqa: F401

# ── Reports ──────────────────────────────────────────────────────────────────
from app.modules.reports.model import AdReport  # noqa: F401

# ── Search Alerts ────────────────────────────────────────────────────────────
from app.modules.search_alerts.model import SearchAlert
from app.modules.notifications.model import Notification  # Phase 5  # noqa: F401

# ── Packages ─────────────────────────────────────────────────────
from app.modules.packages.model import AdPackage  # noqa: F401

# ── Chatbot / Knowledge Base ─────────────────────────────────────
from app.modules.chatbot.model import KnowledgeChunk, FAQ  # noqa: F401
