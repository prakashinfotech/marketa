# Marketa — Module Specifications

> Detailed requirements for every module. Claude should reference this when building a specific feature.

---

## 1. Users Module

### Registration
- Fields: name, username, email, password, phone (optional)
- Password hashed with bcrypt (min 6 chars)
- Auto-sends welcome email + verification email on signup
- No auto-login after signup — user must log in manually
- Duplicate email → `IntegrityError` → "Email already exists"
- Soft-deleted accounts: email/username are anonymized (appended with `_deleted_{timestamp}`) so the same email can re-register

### Login
- Email + password → bcrypt verify → JWT access + refresh tokens
- JWT payload: `{sub: user_id, token_version: N, exp: timestamp}`
- `token_version` prevents old tokens from working after password change

### Email Verification
- Token-based (24hr expiry)
- Auto-sent on signup + manual trigger from Profile page
- Clicking link → marks `is_verified=True`

### Forgot Password
- User submits email → if exists, sends reset link (1hr expiry)
- ALWAYS returns success message (prevents email enumeration)
- Reset link: `/reset-password?token=xxx`

### Reset Password
- Validates token + `token_version` match
- Sets new password, increments `token_version` (invalidates all sessions)
- Sends "password changed" confirmation email

### Change Password (from Profile)
- Requires old password verification
- New ≠ old password, min 6 chars
- Sends confirmation email

### Account Deletion
- Step 1: `request-delete-account` → sends deletion code to email
- Step 2: `confirm-delete-account` with code → soft-deletes user + all their ads
- Anonymizes email/username to allow re-registration

### Profile
- Update: name, phone, email, city
- Avatar: file upload OR cartoon avatar selection
- File size limit: 5MB

---

## 2. Ads Module

### Create Ad
- Required: title, category_id, city_id, description, price (>0), at least 1 image
- Optional: condition, ad_type, locality, price_negotiable, attribute_values
- Images: max 5, max 5MB each, stored in `uploads/users/{user_id}/ads/{ad_id}/`
- First image auto-set as `is_primary`

### Edit Ad
- Owner-only (verified by `user_id` match)
- Can add/remove images, update all fields
- FormData with mixed text + files

### Ad Status Management
- Statuses: `active`, `sold`, `inactive`
- Owner can toggle between these
- Only `active` ads show in search/browse

### View Count
- `POST /ads/{id}/view/` increments `views` counter
- Frontend uses `sessionStorage` to track viewed ads — prevents inflation on refresh

### Search
- Full-text search on title + description
- Filters: category, price range, condition, listing type, city, attribute values
- Sort: newest, price low→high, price high→low
- Pagination with skip/limit

### Similar Ads
- Same category, similar price (±50%), exclude current ad
- Return max 6 results

### Wishlist Notifications
- When an ad is updated (price, title, description, images, category), ALL users who favorited it receive a notification
- Price changes: notification includes old and new price with direction (📈/📉)
- Other changes: notification lists which fields changed

---

## 3. Categories Module

### Category Tree
- Hierarchical: parent categories → sub-categories (self-referential FK)
- Each category has: name, slug, icon_url (emoji or URL)
- API returns nested tree structure

### Dynamic Attributes
- Each category can have custom attributes (e.g., Cars → "Fuel Type", "Year")
- Attribute types: text, number, select, boolean
- Attributes appear dynamically in PostAd form when category is selected
- Attribute values are stored per-ad in `ad_attribute_values`
- Attributes appear as filter options in SearchResults sidebar
- Attribute values show as spec tags on ad cards

---

## 4. Locations Module

### Hierarchy
- State → City (two levels)
- Used in ad posting (State dropdown → City dropdown)
- Used in search filters
- Popular cities flagged with `is_popular=True` for homepage display

---

## 5. Chat Module

### Architecture
- WebSocket-based real-time messaging
- Chat rooms are per-ad-per-buyer: `(ad_id, buyer_id)` unique
- Created when buyer clicks "Chat with Seller" on ad details
- Seller cannot chat on their own ad

### Features
- Real-time message delivery via WebSocket
- Message persistence in PostgreSQL
- Unread message count in navbar badge
- Read status tracking

### Seller Inquiries
- `/inquiries` page groups all chats by ad
- Shows inquiry count per ad
- Quick "Mark as Sold" action from inquiry view

---

## 6. AI Chatbot Module (MarketaBot)

### Response Strategy (in order of priority)
1. **Database FAQs** — Admin-managed Q&As. Checks: exact question substring match, keyword match, space-separated keyword fallback
2. **Static FAQs** — 16 built-in platform Q&As (hardcoded in crud.py)
3. **RAG Retrieval** — pgvector similarity search on uploaded knowledge documents
4. **Chitchat Detection** — Regex-based (greetings, thanks, etc.) → Groq LLM warm response
5. **General LLM** — Platform-scoped questions → Groq Llama 3.3 70B with system prompt

### FAQ Matching Logic
- Check if user question contains FAQ question as substring (bidirectional)
- Check if user query words match FAQ keywords
- Keywords are comma-separated, also support space-separated sub-matching

### RAG Pipeline
- Upload: `.md`, `.txt`, `.pdf` → extract text → chunk (500 chars, 100 overlap) → embed with `all-MiniLM-L6-v2` → store in pgvector
- Query: embed user question → cosine similarity search → top 3 chunks → feed to Groq as context
- Similarity threshold: 0.3

### UI
- Floating widget (bottom-right corner, every page)
- FAQ suggestion chips on open
- Markdown-rendered responses
- Typing indicator animation

---

## 7. Favorites Module

- Toggle: if exists → remove, if not → add
- `UniqueConstraint(user_id, ad_id)` prevents duplicates
- Heart icon synced across all pages (home, search, ad details, favorites)
- `/favorites/ids/` endpoint returns just IDs for efficient heart sync

---

## 8. Notifications Module

### Notification Types
- **Chat:** New message received
- **Price Change:** Favorited ad price changed (includes old/new price, direction emoji)
- **Wishlist Update:** Favorited ad content changed (lists changed fields)
- **Search Alert:** New ad matches saved search criteria

### UI
- Bell icon in navbar with unread count badge
- Dropdown shows recent notifications
- Full `/notifications` page with history

---

## 9. Search Alerts Module

- User saves: keyword, category, city, price range
- When a new ad is posted, system checks all active alerts for matches
- Matching alert owners receive a notification
- Manage from `/alerts` page: create, toggle active/inactive, delete

---

## 10. Contact Module

- Public form: name, email, subject, message
- Submissions visible to admins in Admin Panel → Inquiries
- Status tracking: new, responded, archived

---

## 11. Reports Module

- Users can report ads: reason (spam, fraud, offensive, duplicate, other) + description
- Admin panel shows all reports with reporter info
- Admin can resolve or dismiss reports

---

## 12. Recently Viewed Module

- Server-synced via PostgreSQL (not localStorage)
- Records `(user_id, ad_id, viewed_at)` — upsert on re-view
- Cap at 20 entries per user (delete oldest)
- Homepage shows "Recently Viewed" section for logged-in users
- Cross-device persistence (tied to user account, not browser)
