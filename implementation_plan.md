# QuikrClone — Feature Enhancement Implementation Plan

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
| Reports model                                    | ✅ AdReport model (no CRUD/endpoint)   | ❌                                  |
| Reviews model                                    | ✅ Review model (no CRUD/endpoint)     | ❌                                  |
| Packages model                                   | ✅ AdPackage model (no CRUD/endpoint)  | ❌                                  |
| SearchAlert model                                | ✅ model exists (no CRUD/endpoint)     | ❌                                  |

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

## Phase 2: Email Verification System

**Goal:** Unverified users can click "Verify Account" → receive an email with a verification link → clicking it marks them as verified.

### Backend Changes

#### [MODIFY] [config.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/core/config.py)

- Add SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`

#### [NEW] `backend/app/utils/email.py`

- `send_verification_email(email, token)` — Sends an HTML email with a verification link
- Uses `smtplib` + `email.mime` (standard library, no extra deps)
- Link format: `{FRONTEND_URL}/verify?token={jwt_token}`

#### [MODIFY] [endpoint.py](file:///home/parth-prajapati/projects/quikr_copy/backend/app/modules/users/endpoint.py)

- `POST /users/request-verification/` — Generates a time-limited JWT (24h) containing user_id, sends verification email
- `GET /users/verify-email/?token=...` — Decodes the JWT, sets `user.is_verified = True`

### Frontend Changes

#### [MODIFY] [Profile.jsx](file:///home/parth-prajapati/projects/quikr_copy/frontend/src/components/Profile.jsx)

- If `user.is_verified === false`, show a prominent "Verify Your Account" banner with a button
- On click, call `POST /users/request-verification/`
- Show success toast: "Verification email sent! Check your inbox."

#### [NEW] `frontend/src/components/VerifyEmail.jsx`

- Route: `/verify?token=...`
- On mount, calls `GET /users/verify-email/?token=...`
- Shows success ("Account verified!") or error ("Link expired") state

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

## Phase 5: Wishlist Change Tracking & Notifications

**Goal:** If any item in user's wishlist has a price change, status change, or any update — show a notification.

### Backend Changes

#### [NEW] `backend/app/modules/notifications/model.py`

```python
class Notification(Base, CommonModelMixin):
    __tablename__ = "notifications"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(30))  # price_change, status_change, new_message, alert_match
    title = Column(String(200))
    message = Column(Text)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    data = Column(JSON, nullable=True)  # {"old_price": 5000, "new_price": 4500}
```

#### [MODIFY] Ad update CRUD

- When an ad is updated (price change, status change), query all users who have this ad in their favorites
- Create a `Notification` record for each of those users
- Example: "Price dropped! iPhone 15 is now ₹45,000 (was ₹50,000)"

#### [NEW] `backend/app/modules/notifications/endpoint.py`

- `GET /notifications/me/` — List user's notifications (paginated)
- `PUT /notifications/{id}/read/` — Mark as read
- `PUT /notifications/read-all/` — Mark all as read
- `GET /notifications/me/unread-count/` — Get unread count (for badge)

### Frontend Changes

#### [MODIFY] [Navbar.jsx](file:///home/parth-prajapati/projects/quikr_copy/frontend/src/components/Navbar.jsx)

- Add a bell icon (🔔) with unread notification count badge
- Clicking opens a dropdown panel showing recent notifications

#### [NEW] `frontend/src/components/Notifications.jsx`

- Route: `/notifications`
- Full-page view of all notifications grouped by date
- Click a notification to navigate to the relevant ad

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

| Priority | Phase                              | Effort | Impact                                   |
| -------- | ---------------------------------- | ------ | ---------------------------------------- |
| 🔴 P0    | Phase 1: Category-Specific Filters | Medium | High — Core UX improvement              |
| 🔴 P0    | Phase 3: Ad Management             | Medium | High — Users can't manage ads currently |
| 🟡 P1    | Phase 2: Email Verification        | Low    | Medium — Security improvement           |
| 🟡 P1    | Phase 7: Inquiries Dashboard       | Low    | Medium — Seller experience              |
| 🟡 P1    | Phase 5: Notifications             | Medium | High — Engagement boost                 |
| 🟢 P2    | Phase 4: Search Alerts             | Medium | Medium — Power user feature             |
| 🟢 P2    | Phase 6: Cart & Orders             | High   | High — E-commerce capability            |
| 🟢 P2    | Phase 8: Admin Enhancements        | Medium | Medium — Platform management            |

---

## Database Migration Strategy

All new models will require Alembic migrations:

```bash
cd backend
alembic revision --autogenerate -m "add notifications and orders tables"
alembic upgrade head
```

## Open Questions

> [!IMPORTANT]
>
> 1. **Email Provider:** Which SMTP provider should I use? Gmail (App Password), SendGrid, or Mailgun? Gmail is simplest for development.
> 2. **Cart & Orders:** Since this is a classifieds platform (not e-commerce), should the "Cart" be more of an "Interest List" where placing an order means "I want to buy this, notify the seller"? Or do you want actual payment integration (Razorpay/Stripe)?
> 3. **Notifications:** Should notifications be real-time (WebSocket push) or poll-based (check every 30 seconds)? WebSocket is better UX but more complex.
> 4. **Which phase do you want me to start with first?**
