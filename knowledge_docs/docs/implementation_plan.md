# Marketa — Feature Enhancement Implementation Plan

## Current State Analysis

### What Already Exists (Keep As-Is) ✅

| Feature                                          | Backend                                | Frontend                            |
| ------------------------------------------------ | -------------------------------------- | ----------------------------------- |
| User Auth (Super Admin / Admin / User)           | ✅ roles 1,2,3                         | ✅ Login, Signup, Profile           |
| Ad CRUD (create, list, detail)                   | ✅ crud + endpoint                     | ✅ PostAd, SearchResults, AdDetails |
| Categories (tree hierarchy + dynamic attributes) | ✅ Category + CategoryAttribute models | ✅ PostAd uses them                 |
| Locations (States → Cities)                     | ✅ models + CRUD                       | ✅ Dropdowns in PostAd & Search     |
| Buyer-Seller Chat (WebSocket)                    | ✅ ChatRoom + Message                  | ✅ Chat.jsx                         |
| Favorites / Wishlist                             | ✅ Favorite model + toggle             | ✅ Favorites.jsx                    |
| Chatbot (RAG)                                    | ✅ ChromaDB + Groq                     | ✅ ChatBot.jsx                      |
| Reports                                          | ✅ AdReport CRUD + endpoint            | ✅ AdminReports.jsx                 |
| Reviews model                                    | ✅ Review model (no CRUD/endpoint)     | ❌                                  |
| Packages model                                   | ✅ AdPackage model (no CRUD/endpoint)  | ❌                                  |
| SearchAlerts                                     | ✅ Full CRUD + endpoint                | ✅ SearchAlerts.jsx                  |
| Notifications                                    | ✅ Full CRUD + endpoint                | ✅ Notifications.jsx + Navbar badge |
| **Recently Viewed (Server-Synced)**              | ✅ DB model + CRUD + endpoint          | ✅ Homepage section (backend data)  |
| **Email Verification**                           | ✅ request-verify + verify-email       | ✅ VerifyEmail.jsx + Profile banner |
| **Welcome Email (on Signup)**                    | ✅ Auto-sent in create_user            | N/A (backend-only)                  |
| **Forgot Password**                              | ✅ forgot-password endpoint            | ✅ ForgotPassword.jsx               |
| **Reset Password**                               | ✅ reset-password endpoint             | ✅ ResetPassword.jsx                |
| **Change Password**                              | ✅ change-password endpoint            | ✅ Profile.jsx (Change Password)    |
| **Wishlist Change Notifications**                | ✅ Triggers on any ad update           | ✅ Notification feed                |

### What Needs To Be Built 🔨

---

## Phase 1: Category-Specific Dynamic Filters on Search Page

**Goal:** When a user selects "Cars" category, show filters like Fuel Type, KM Driven, Year, Brand — not generic filters from other categories.

### Backend Changes

#### [MODIFY] [endpoint.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/ads/endpoint.py)

- Add a new query parameter `attribute_filters` (JSON string) to `list_ads()`
- Example: `?category_id=5&attribute_filters={"fuel_type":"Petrol","year":"2022"}`

#### [MODIFY] [crud.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/ads/crud.py)

- In `list_active_ads()`, join `AdAttributeValue` table and filter by attribute values when `attribute_filters` is provided
- Only apply attribute filters when a `category_id` is also specified

### Frontend Changes

#### [MODIFY] [SearchResults.jsx](file:///home/parth-prajapati/projects/quikr_copy/frontend/src/components/SearchResults.jsx)

- When user selects a category, fetch `GET /categories/{id}/attributes/` to get that category's specific filters
- Render dynamic filter inputs (dropdowns for `select` type, ranges for `number` type, checkboxes for `boolean` type)
- Hide generic condition/adType filters when inside a specific category
- Apply attribute filters to the search API call
- When category changes or is cleared, reset attribute filters

### Suggested Categories & Their Attributes

| Category                    | Attributes (field_type)                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cars**              | Brand (select), Fuel Type (select: Petrol/Diesel/CNG/Electric), Transmission (select: Manual/Automatic), Year (number), KM Driven (number) |
| **Bikes**             | Brand (select), Year (number), KM Driven (number), Type (select: Sport/Cruiser/Standard)                                                   |
| **Mobiles & Tablets** | Brand (select), RAM (select: 2/4/6/8/12 GB), Storage (select: 32/64/128/256/512 GB), OS (select: Android/iOS)                              |
| **Electronics**       | Type (select: TV/Laptop/Camera/AC), Brand (select), Warranty (boolean)                                                                     |
| **Real Estate**       | Property Type (select: Apartment/House/Villa/Plot), BHK (select: 1/2/3/4+), Furnished (select: Yes/Semi/No), Area (number, sqft)           |
| **Entertainment**     | Type (select: Musical Instruments/Books/Sports), Condition (select)                                                                        |

> [!IMPORTANT]
> These attributes should be seeded via an Alembic migration or a seed script so the admin doesn't have to create them manually.

---

## Phase 2: Email System (COMPLETED ✅)

**Goal:** Full email lifecycle — welcome, verification, forgot/reset password, change password.

### What Was Built

#### Environment & Config
- `.env` — SMTP credentials (Gmail App Password) + `FRONTEND_URL`
- `config.py` — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`, `FRONTEND_URL`

#### Backend: `app/utils/email.py` (Complete Rewrite)
- `_email_wrapper()` — Branded HTML template with Marketa header/footer
- `_send_html_email()` — Core SMTP sender (Gmail STARTTLS)
- `send_verification_email()` — 24hr token link
- `send_welcome_email()` — Post-signup welcome with feature highlights
- `send_forgot_password_email()` — 1hr reset link (red CTA button)
- `send_password_changed_email()` — Confirmation with timestamp

#### Backend: Users Module
- `create_user()` — Modified to auto-send welcome + verification emails
- `forgot_password()` — Generates 1hr reset token, always returns success (prevents email enumeration)
- `reset_password()` — Validates token + `token_version`, sets new password, increments version
- `change_password()` — Verifies old password, prevents reuse, sends confirmation email
- Schemas: `ForgotPasswordRequest`, `ResetPasswordRequest`, `ChangePasswordRequest`
- Endpoints: `POST /users/forgot-password/`, `POST /users/reset-password/`, `POST /users/change-password/`

#### Frontend
- `ForgotPassword.jsx` — Email form with success state
- `ResetPassword.jsx` — Token validation + new password form + auto-redirect
- `Login.jsx` — Added "Forgot Password?" link
- `Profile.jsx` — Added "Change Password" section with expandable form
- `App.jsx` — Routes: `/forgot-password`, `/reset-password`

#### Security
- Email enumeration prevention (forgot-password always returns success)
- Token versioning (reset tokens bound to `token_version`, single-use)
- Password validation (min 6 chars, can't reuse current)
- Token expiry: Verification = 24hrs, Reset = 1hr

---

## Phase 3: Ad Management (Active / Inactive / Edit / Delete)

**Goal:** Users can manage their own ads — mark them as sold/inactive, edit details, or delete them.

### Backend Changes

#### [MODIFY] [endpoint.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/ads/endpoint.py)

- `PUT /ads/{ad_id}/update/` — Owner can update title, description, price, status, etc.
- `PUT /ads/{ad_id}/status/` — Owner can change status (`active`, `sold`, `expired`, `removed`)
- `DELETE /ads/{ad_id}/` — Soft-delete (set `is_delete=True`)
- `GET /ads/me/` already exists — enhance to include status filter param

#### [MODIFY] [crud.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/ads/crud.py)

- `update_ad()` — Update ad fields, re-process images if new ones uploaded
- `change_ad_status()` — Change status with validation (only owner can modify)
- `delete_ad()` — Soft delete

### Frontend Changes

#### [NEW] `frontend/src/components/MyAds.jsx`

- Route: `/my-ads`
- Tabs: **Active** | **Inactive/Sold** | **All**
- Each ad card shows: thumbnail, title, price, views count, status badge, posted date
- Actions per ad: **Edit** | **Mark as Sold** | **Deactivate** | **Delete**
- Edit opens a pre-filled PostAd-like form

---

## Phase 4: Search Alerts & Notifications

**Goal:** Users create alerts for specific search criteria. When matching ads are posted, they get notified.

### Backend Changes

#### [NEW] `backend/app/modules/search_alerts/schema.py`

```python
class SearchAlertCreate(BaseModel):
    keyword: str
    category_id: Optional[int] = None
    city_id: Optional[int] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
```

#### [NEW] `backend/app/modules/search_alerts/crud.py`

- `create_alert()` — Save a new search alert
- `get_user_alerts()` — List all alerts for current user
- `delete_alert()` — Remove an alert
- `toggle_alert()` — Enable/disable an alert
- `check_matching_ads()` — Called after ad creation to find matching alerts (for future notification push)

#### [NEW] `backend/app/modules/search_alerts/endpoint.py`

- `POST /alerts/` — Create alert
- `GET /alerts/me/` — List my alerts
- `PUT /alerts/{id}/toggle/` — Enable/disable
- `DELETE /alerts/{id}/` — Delete alert

### Frontend Changes

#### [NEW] `frontend/src/components/SearchAlerts.jsx`

- Route: `/alerts`
- Form to create alerts: keyword, category dropdown, city dropdown, price range
- List of existing alerts with toggle switches and delete buttons
- "Create Alert" also available from SearchResults page as a quick action

---

## Phase 5: Wishlist Change Tracking & Notifications (COMPLETED ✅)

**Goal:** If any item in user's wishlist has a price change, status change, or any update — show a notification.

### What Was Built

#### Backend: `ads/crud.py` — `update_ad()` Enhancement
- Tracks all modified fields during ad update (price, title, description, images, category, etc.)
- Queries all users who have the ad in their favorites
- Creates a `Notification` for each interested user with specific messages:
  - **Price only changed:** "📉 Price Dropped!" or "📈 Price Changed!"
  - **Other fields changed:** "🔔 Wishlist Item Updated!" with list of changed fields
- Notifications include the ad title and exact fields that changed

#### Backend: Notifications Module (Already Built)
- `GET /notifications/me/` — List user's notifications (paginated)
- `PUT /notifications/{id}/read/` — Mark as read
- `PUT /notifications/read-all/` — Mark all as read
- `GET /notifications/me/unread-count/` — Get unread count (for badge)

#### Frontend
- Navbar bell icon with unread count badge
- `/notifications` page with full notification history
- Click notification to navigate to relevant ad

---

## Phase 5B: Recently Viewed Ads (COMPLETED ✅)

**Goal:** Persist browsing history in the database for cross-device access.

### What Was Built

#### Backend: `recently_viewed` Module
- `RecentlyViewed` model (user_id, ad_id, viewed_at)
- CRUD: record view (upsert), get history (20-ad cap)
- Endpoints: `POST /recently-viewed/` and `GET /recently-viewed/me/`
- Registered in `base.py`, `alembic/env.py`, and `api.py`

#### Frontend
- `AdDetails.jsx` — Syncs each view to backend on page load
- `HomePage.jsx` — Fetches from backend API (for logged-in users)
- Removed legacy localStorage fallback for consistency

---

## Phase 6: Cart & Orders System

**Goal:** Users can add items to cart, place orders, and track order history.

### Backend Changes

#### [NEW] `backend/app/modules/orders/model.py`

```python
class CartItem(Base, CommonModelMixin):
    __tablename__ = "cart_items"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    quantity = Column(Integer, default=1)

class Order(Base, CommonModelMixin):
    __tablename__ = "orders"
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="pending")  # pending, confirmed, shipped, delivered, cancelled
    shipping_address = Column(Text, nullable=True)
  
class OrderItem(Base, CommonModelMixin):
    __tablename__ = "order_items"
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, default=1)
```

#### [NEW] `backend/app/modules/orders/endpoint.py`

- **Cart:** `POST /cart/add/`, `GET /cart/me/`, `DELETE /cart/{item_id}/`, `PUT /cart/{item_id}/`
- **Orders:** `POST /orders/checkout/`, `GET /orders/me/`, `GET /orders/{id}/`, `PUT /orders/{id}/status/` (seller updates)

### Frontend Changes

#### [NEW] `frontend/src/components/Cart.jsx`

- Route: `/cart`
- List of cart items with quantity, price, remove button
- "Proceed to Checkout" button
- Cart icon with badge in Navbar

#### [NEW] `frontend/src/components/Orders.jsx`

- Route: `/orders`
- Tabs: **All** | **Pending** | **Delivered** | **Cancelled**
- Order cards showing: order ID, date, items, total, status badge
- Click to expand and see order details

---

## Phase 7: Inquiries Dashboard

**Goal:** Sellers can see all inquiries (chats initiated) on their ads in one place.

### Backend Changes

#### [MODIFY] [endpoint.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/chat/endpoint.py)

- `GET /chat/inquiries/` — Returns all chat rooms where current user is the seller, grouped by ad
- Include: buyer info, last message, message count, ad title/thumbnail

### Frontend Changes

#### [NEW] `frontend/src/components/Inquiries.jsx`

- Route: `/inquiries`
- Shows all ads that have received inquiries
- Each ad card expands to show list of buyers who inquired
- Click a buyer to open the chat
- Badge showing total unread messages per ad

---

## Phase 8: Admin Enhancements

### Backend Changes

#### [MODIFY] Users endpoint

- `GET /users/admin/list/` — Admin can list all users with filters (verified/unverified, active/inactive)
- `PUT /users/admin/{id}/status/` — Admin can activate/deactivate users
- `GET /ads/admin/list/` — Admin can see all ads (including removed/expired)
- `PUT /ads/admin/{id}/status/` — Admin can force-remove ads

### Frontend Changes

#### [NEW] `frontend/src/components/AdminUsers.jsx`

- Route: `/admin/users`
- Table of all users with: name, email, verified status, role, ad count, join date
- Actions: Verify, Deactivate, Promote to Admin

#### [NEW] `frontend/src/components/AdminAds.jsx`

- Route: `/admin/ads`
- Table of all ads with: title, seller, category, status, reports count, date
- Actions: Remove, Feature, View Reports

---

## Suggested Bonus Features (My Recommendations)

### 1. Ad Expiry & Auto-Deactivation

- Ads automatically expire after 30 days
- Background task (or on-read check) marks expired ads as `status=expired`
- User gets a notification to renew

### 2. Seller Ratings & Reviews (Model already exists!)

- After a chat/transaction, buyer can rate the seller (1-5 stars)
- Seller profile shows average rating and review count
- Build: `reviews/` CRUD + endpoint + frontend component

### 3. Report Ad (Model already exists!)

- Users can flag ads as spam/fraud/offensive
- Admin dashboard shows pending reports
- Build: `reports/` CRUD + endpoint + report button on AdDetails

### 4. Share Ad

- Share button on AdDetails page (copy link, WhatsApp, Twitter)
- Uses Web Share API on mobile

### 5. Recently Viewed Ads

- Store last 20 viewed ad IDs in localStorage
- Show "Recently Viewed" section on homepage

### 6. Similar Ads

- On AdDetails page, show "Similar Ads" — same category, similar price range
- Already have the data, just need a query

### 7. Premium Ad Packages (Model already exists!)

- Users can purchase packages to boost ad visibility
- Featured/Spotlight badge on listings
- Build: `packages/` CRUD + payment integration

---

## Execution Priority (Recommended Order)

| Priority | Phase                              | Effort | Impact                                   | Status |
| -------- | ---------------------------------- | ------ | ---------------------------------------- | ------ |
| 🔴 P0    | Phase 1: Category-Specific Filters | Medium | High — Core UX improvement              | ✅ Done |
| 🔴 P0    | Phase 3: Ad Management             | Medium | High — Users can't manage ads currently | ✅ Done |
| 🟡 P1    | Phase 2: Email System              | Medium | High — Full auth + password lifecycle   | ✅ Done |
| 🟡 P1    | Phase 7: Inquiries Dashboard       | Low    | Medium — Seller experience              | ✅ Done |
| 🟡 P1    | Phase 5: Notifications             | Medium | High — Engagement boost                 | ✅ Done |
| 🟡 P1    | Phase 5B: Recently Viewed          | Low    | Medium — Cross-device browsing history  | ✅ Done |
| 🟢 P2    | Phase 4: Search Alerts             | Medium | Medium — Power user feature             | ✅ Done |
| ⚪ P3    | Phase 6: Cart & Orders             | High   | High — E-commerce capability            | ❌ Removed (classifieds focus) |
| 🟢 P2    | Phase 8: Admin Enhancements        | Medium | Medium — Platform management            | Pending |

---

## Database Migration Strategy

All new models will require Alembic migrations:

```bash
cd backend
alembic revision --autogenerate -m "add notifications and orders tables"
alembic upgrade head
```

## Open Questions (Resolved)

> [!NOTE]
>
> 1. **Email Provider:** ✅ Resolved — Gmail SMTP with an App Password, configured via `SMTP_USER` / `SMTP_PASSWORD` in `.env`
> 2. **Cart & Orders:** ✅ Resolved — Removed. Platform focuses on direct buyer-seller communication (Chat + Phone).
> 3. **Notifications:** ✅ Resolved — Poll-based via API (unread count badge in navbar).
> 4. **Recently Viewed:** ✅ Resolved — Server-synced via PostgreSQL `recently_viewed_ads` table (replaced localStorage).
