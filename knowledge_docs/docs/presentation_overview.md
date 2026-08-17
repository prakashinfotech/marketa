# Marketa — Platform Overview

> A modern, full-stack classified ads marketplace built with **FastAPI + React + PostgreSQL**.
> Designed for buying, selling, and renting products through direct buyer-seller communication.

---

## 🏠 1. Home Page & Discovery

The landing page features a hero search bar, browsable category cards, a "Fresh Recommendations" grid of latest ads, a horizontally scrollable "Recently Viewed" section (**server-synced via PostgreSQL** for logged-in users, ensuring cross-device persistence), a "Happy Customers" testimonial slider, and a step-by-step "How It Works" guide. Responsive design with premium micro-animations throughout.

---

## 🔐 2. Authentication & User Management

Complete auth flow with Sign Up, Login, **Forgot Password**, **Reset Password**, Email Verification (token-based), and session management via JWT. Role-based access control (RBAC) with three roles: Super Admin, System Admin, and Regular User. Profile management includes name, phone, avatar upload, cartoon avatar selection, and **Change Password** functionality. All authentication emails are sent via **Gmail SMTP** with branded HTML templates.

---

## 📝 3. Ad Posting & Management (Post Ad / My Ads)

Users can create ads with title, description, price, condition (New/Used/Like New), category, location (State → City → Locality), and up to 5 image uploads with drag-and-drop. Category-specific dynamic attributes (e.g., Fuel Type for Cars, BHK for Real Estate) are rendered based on the selected category. The "My Ads" dashboard lets sellers Edit, Deactivate, or mark ads as Sold, with grouped inquiry counts per ad.

---

## 🔍 4. Search & Dynamic Filtering

Full-text search across titles, descriptions, and categories with a powerful sidebar filter panel featuring: Sort (Newest, Price Low→High, etc.), Category selection, Price Range presets, Condition, Listing Type, and **category-specific attribute filters** (Year, Fuel Type, Brand, BHK, etc.). Active filters show as dismissible chips. The sidebar has a premium custom scrollbar with pinned header.

---

## 📄 5. Ad Details & Engagement

Full ad detail view with image carousel (keyboard + swipe navigation), price display, seller info panel, "Chat with Seller" and "Show Phone Number" actions, attribute specs, safety tips, and a "Report Ad" modal. Features a **Share button** (Copy Link, WhatsApp, X/Twitter, Facebook) and a **"Similar Ads"** section showing related listings from the same category with similar price range.

---

## 💬 6. Real-Time Chat System

WebSocket-powered buyer-seller messaging. Chat rooms are auto-created when a buyer clicks "Chat with Seller." Features include real-time message delivery, read receipts, unread message badges in the navbar, and seller-side inquiry management grouped by ad with quick "Mark as Sold" actions.

---

## 🤖 7. AI Chatbot (MarketaBot)

A floating chatbot widget available on every page. Uses a multi-layered response strategy:
1. **Database FAQs** (admin-managed) → instant answer
2. **Static FAQ** (16 built-in platform Q&As) → instant answer
3. **RAG Retrieval** (pgvector similarity search on uploaded knowledge documents) → grounded LLM answer
4. **Chitchat** (regex-detected casual talk) → warm Groq LLM response
5. **General LLM** (platform-scoped questions) → Groq Llama 3.3 70B response

Includes FAQ suggestion chips and markdown-rendered answers.

---

## ❤️ 8. Favorites & Wishlist

Toggle-favorite any ad from search results, home page, or ad details with a heart icon. Dedicated "/favorites" page shows all saved ads. Favorites sync across sessions via API.

---

## 🔔 9. Notifications System

Real-time notification feed for events like: new chat messages, ad status changes, **price drops/hikes on favorited ads**, **any content update on wishlist items** (title, description, images, category changes), and system announcements. Notifications differentiate between price changes (specific old/new price) and general updates (lists exact changed fields). Unread count badge in the navbar with bell icon.

---

## 🔔 10. Search Alerts

Users can save search criteria (keyword + category + city + price range) and get notified when new matching ads are posted. Manage alerts from a dedicated "/alerts" page with create, toggle, and delete functionality.

---

## 📊 11. Seller Inquiries Hub

Sellers see all their ads with grouped chat counts. They can view per-ad conversations, mark ads as "Sold" directly from the inquiry view, and track buyer interest across all listings.

---

## 👨‍💼 12. Admin Panel — Inquiries Management

Admin-only page to view and manage all contact form submissions (from the public Contact page). Admins can see inquiry details, status, and respond or archive them.

---

## 📍 13. Admin Panel — Locations Management

CRUD interface for managing States, Cities, and Localities. Supports hierarchical State → City → Locality relationships. Used for location dropdowns in Ad Posting and filtering.

---

## 📂 14. Admin Panel — Categories & Attributes

Manage product categories (Mobiles, Cars & Bikes, Electronics, Real Estate) and their **dynamic attributes** (e.g., Fuel Type, RAM, BHK). Attributes have configurable field types (text, select, number) with display order and predefined options.

---

## 🚩 15. Admin Panel — Reports Management

View and manage user-submitted ad reports (spam, fraud, offensive, duplicate). Admin can review reports, take action on flagged ads, and maintain platform integrity.

---

## ❓ 16. Admin Panel — FAQ Management

CRUD interface for managing chatbot FAQs. Admins add questions with comma-separated keywords and answers. The chatbot checks these first (before calling the LLM) for instant, accurate responses. Supports question-match, keyword-match, and space-separated keyword fallback.

---

## 📚 17. Admin Panel — Knowledge Base (RAG)

Drag-and-drop document upload interface for superadmins. Supports `.md`, `.txt`, and `.pdf` files. Documents are chunked, embedded using `sentence-transformers` (all-MiniLM-L6-v2), and stored in PostgreSQL via `pgvector`. The chatbot retrieves relevant chunks for grounded AI answers. Includes document listing and deletion (removes both vectors and physical files).

---

## 👤 18. User Profile Management

Edit profile with name, username, email, phone number, and avatar. Supports both file upload and cartoon avatar selection. **Change Password** section with old password verification, minimum length validation, and auto-send of confirmation email. Profile data persists across sessions.

---

## 📧 19. Email System (Full Lifecycle)

Comprehensive email system powered by **Gmail SMTP** (STARTTLS on port 587) with branded HTML templates:

| Email Type | Trigger | Expiry |
|---|---|---|
| **Welcome Email** | Auto-sent on signup | N/A |
| **Verification Email** | Auto-sent on signup + manual trigger from Profile | 24 hours |
| **Forgot Password** | User enters email on `/forgot-password` | 1 hour |
| **Password Reset Confirmation** | After successful password reset | N/A |
| **Password Changed Confirmation** | After changing password from Profile | N/A |

Security features: email enumeration prevention (forgot-password always returns success), token versioning (single-use reset links), and minimum password requirements.

---

## 🗺️ 20. Static Pages

- **About** — Platform mission and team info
- **Contact** — Public contact form with inquiry submission
- **Services** — Platform features showcase
- **Terms of Use** — Legal terms
- **Privacy Policy** — Data privacy information
- **Footer** — Consistent footer with navigation links across all pages

---

## 🎨 21. UI/UX Design

- Premium glassmorphism and gradient design system
- Google Fonts (Inter) typography
- Smooth micro-animations and hover effects
- Custom premium scrollbars (indigo gradient)
- Mobile-responsive layout throughout
- Dark sidebar admin panel with breadcrumb navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Lucide Icons |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL + pgvector |
| AI/LLM | Groq (Llama 3.3 70B) + sentence-transformers |
| Real-time | WebSocket (FastAPI native) |
| Auth | JWT + bcrypt + RBAC |
| Email | Gmail SMTP (STARTTLS) + smtplib |
| PDF Parsing | pdfminer.six |
