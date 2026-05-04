# QuikrClone — Build Order (Step-by-Step Session Plan)

> Exact prompts to give Claude for each session. Follow this order precisely.

---

## Phase 1: Project Initialization

### Session 1: Backend Skeleton
```
Read all claude_skills/ files (01 through 12).

Initialize the backend:
1. Create the project structure from 03_ARCHITECTURE.md
2. Set up main.py with FastAPI, CORS, rate limiting, static files
3. Create common_models.py with CommonModelMixin
4. Create app/core/config.py with all settings from 02_TECH_STACK.md
5. Create app/core/security.py with password hashing + JWT functions
6. Create app/core/roles.py with RoleConstants
7. Create app/db/session.py, app/db/deps.py, app/db/base.py
8. Create app/api/deps.py with AuthService + RBAC
9. Create app/api/v1/api.py (empty router for now)
10. Create app/utils/email.py with the complete email system from 10_EMAIL_SYSTEM.md
11. Set up Alembic configuration
12. Create pyproject.toml with all dependencies from 02_TECH_STACK.md
```

### Session 2: Frontend Skeleton
```
Initialize the frontend:
1. Create Vite + React project with Tailwind CSS
2. Set up index.css with the complete design system from 11_DESIGN_SYSTEM.md
3. Create src/api.js with Axios + JWT interceptor
4. Create src/AuthContext.jsx
5. Create src/App.jsx with all routes from 09_UI_COMPONENTS.md
6. Create placeholder Navbar and Footer
7. Set up vite.config.js with API proxy to port 8000
8. Install all frontend dependencies from 02_TECH_STACK.md
```

---

## Phase 2: Core Backend Modules

### Session 3: Users Module
```
Following 04_BACKEND_RULES.md, build the Users module:
- Model: User table from 06_DATABASE_SCHEMA.md
- Full registration with email + password
- JWT login with access + refresh tokens
- Token versioning for password change invalidation
- Profile management (update, avatar upload)
- Email verification flow (token-based, 24hr expiry)
- Forgot password + reset password flow (1hr token)
- Change password (from profile, requires old password)
- Account deletion (request code → confirm with code → soft-delete + anonymize)
- Register in all 3 places (api.py, base.py, alembic/env.py)
- Run migration
```

### Session 4: Categories + Locations Modules
```
Build two modules following 04_BACKEND_RULES.md:

Categories module:
- Category model with self-referential parent_id
- CategoryAttribute model
- List categories (returns nested tree)
- Create category (admin)
- List/create attributes (admin)
- Get attributes by category (public)

Locations module:
- State and City models
- List states, list cities by state, list popular cities
- Create state/city (admin)

Register both in all 3 places. Run migration.
Create seed scripts for initial categories + locations.
```

### Session 5: Ads Module
```
Build the Ads module following 04_BACKEND_RULES.md:
- Ad model with images, attribute values from 06_DATABASE_SCHEMA.md
- Create ad (FormData with images, attribute_values)
- List/search ads (keyword, category, price range, condition, attributes, sort, pagination)
- Get single ad (with images, attributes, seller info)
- Update ad (FormData, ownership check)
- Delete ad (soft-delete, ownership check)
- Increment view count (atomic)
- Get similar ads (same category, ±50% price, max 6)
- Get my ads (with status filter)
- Change ad status (active/sold/inactive)
- Image storage in uploads/users/{user_id}/ads/{ad_id}/
- Wishlist notification trigger on ad update (notify all favoriting users)
Register + migrate.
```

### Session 6: Chat + Favorites + Notifications
```
Build three modules following 04_BACKEND_RULES.md:

Chat module:
- ChatRoom and Message models
- WebSocket endpoint for real-time messaging
- Create/get room by ad_id
- List rooms with last message + unread count
- Message history per room

Favorites module:
- Favorite model with UniqueConstraint(user_id, ad_id)
- Toggle favorite (add/remove)
- List favorites
- List favorite IDs (for heart sync)

Notifications module:
- Notification model
- List notifications
- Unread count
- Mark as read
- Create notification (called by other modules)

Register all + migrate.
```

### Session 7: Chatbot + Knowledge Base + Supporting Modules
```
Build remaining modules:

Chatbot module:
- FAQ model + KnowledgeChunk model (pgvector)
- Multi-layer response: DB FAQs → Static FAQs → RAG → Chitchat → Groq LLM
- Document upload + chunking + embedding
- FAQ CRUD (admin)
- Document list/delete (admin)

Search Alerts module:
- SearchAlert model
- CRUD for alerts
- Toggle active/inactive
- Check logic on ad creation

Reports module:
- AdReport model
- Create report (user)
- List + manage (admin)

Contact module:
- ContactInquiry model
- Submit form (public)
- List (admin)

Recently Viewed module:
- RecentlyViewed model with UniqueConstraint
- Record view (upsert, cap 20)
- List recently viewed ads

Register all + migrate.
```

---

## Phase 3: Frontend Components

### Session 8: Auth Pages
```
Following 05_FRONTEND_RULES.md and 11_DESIGN_SYSTEM.md, build:
- Login.jsx (email, password, forgot password link)
- Signup.jsx (name, username, email, password, no auto-login)
- ForgotPassword.jsx (email field, always success message)
- ResetPassword.jsx (token from URL, new password + confirm)
- VerifyEmail.jsx (auto-submit token from URL)
```

### Session 9: Navbar + Footer + HomePage
```
Build core layout:
- Navbar.jsx (logged in/out states, admin badge, unread badges)
- Footer.jsx (links: about, contact, terms, privacy)
- HomePage.jsx (hero search, category grid, fresh ads, recently viewed, how it works, testimonials)
- ScrollToTop.js
```

### Session 10: Search + Ad Details
```
Build discovery pages:
- SearchResults.jsx (sidebar filters, attribute filters, sort, chips, pagination, ad cards with heart + attribute tags)
- AdDetails.jsx (image carousel, price, attributes, seller panel, chat/phone/share/report, similar ads, session-based view count)
```

### Session 11: Ad Management
```
Build seller pages:
- PostAd.jsx (create + edit mode, dynamic attributes, image upload with preview, validation from 12_SECURITY_AND_VALIDATION.md)
- MyAds.jsx (status tabs, edit/deactivate/sold/delete actions, custom modals)
```

### Session 12: Communication Pages
```
Build:
- Chat.jsx (room list, message area, WebSocket, real-time)
- ChatBot.jsx (floating widget, FAQ chips, markdown rendering)
- SellerInquiries.jsx (grouped by ad, mark as sold)
```

### Session 13: Profile + Supporting Pages
```
Build:
- Profile.jsx (avatar, info, verification, change password, delete account, all custom modals)
- Favorites.jsx (grid, toggle heart)
- Notifications.jsx (list with timestamps)
- SearchAlerts.jsx (create form, list with toggle/delete, custom modals)
```

### Session 14: Admin Panel
```
Build:
- AdminLayout.jsx (sidebar, outlet, breadcrumbs, admin guard)
- AdminInquiries.jsx (contact form submissions)
- AdminLocations.jsx (states + cities CRUD)
- AdminCategories.jsx (category tree, add category/attribute)
- AdminReports.jsx (report list, resolve/dismiss)
- AdminFAQs.jsx (CRUD, toggle active, custom modals)
- AdminKnowledgeBase.jsx (drag-drop upload, document list, delete, custom modals)
```

### Session 15: Static Pages
```
Build:
- About.jsx
- Contact.jsx (form with submission)
- ServicesPage.jsx
- TermsOfUse.jsx
- PrivacyPolicy.jsx
```

---

## Phase 4: Integration & Polish

### Session 16: Wiring + Testing
```
1. Verify all routes in App.jsx are connected
2. Test all positive test cases from 13_TEST_CASES.md
3. Test all negative test cases
4. Fix any broken flows
5. Ensure all browser alerts replaced with custom modals
6. Verify file size limits on all upload points
```

### Session 17: Seed Data + Demo Setup
```
1. Create/update seed scripts for demo data
2. Seed admin user with create_admin.py
3. Seed categories with icons
4. Seed locations (states + cities)
5. Seed category attributes
6. Seed demo ads with images
```

### Session 18: Final Polish
```
1. Mobile responsiveness audit (all pages)
2. Loading states audit (spinners on all data fetches)
3. Error handling audit (no blank screens on API failure)
4. Performance: lazy loading images, pagination limits
5. SEO: proper page titles, meta descriptions
6. Accessibility: alt text, ARIA labels, keyboard navigation
```

---

## Important Notes

1. **Module order matters** — Users must be built first (auth dependency)
2. **Always run migration** after creating any model
3. **Always register in 3 places** — forgetting any one breaks the module
4. **Test each module** before moving to the next
5. **Frontend depends on backend** — build backend modules before their frontend counterparts
