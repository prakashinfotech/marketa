# Marketa — Product Demo Flow 🎯

> **For:** Manager Presentation  
> **Product:** Marketa — Full-Stack Classified Ads Marketplace  
> **URLs:** Frontend → `http://localhost:3000` | Backend API → `http://localhost:8000/docs`

---

## 🔷 Product Summary (30-second pitch)

Marketa is a **classified ads marketplace** (like Quikr/OLX) where users can **buy, sell, and rent** products through **direct buyer-seller communication**. No shopping cart, no checkout, no payment gateway — just **discovery + connection**.

**Key differentiators built into this product:**
- 🤖 AI Chatbot with RAG (knowledge base retrieval)
- 💬 Real-time WebSocket chat between buyers & sellers
- 🔔 Smart notifications (price drops, wishlist updates, search alerts)
- 🏷️ Dynamic category attributes (each category has unique filters)
- 📧 Branded transactional email system
- 🛡️ Complete admin panel with content moderation

---

## 📋 Complete Use Case List

| # | Use Case | User Role |
|---|----------|-----------|
| 1 | Sign up with email & password | Guest |
| 2 | Login & get JWT tokens | Guest |
| 3 | Email verification (token-based) | User |
| 4 | Forgot password → reset via email link | Guest |
| 5 | Change password from profile | User |
| 6 | Delete account (email code confirmation) | User |
| 7 | Update profile (name, phone, avatar) | User |
| 8 | Post a new ad with images & attributes | User (Seller) |
| 9 | Edit an existing ad | User (Seller) |
| 10 | Mark ad as Sold / Deactivate / Reactivate | User (Seller) |
| 11 | Browse homepage (categories, fresh ads, recently viewed) | Anyone |
| 12 | Search ads with keyword | Anyone |
| 13 | Filter by category, price, condition, attributes | Anyone |
| 14 | Sort results (newest, price low/high) | Anyone |
| 15 | View ad details (image carousel, specs, seller info) | Anyone |
| 16 | Share ad (Copy Link / WhatsApp / X / Facebook) | Anyone |
| 17 | Report an ad (spam, fraud, offensive) | User |
| 18 | View similar ads | Anyone |
| 19 | Chat with seller (real-time WebSocket) | User (Buyer) |
| 20 | View seller inquiries grouped by ad | User (Seller) |
| 21 | Toggle favorite (heart icon) | User |
| 22 | View favorites page | User |
| 23 | Receive price change notification on favorited ad | User |
| 24 | Receive wishlist update notification | User |
| 25 | Create search alert (keyword + filters) | User |
| 26 | Get notified when new ad matches alert | User |
| 27 | Use AI chatbot (FAQ + RAG + LLM) | Anyone |
| 28 | View recently viewed ads (server-synced) | User |
| 29 | Submit contact form | Anyone |
| 30 | Admin: Manage locations (states/cities) | Admin |
| 31 | Admin: Manage categories & attributes | Admin |
| 32 | Admin: Manage FAQs for chatbot | Admin |
| 33 | Admin: Upload knowledge base documents (RAG) | Super Admin |
| 34 | Admin: Review reported ads | Admin |
| 35 | Admin: View contact inquiries | Admin |

---

## 🎬 Demo Flow — Step by Step

> Follow these sections in order for a smooth presentation. Each section builds on the previous.

---

### DEMO 1: Homepage & First Impression 🏠
**Duration:** ~2 minutes  
**Goal:** Show the overall product and visual quality

**Steps:**
1. Open `http://localhost:3000` — show the **homepage**
2. Point out:
   - **Hero section** with search bar — "Users start their journey here"
   - **Category grid** with emoji icons — "One click to filter by category"
   - **Fresh Recommendations** — "Latest active ads in card grid"
   - **How It Works** — 3-step guide (Post Ad → Get Responses → Close Deal)
   - **Testimonials** slider
   - **Footer** with About, Contact, Services, Terms, Privacy links
3. Show the **Navbar** — Logo, Search bar, Login/Signup buttons
4. Click the **ChatBot icon** (bottom-right floating button) — "AI assistant available on every page"
5. Close chatbot, scroll through the page to show responsive design

**Talking Points:**
- "This is a complete marketplace — users can browse without logging in"
- "The design uses modern Tailwind CSS with glassmorphism effects"
- "Every page has the AI chatbot accessible"

---

### DEMO 2: Authentication Flow 🔐
**Duration:** ~3 minutes  
**Goal:** Show complete auth system (signup → login → profile)

#### 2A. Sign Up
1. Click **Sign Up** in navbar
2. Fill form: Name, Username, Email, Password
3. Submit → Redirected to **Login page** (no auto-login for security)
4. Mention: "Welcome email + verification email sent automatically"

#### 2B. Login
1. Enter email + password
2. Login → Redirected to **Homepage**
3. Point out navbar changes:
   - User avatar + name in dropdown
   - **Post Ad** button appeared
   - **Chat icon** with unread badge
   - **Bell icon** for notifications
4. Open user dropdown → show all links:
   - Profile, My Ads, Favorites, Chat, Inquiries, Alerts, Notifications
   - **Admin Panel** link (if admin user)

#### 2C. Profile Page
1. Navigate to **Profile**
2. Show:
   - Avatar upload (file upload OR cartoon avatar selection)
   - Profile info (name, phone, email)
   - **Email verification status** + "Verify" button
   - **Change Password** section (expandable)
   - **Delete Account** section (requires email code)

#### 2D. Forgot Password *(optional — describe verbally)*
- "Users can reset password via email link"
- "We always show success message to prevent email enumeration"
- "Reset token expires in 1 hour, one-time use"

**Talking Points:**
- "JWT-based auth with access + refresh tokens"
- "Token versioning — changing password invalidates all active sessions"
- "Account deletion is soft-delete with email anonymization for re-registration"

---

### DEMO 3: Posting an Ad 📝
**Duration:** ~3 minutes  
**Goal:** Show the ad creation flow with dynamic attributes

**Steps:**
1. Click **Post Ad** button in navbar
2. Fill the form step by step:
   - **Title:** "iPhone 15 Pro Max — 256GB"
   - **Category:** Select "Mobiles" → **show dynamic attribute fields appear** (e.g., Brand, Storage, Color)
   - **State → City:** Select state dropdown, then city populates
   - **Locality:** Optional text field
   - **Description:** Add details
   - **Price:** ₹85,000
   - **Negotiable:** Toggle checkbox
   - **Condition:** "Like New"
   - **Listing Type:** "Sell"
   - **Category Attributes:** Fill Brand = "Apple", Storage = "256GB"
   - **Images:** Upload 1-5 images (show drag & drop, preview, remove button)
3. Submit → Ad created, redirect to My Ads

**Talking Points:**
- "Each category has its own dynamic attribute fields — managed by admin"
- "Max 5 images, 5MB each, first image auto-set as primary"
- "Images stored in organized folders: `uploads/users/{id}/ads/{id}/`"
- "All validation is real-time — price must be > 0, at least 1 image required"

---

### DEMO 4: My Ads — Seller Dashboard 📊
**Duration:** ~2 minutes  
**Goal:** Show seller's ad management capabilities

**Steps:**
1. Navigate to **My Ads** (from navbar dropdown)
2. Show:
   - **Status tabs:** All | Active | Sold | Inactive
   - **Per-ad actions:** Edit ✏️ | Mark as Sold ✅ | Deactivate 🔴 | Delete 🗑️
   - **Inquiry count badge** on each ad (shows how many buyers have chatted)
3. Click **Edit** on an ad → PostAd form pre-filled with existing data
4. Click **Mark as Sold** → custom confirmation modal (no browser alerts!)
5. Show the ad disappears from Active tab, appears in Sold tab

**Talking Points:**
- "Sellers have full control over their ad lifecycle"
- "Custom modals throughout — no ugly browser `alert()` or `confirm()` dialogs"
- "Inquiry badges give sellers insight into buyer interest"

---

### DEMO 5: Search & Discovery 🔍
**Duration:** ~4 minutes  
**Goal:** Show powerful search, filters, and ad details

#### 5A. Search
1. Type "iPhone" in the hero search bar → press Enter
2. Show **Search Results** page:
   - **Left sidebar filters:** Category, Price Range, Condition, Listing Type
   - **Category-specific attribute filters** (e.g., Brand, Storage for Mobiles)
   - **Sort options:** Newest, Price Low→High, Price High→Low
   - **Active filter chips** at the top (dismissible with × button)
   - **Ad cards** with images, price, attribute spec tags (e.g., "Apple", "256GB")
   - **Heart icon** on each card (favorite toggle)
3. Apply a filter → show results update
4. Click a filter chip to dismiss → results update again
5. Change sort order → results reorder

#### 5B. Ad Details
1. Click on an ad card → **Ad Details** page
2. Show:
   - **Image carousel** with left/right arrows + counter ("1/4")
   - **Price** with "Negotiable" badge
   - **Condition** badge
   - **Category-specific attribute specs** (like a spec sheet)
   - **Description** section
   - **Seller info panel** (avatar, name, member since date)
   - **Action buttons:**
     - 💬 "Chat with Seller" (hidden if it's your own ad)
     - 📞 "Show Phone Number" (requires login)
     - 📤 "Share" dropdown (Copy Link, WhatsApp, X, Facebook)
     - 🚩 "Report" this ad
   - **Similar Ads** section (same category, ±50% price, max 6)
   - **Safety Tips** section
3. Click **Share → Copy Link** → show "Link Copied!" toast
4. Click **Report** → show report modal with reason dropdown

#### 5C. Category Browsing
1. Go back to Homepage
2. Click a **category icon** (e.g., "Cars") → filtered search results
3. Show category-specific filters in sidebar (Fuel Type, Year, Transmission for Cars)

**Talking Points:**
- "Full-text search across title and description"
- "Dynamic filters — each category brings its own attribute filters"
- "View count tracks per session — no inflation on refresh"
- "Share to 4 platforms with one click"
- "Similar ads algorithm: same category + ±50% price range"

---

### DEMO 6: Communication — Chat & Inquiries 💬
**Duration:** ~3 minutes  
**Goal:** Show real-time buyer-seller communication

#### 6A. Buyer Starts Chat
1. On an ad details page (not your own ad), click **"Chat with Seller"**
2. Redirected to **Chat page** with the room open
3. Send a message → message appears in the chat bubble
4. Point out:
   - **Left panel:** Room list with last message + timestamp
   - **Right panel:** Active conversation with message bubbles
   - **Send on Enter key**
   - **Unread badge** in navbar

#### 6B. Seller Inquiries
1. Login as the seller (or show from the seller perspective)
2. Navigate to **Inquiries** page
3. Show:
   - **Chats grouped by ad** — "This seller has 3 ads with buyer inquiries"
   - **Inquiry count** per ad
   - Click to expand → see all conversations for that ad
   - **"Mark as Sold"** action right from the inquiries page

**Talking Points:**
- "WebSocket-based real-time messaging — no polling"
- "Chat rooms are per-ad-per-buyer — organized and clean"
- "Seller can manage all buyer conversations from one page"
- "One-click 'Mark as Sold' from inquiry view"

---

### DEMO 7: User Engagement Features 🔔
**Duration:** ~3 minutes  
**Goal:** Show favorites, notifications, search alerts, recently viewed

#### 7A. Favorites
1. Click the **heart icon** on an ad card → heart turns red
2. Navigate to **Favorites** page → ad appears in the grid
3. Click heart again → unfavorited, removed from grid
4. Go to search results → heart state is synced across pages

#### 7B. Notifications
1. Click **Bell icon** in navbar → dropdown shows recent notifications
2. Show notification types:
   - "📉 Price Dropped! — iPhone 15 Pro price changed from ₹90K to ₹85K"
   - "🔔 Wishlist Item Updated — Title and description changed"
   - "💬 New message from buyer"
3. Navigate to full **Notifications** page for history

#### 7C. Search Alerts
1. Navigate to **Search Alerts** page
2. Create a new alert:
   - Keyword: "MacBook"
   - Category: "Laptops"
   - Price Range: ₹50,000 - ₹1,50,000
3. Save → alert appears in the list
4. Explain: "When anyone posts a new ad matching these criteria, this user gets notified automatically"
5. Show toggle active/inactive + delete actions

#### 7D. Recently Viewed
1. View 2-3 ads by clicking on them
2. Go back to **Homepage**
3. Scroll down → **"Recently Viewed"** section shows those ads
4. Explain: "Server-synced via PostgreSQL, not localStorage — works across devices"

**Talking Points:**
- "Favorites sync across all pages — homepage, search, ad details"
- "Price change notifications include direction emoji (📈/📉) and old vs new price"
- "Search alerts auto-trigger when new ads match saved criteria"
- "Recently viewed capped at 20 entries, cross-device persistence"

---

### DEMO 8: AI Chatbot — MarketaBot 🤖
**Duration:** ~3 minutes  
**Goal:** Show the multi-layer AI chatbot intelligence

**Steps:**
1. Click the **chatbot icon** (bottom-right on any page)
2. Show: Welcome message + FAQ suggestion chips at top

3. **Test FAQ matching:**
   - Click a suggestion chip like "How to post an ad?" → instant answer
   - Type "how do I search?" → static FAQ answer returned

4. **Test admin-managed FAQs:**
   - Ask a question that matches an admin-added FAQ → DB FAQ answer

5. **Test RAG (Knowledge Base):**
   - Ask a question about uploaded knowledge documents
   - "What is your return policy?" (if such a doc is uploaded)
   - Show: grounded answer from the knowledge base

6. **Test chitchat:**
   - Say "Hello" or "Thanks!" → friendly warm response

7. **Test platform boundaries:**
   - Ask "What is calculus?" → politely refused: "I can only help with Marketa-related questions"

8. Show **markdown rendering** in responses (bold, lists, links)
9. Show **typing indicator** animation while bot processes

**Talking Points:**
- "4-layer intelligence: DB FAQs → Static FAQs → RAG retrieval → Groq LLM"
- "RAG pipeline: documents chunked → embedded with MiniLM → stored in pgvector → cosine similarity search"
- "Chatbot is platform-scoped — won't answer off-topic questions"
- "Admin can manage FAQs and upload knowledge docs without any code changes"

---

### DEMO 9: Admin Panel 🛡️
**Duration:** ~5 minutes  
**Goal:** Show complete admin management capabilities

**Steps:**
1. Login as admin user (role_id = 1 or 2)
2. Click **"Admin Panel"** from navbar dropdown
3. Show the **Admin Layout:** dark sidebar with navigation links

#### 9A. Locations Management
1. Click **Locations** in sidebar
2. Show hierarchical view: States → Cities
3. Add a new city under a state
4. Toggle **"is_popular"** flag (popular cities show on homepage)

#### 9B. Categories & Attributes
1. Click **Categories** in sidebar
2. Show **category tree view** (parent → subcategories)
3. Switch to **"Add Attribute"** tab
4. Add a new attribute to a category:
   - Name: "Battery Health"
   - Field Type: "select" (or text, number, boolean)
   - Options: "100%, 90%, 80%, Below 80%"
5. Explain: "This attribute now appears in PostAd form and Search filters for this category"

#### 9C. FAQs
1. Click **FAQs** in sidebar
2. Show list of existing FAQs
3. Add a new FAQ:
   - Question: "What is Python?"
   - Keywords: "python, programming, aiml"
   - Answer: "Python is a popular programming language..."
4. Toggle active/inactive
5. "Now if someone asks the chatbot about Python, this answer will be returned"

#### 9D. Knowledge Base (RAG)
1. Click **Knowledge Base** in sidebar
2. Show the **drag-and-drop upload zone**
3. Upload a `.txt` or `.md` document
4. Show success: "Document indexed — X chunks created"
5. Show document list with delete option
6. Explain: "Documents are chunked, embedded with AI, and stored as vectors for semantic search"

#### 9E. Reports
1. Click **Reports** in sidebar
2. Show reported ads list with:
   - Reporter info, reason (spam/fraud/offensive/duplicate)
   - Description from the reporter
3. Show resolve/dismiss actions

#### 9F. Contact Inquiries
1. Click **Inquiries** in sidebar
2. Show contact form submissions
3. Show status tracking: new → responded → archived

**Talking Points:**
- "Two admin roles: Super Admin (full access) and System Admin (no knowledge base)"
- "Dynamic attributes system — admins can customize any category without developer help"
- "Knowledge base uses RAG pipeline — upload a doc and chatbot learns from it instantly"
- "All admin operations use soft-delete — nothing is permanently destroyed"

---

### DEMO 10: Static Pages & Footer Links 📄
**Duration:** ~1 minute  
**Goal:** Show completeness of the platform

1. Click **About** → shows company information
2. Click **Contact** → shows contact form (submissions go to admin panel)
3. Click **Services** → describes platform services
4. Click **Terms of Use** → legal terms
5. Click **Privacy Policy** → privacy information

---

### DEMO 11: Email System 📧 *(Show screenshots or describe)*
**Duration:** ~1 minute  
**Goal:** Show branded transactional emails

Mention/show the 5 email types:
1. **Welcome Email** — sent on signup, "Welcome to Marketa! 🎉"
2. **Verification Email** — "Verify My Email" button, 24hr expiry
3. **Forgot Password Email** — "Reset Password" button (red), 1hr expiry
4. **Password Changed Confirmation** — with timestamp
5. **Account Deletion Code** — 6-digit code in styled box

All emails use:
- Branded indigo gradient header with "Marketa" title
- Consistent HTML template
- Gmail SMTP with STARTTLS
- Fallback: logs to console if SMTP not configured (dev-friendly)

---

## 🏗️ Technical Architecture Overview

> Use this if the manager asks about the tech stack

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React 19 + Vite 8 + Tailwind CSS 3.4           │
│  React Router v7 | Axios + JWT interceptor       │
│  Lucide Icons | WebSocket client                 │
│  Port: 3000                                      │
└────────────────────┬────────────────────────────┘
                     │ API Proxy (/api → :8000)
┌────────────────────▼────────────────────────────┐
│                   BACKEND                        │
│  FastAPI (Python 3.12+) + SQLAlchemy 2.0         │
│  JWT Auth + RBAC (3 roles)                       │
│  WebSocket (FastAPI native)                      │
│  Groq LLM (Llama 3.3 70B)                       │
│  sentence-transformers (MiniLM)                  │
│  Gmail SMTP emails                               │
│  Port: 8000                                      │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                  DATABASE                        │
│  PostgreSQL 14+ with pgvector extension          │
│  20 tables | Alembic migrations                  │
│  Soft-delete pattern throughout                  │
│  Vector embeddings for RAG search                │
└─────────────────────────────────────────────────┘
```

**Backend Module Count:** 13 modules (Users, Ads, Categories, Locations, Chat, Chatbot, Favorites, Notifications, Search Alerts, Reports, Reviews, Contact, Recently Viewed)

**Database Table Count:** 20 tables

**Frontend Component Count:** 28 React components

**API Endpoint Count:** 50+ REST endpoints + WebSocket

---

## 📊 Feature Comparison with Real quikr.com

| Feature | Real quikr.com | Marketa |
|---------|-----------|----------------|
| Ad Posting | ✅ | ✅ |
| Search & Filters | ✅ | ✅ |
| Dynamic Category Attributes | ✅ | ✅ |
| Real-time Chat | ✅ | ✅ (WebSocket) |
| Favorites/Wishlist | ✅ | ✅ |
| Price Alerts | ❌ | ✅ (auto notifications) |
| AI Chatbot | Basic | ✅ (4-layer: FAQ + RAG + LLM) |
| Knowledge Base (RAG) | ❌ | ✅ |
| Search Alerts | ✅ | ✅ |
| Email System | ✅ | ✅ (5 branded templates) |
| Admin Panel | ✅ | ✅ (6 modules) |
| Social Sharing | ✅ | ✅ (4 platforms) |
| Recently Viewed | ✅ | ✅ (server-synced) |
| Similar Ads | ✅ | ✅ (category + price) |
| Report Ad | ✅ | ✅ |
| Payment Gateway | ✅ | ❌ (by design) |
| Mobile App | ✅ | ❌ (responsive web) |

---

## ⏱️ Suggested Presentation Timeline

| Time | Section | Duration |
|------|---------|----------|
| 0:00 | Product Summary & Homepage | 2 min |
| 2:00 | Authentication (Signup → Login → Profile) | 3 min |
| 5:00 | Post Ad (with dynamic attributes) | 3 min |
| 8:00 | My Ads — Seller Dashboard | 2 min |
| 10:00 | Search, Filters & Ad Details | 4 min |
| 14:00 | Chat & Seller Inquiries | 3 min |
| 17:00 | Favorites, Notifications, Search Alerts, Recently Viewed | 3 min |
| 20:00 | AI Chatbot (FAQ + RAG + LLM demo) | 3 min |
| 23:00 | Admin Panel (all 6 modules) | 5 min |
| 28:00 | Email System & Static Pages | 2 min |
| **30:00** | **Q&A** | — |

---

## 🎯 Key Numbers to Mention

- **14 major features** fully implemented
- **35+ use cases** covered
- **20 database tables** with relationships
- **13 backend modules** following consistent architecture
- **28 React components** with modern design
- **50+ API endpoints** + WebSocket
- **5 branded email templates**
- **4-layer AI chatbot** (FAQ → RAG → LLM)
- **165 test cases** documented (105 positive, 60 negative)
- **3 user roles** with RBAC (Super Admin, Admin, User)

---

> [!TIP]
> **Before the demo:** Make sure both servers are running:
> - Backend: `cd backend && uvicorn main:app --reload --port 8000`
> - Frontend: `cd frontend && npm run dev`
> - Have at least 2 user accounts ready (1 admin, 1 regular user)
> - Have some sample ads already posted with images
> - Have at least 1 knowledge document uploaded for RAG demo
