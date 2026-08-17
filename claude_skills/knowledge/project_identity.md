# Marketa — Project Identity

## What Is This Product?

Marketa is a **full-stack classified ads marketplace** inspired by quikr.com. It allows users to buy, sell, and rent products through direct buyer-seller communication — no shopping cart, no checkout, no payment processing.

**Business Model:** Communication-focused. Buyers contact sellers via real-time chat or phone. The platform facilitates discovery and connection, not transactions.

---

## Product Name

**Marketa** — used in all UI text, emails, branding, and metadata.

---

## User Roles

| Role ID | Role Name | Permissions |
|---------|-----------|-------------|
| 1 | Super Admin | Full access: all admin panels, knowledge base, FAQs, reports, user management |
| 2 | System Admin | Admin panel access: categories, locations, reports, FAQs, inquiries |
| 3 | Regular User | Browse, post ads, chat, favorites, profile, notifications, search alerts |
| — | Guest (no login) | Browse ads, search, view details, use chatbot, submit contact form |

---

## Core User Flows

### Flow 1: Discovery
```
Guest/User → Homepage → Browse categories OR Search → Filter results → View ad details → Contact seller (chat/phone)
```

### Flow 2: Selling
```
User → Post Ad → Select category → Fill details + upload images → Publish → Manage from My Ads → Mark as Sold
```

### Flow 3: Authentication
```
Sign Up → Auto-login → (Optional) Verify email from Profile → Manage profile → Change password → Delete account
```

### Flow 4: AI Support
```
Any page → Click chatbot → Ask question → Bot checks: DB FAQs → Static FAQs → RAG knowledge → Groq LLM
```

### Flow 5: Admin
```
Admin login → Admin Panel → Manage: Locations, Categories, FAQs, Reports, Knowledge Base, Contact Inquiries
```

---

## Feature Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Authentication | Sign up, login, JWT, email verification, forgot/reset/change password, account deletion |
| 2 | Ad Management | Post ad with images, edit, deactivate, mark as sold, category-specific attributes |
| 3 | Search & Filters | Full-text search, category/price/condition/attribute filters, sort, dismissible chips |
| 4 | Ad Details | Image carousel, seller info, chat/phone buttons, share (copy/WhatsApp/X/Facebook), report, similar ads |
| 5 | Real-Time Chat | WebSocket buyer-seller messaging, per-ad rooms, unread badges, seller inquiry hub |
| 6 | AI Chatbot | Floating widget, FAQ matching, keyword matching, RAG (pgvector), Groq LLM fallback |
| 7 | Favorites | Toggle heart, /favorites page, wishlist change notifications |
| 8 | Notifications | Bell dropdown, price drop/hike alerts, content update alerts for favorited ads |
| 9 | Search Alerts | Save search criteria, auto-notify on new matching ads |
| 10 | Recently Viewed | Server-synced browsing history (PostgreSQL), 20-ad cap, cross-device persistence |
| 11 | Admin Panel | Locations, Categories+Attributes, FAQs, Reports, Knowledge Base (RAG), Contact Inquiries |
| 12 | Email System | Welcome, verification, forgot/reset/change password, account deletion — all branded HTML |
| 13 | Profile | Name, phone, email, avatar upload, cartoon avatar, change password, delete account |
| 14 | Static Pages | About, Contact, Services, Terms of Use, Privacy Policy |

---

## What This Product Is NOT

- ❌ No shopping cart or checkout
- ❌ No payment gateway
- ❌ No order tracking
- ❌ No product reviews (seller reviews exist but are secondary)
- ❌ No delivery/shipping
- ❌ No multi-language support
- ❌ No mobile app (web only, responsive)
