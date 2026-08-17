# Marketa — Architecture & Project Structure

## Complete Directory Tree

```
quikr_copy/
├── .env                              # Environment variables (shared by backend)
├── CLAUDE.md                         # Project rules for Claude (auto-loaded)
├── claude_skills/                    # This folder — all skill files
│
├── backend/
│   ├── main.py                       # FastAPI app entry point
│   ├── common_models.py              # SharedMixin: id, uuid, timestamps, soft-delete
│   ├── pyproject.toml                # Python dependencies (managed by uv)
│   ├── alembic.ini                   # Alembic config
│   ├── create_admin.py               # Script to create admin user
│   ├── seed.py                       # Seed locations + categories
│   ├── seed_category_attributes.py   # Seed dynamic attributes
│   ├── seed_dummy_data.py            # Seed demo ads with images
│   │
│   ├── alembic/
│   │   ├── env.py                    # Migration env (imports ALL models)
│   │   ├── script.py.mako            # Migration template
│   │   └── versions/                 # Generated migration files
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   │
│   │   ├── core/                     # Application-wide config
│   │   │   ├── config.py             # Settings (pydantic-settings, loads .env)
│   │   │   ├── security.py           # Password hashing, JWT creation
│   │   │   └── roles.py              # Role constants: SUPER_ADMIN=1, ADMIN=2, USER=3
│   │   │
│   │   ├── db/                       # Database layer
│   │   │   ├── session.py            # Engine, SessionLocal, Base
│   │   │   ├── base.py               # Model registry (import ALL models here)
│   │   │   └── deps.py               # get_db() dependency
│   │   │
│   │   ├── api/                      # API layer
│   │   │   ├── deps.py               # AuthService, get_current_user, get_current_admin_user
│   │   │   └── v1/
│   │   │       └── api.py            # Central router — register ALL module routers
│   │   │
│   │   ├── modules/                  # Feature modules (one folder per domain)
│   │   │   ├── users/                # Auth, profile, password, email verification, account deletion
│   │   │   ├── ads/                  # Ad CRUD, images, search, similar ads, view count
│   │   │   ├── categories/           # Category tree + dynamic attributes
│   │   │   ├── locations/            # State → City hierarchy
│   │   │   ├── chat/                 # WebSocket rooms + messages
│   │   │   ├── chatbot/              # FAQ, RAG (pgvector), Groq LLM
│   │   │   ├── favorites/            # Toggle favorite, list favorites
│   │   │   ├── notifications/        # System notifications (price changes, wishlist updates)
│   │   │   ├── search_alerts/        # Save search criteria, trigger on new ads
│   │   │   ├── reports/              # Ad reporting (spam, fraud, etc.)
│   │   │   ├── reviews/              # Seller reviews
│   │   │   ├── contact/              # Public contact form submissions
│   │   │   ├── packages/             # Premium ad packages (placeholder)
│   │   │   └── recently_viewed/      # Server-synced browsing history
│   │   │
│   │   └── utils/                    # Shared utilities
│   │       ├── logger.py             # Centralized logging
│   │       └── email.py              # SMTP email sender + branded HTML templates
│   │
│   └── uploads/                      # File uploads (avatars, ad images)
│       ├── avatars/                  # User profile pictures
│       └── users/{user_id}/ads/{ad_id}/  # Per-ad image storage
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js                # Vite config with API proxy
│   ├── tailwind.config.js            # Tailwind config
│   ├── postcss.config.js             # PostCSS config
│   ├── index.html                    # HTML entry point
│   │
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Router + layout definitions
│       ├── AuthContext.jsx           # Auth context provider (token, user, login, logout)
│       ├── api.js                    # Axios instance with JWT interceptor + refresh logic
│       ├── index.css                 # Design system (Tailwind layers + custom components)
│       │
│       └── components/               # All React components (flat structure)
│           ├── Navbar.jsx
│           ├── Footer.jsx
│           ├── HomePage.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Profile.jsx
│           ├── PostAd.jsx
│           ├── MyAds.jsx
│           ├── SearchResults.jsx
│           ├── AdDetails.jsx
│           ├── Chat.jsx
│           ├── ChatBot.jsx
│           ├── Favorites.jsx
│           ├── Notifications.jsx
│           ├── SearchAlerts.jsx
│           ├── SellerInquiries.jsx
│           ├── AdminLayout.jsx
│           ├── AdminInquiries.jsx
│           ├── AdminLocations.jsx
│           ├── AdminCategories.jsx
│           ├── AdminReports.jsx
│           ├── AdminFAQs.jsx
│           ├── AdminKnowledgeBase.jsx
│           ├── ForgotPassword.jsx
│           ├── ResetPassword.jsx
│           ├── VerifyEmail.jsx
│           ├── About.jsx
│           ├── Contact.jsx
│           ├── ServicesPage.jsx
│           ├── TermsOfUse.jsx
│           ├── PrivacyPolicy.jsx
│           └── ScrollToTop.js
│
└── knowledge_docs/                   # Uploaded RAG documents (physical files)
```

---

## Backend Module Pattern (MANDATORY)

Every backend feature module lives in `backend/app/modules/<name>/` with **exactly 5 files**:

| File | Purpose | Naming Convention |
|------|---------|-------------------|
| `__init__.py` | Exports `router` and CRUD instance | — |
| `model.py` | SQLAlchemy model(s) | Class: `User`, Table: `users` |
| `schema.py` | Pydantic request/response schemas | `CreateAdRequest`, `Response` |
| `crud.py` | Business logic (class-based) | Class: `AdCRUD`, Instance: `ad` |
| `endpoint.py` | FastAPI router (thin controller) | Functions: `create_ad()`, `list_ads()` |

### Registration Checklist (3 places)

When creating a new module, you **MUST** register it in all 3 places:

1. **`app/api/v1/api.py`** — Add router:
```python
from app.modules.new_module import endpoint as new_module
api_router.include_router(new_module.router, prefix="/new-module", tags=["New Module"])
```

2. **`app/db/base.py`** — Import model:
```python
from app.modules.new_module.model import NewModel  # noqa: F401
```

3. **`alembic/env.py`** — Import model:
```python
from app.modules.new_module import model as new_module_model
```

Then run:
```bash
alembic revision --autogenerate -m "add new_module table"
alembic upgrade head
```

---

## Frontend Architecture

### Key Files

| File | Purpose |
|------|---------|
| `App.jsx` | Defines ALL routes. Public routes use `<PublicLayout>` (Navbar+Footer+ChatBot). Admin routes use `<AdminLayout>`. |
| `AuthContext.jsx` | React Context providing `{user, token, login, logout, isLoggedIn}`. Stores JWT in `sessionStorage`. |
| `api.js` | Axios instance. Auto-attaches JWT. Has refresh token interceptor on 401. |
| `index.css` | Tailwind layers + custom `@layer components` classes (`.card`, `.btn-primary`, `.input-field`, etc.) |

### Routing Structure

```
/ → PublicLayout → HomePage
/login → Login
/signup → Signup
/profile → Profile
/post-ad → PostAd (create)
/edit-ad/:id → PostAd (edit mode)
/my-ads → MyAds
/search → SearchResults
/ad/:id → AdDetails
/chat → Chat
/favorites → Favorites
/inquiries → SellerInquiries
/alerts → SearchAlerts
/notifications → Notifications
/verify → VerifyEmail
/forgot-password → ForgotPassword
/reset-password → ResetPassword
/about, /contact, /services, /terms, /privacy → Static pages

/admin → AdminLayout (sidebar)
  /admin/inquiries → AdminInquiries
  /admin/locations → AdminLocations
  /admin/categories → AdminCategories
  /admin/reports → AdminReports
  /admin/faqs → AdminFAQs
  /admin/knowledge-base → AdminKnowledgeBase
```

---

## CommonModelMixin

Every SQLAlchemy model inherits from this mixin. It provides:

```python
@declarative_mixin
class CommonModelMixin:
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
```

**Rule:** Use soft-delete (`is_delete=True`) instead of hard `DELETE`. Always filter: `.filter(Model.is_delete.isnot(True))`.
