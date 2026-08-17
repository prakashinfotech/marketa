# Marketa — Complete Database Schema

> Every table, column, relationship, and constraint in the system.

---

## Core Mixin (CommonModelMixin)

All tables below inherit these columns automatically:

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | Integer | auto-increment | Primary key, indexed |
| `uuid` | String | `uuid4()` | Unique, indexed |
| `created_at` | DateTime | `utcnow()` | Auto-set |
| `modified_at` | DateTime | `utcnow()` | Auto-updated on change |
| `is_delete` | Boolean | `False` | Soft-delete flag |
| `deleted_at` | DateTime | null | Set when soft-deleted |

---

## 1. `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `name` | String | NOT NULL | Full name |
| `username` | String | UNIQUE, indexed | Display name |
| `email` | String | UNIQUE, indexed | Login identifier |
| `password` | String | NOT NULL | bcrypt hash |
| `phone` | String | nullable | Contact number |
| `avatar` | String | nullable | URL to avatar image |
| `city_id` | Integer | FK → cities.id, nullable | User's city |
| `is_active` | Boolean | default True | Account active flag |
| `is_verified` | Boolean | default False | Email verified |
| `token_version` | Integer | default 0 | Incremented on password change (invalidates old JWTs) |
| `role_id` | Integer | default 3 | 1=SuperAdmin, 2=Admin, 3=User |

**Relationships:**
- `ads` → one-to-many → `Ad`
- `favorites` → one-to-many → `Favorite`
- `notifications` → one-to-many → `Notification`
- `city` → many-to-one → `City`

---

## 2. `states`

| Column | Type | Constraints |
|--------|------|-------------|
| `name` | String | NOT NULL, UNIQUE |

**Relationships:**
- `cities` → one-to-many → `City`

---

## 3. `cities`

| Column | Type | Constraints |
|--------|------|-------------|
| `name` | String | NOT NULL |
| `state_id` | Integer | FK → states.id, NOT NULL |
| `is_popular` | Boolean | default False |

**Relationships:**
- `state` → many-to-one → `State`

---

## 4. `categories`

| Column | Type | Constraints |
|--------|------|-------------|
| `name` | String | NOT NULL |
| `slug` | String | UNIQUE |
| `icon_url` | String | nullable (emoji or URL) |
| `parent_id` | Integer | FK → categories.id, nullable (self-referential) |

**Relationships:**
- `parent` → self many-to-one → `Category`
- `children` → self one-to-many → `Category`
- `attributes` → one-to-many → `CategoryAttribute`

---

## 5. `category_attributes`

| Column | Type | Constraints |
|--------|------|-------------|
| `category_id` | Integer | FK → categories.id, NOT NULL |
| `name` | String | NOT NULL (e.g., "Fuel Type", "RAM") |
| `slug` | String | NOT NULL |
| `field_type` | String | NOT NULL ("text", "number", "select", "boolean") |
| `is_required` | Boolean | default False |
| `options` | JSON/Text | nullable (for select: comma-separated or JSON) |
| `display_order` | Integer | default 0 |

---

## 6. `ads`

| Column | Type | Constraints |
|--------|------|-------------|
| `title` | String | NOT NULL, indexed |
| `description` | Text | nullable |
| `price` | Numeric(12,2) | nullable |
| `price_negotiable` | Boolean | default False |
| `condition` | String | nullable ("new", "used", "like_new") |
| `ad_type` | String | default "sell" ("sell", "rent") |
| `status` | String | default "active" ("active", "sold", "inactive") |
| `category_id` | Integer | FK → categories.id |
| `city_id` | Integer | FK → cities.id |
| `locality` | String | nullable |
| `user_id` | Integer | FK → users.id, NOT NULL |
| `views` | Integer | default 0 |

**Relationships:**
- `user` → many-to-one → `User`
- `category` → many-to-one → `Category`
- `city` → many-to-one → `City`
- `images` → one-to-many → `AdImage`
- `attribute_values` → one-to-many → `AdAttributeValue`
- `favorites` → one-to-many → `Favorite`

---

## 7. `ad_images`

| Column | Type | Constraints |
|--------|------|-------------|
| `ad_id` | Integer | FK → ads.id, NOT NULL |
| `image_url` | String | NOT NULL |
| `display_order` | Integer | default 0 |
| `is_primary` | Boolean | default False |

---

## 8. `ad_attribute_values`

| Column | Type | Constraints |
|--------|------|-------------|
| `ad_id` | Integer | FK → ads.id, NOT NULL |
| `attribute_id` | Integer | FK → category_attributes.id, NOT NULL |
| `value` | String | NOT NULL |

---

## 9. `favorites`

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | Integer | FK → users.id, NOT NULL |
| `ad_id` | Integer | FK → ads.id, NOT NULL |

**Unique Constraint:** `(user_id, ad_id)` — prevents duplicate favorites.

---

## 10. `chat_rooms`

| Column | Type | Constraints |
|--------|------|-------------|
| `ad_id` | Integer | FK → ads.id, NOT NULL |
| `buyer_id` | Integer | FK → users.id, NOT NULL |
| `seller_id` | Integer | FK → users.id, NOT NULL |

**Unique Constraint:** `(ad_id, buyer_id)` — one room per buyer per ad.

---

## 11. `messages`

| Column | Type | Constraints |
|--------|------|-------------|
| `room_id` | Integer | FK → chat_rooms.id, NOT NULL |
| `sender_id` | Integer | FK → users.id, NOT NULL |
| `content` | Text | NOT NULL |
| `is_read` | Boolean | default False |

---

## 12. `notifications`

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | Integer | FK → users.id, NOT NULL |
| `message` | Text | NOT NULL |
| `type` | String | nullable ("chat", "price_change", "wishlist_update") |
| `is_read` | Boolean | default False |
| `link` | String | nullable (URL to navigate on click) |

---

## 13. `search_alerts`

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | Integer | FK → users.id, NOT NULL |
| `keyword` | String | nullable |
| `category_id` | Integer | FK → categories.id, nullable |
| `city_id` | Integer | FK → cities.id, nullable |
| `min_price` | Numeric | nullable |
| `max_price` | Numeric | nullable |
| `is_active` | Boolean | default True |

---

## 14. `ad_reports`

| Column | Type | Constraints |
|--------|------|-------------|
| `ad_id` | Integer | FK → ads.id, NOT NULL |
| `reporter_id` | Integer | FK → users.id, NOT NULL |
| `reason` | String | NOT NULL ("spam", "fraud", "offensive", "duplicate", "other") |
| `description` | Text | nullable |
| `status` | String | default "pending" ("pending", "resolved", "dismissed") |

---

## 15. `reviews`

| Column | Type | Constraints |
|--------|------|-------------|
| `reviewer_id` | Integer | FK → users.id |
| `seller_id` | Integer | FK → users.id |
| `rating` | Integer | NOT NULL (1-5) |
| `comment` | Text | nullable |

---

## 16. `contact_inquiries`

| Column | Type | Constraints |
|--------|------|-------------|
| `name` | String | NOT NULL |
| `email` | String | NOT NULL |
| `subject` | String | nullable |
| `message` | Text | NOT NULL |
| `status` | String | default "new" |

---

## 17. `ad_packages`

| Column | Type | Constraints |
|--------|------|-------------|
| `name` | String | NOT NULL |
| `price` | Numeric | NOT NULL |
| `features` | Text/JSON | nullable |
| `is_active` | Boolean | default True |

---

## 18. `knowledge_chunks` (pgvector)

| Column | Type | Constraints |
|--------|------|-------------|
| `doc_id` | String | NOT NULL, indexed (document identifier) |
| `chunk_text` | Text | NOT NULL |
| `chunk_index` | Integer | NOT NULL |
| `embedding` | Vector(384) | NOT NULL (all-MiniLM-L6-v2 output) |
| `metadata` | JSON | nullable |

---

## 19. `faqs`

| Column | Type | Constraints |
|--------|------|-------------|
| `question` | String | NOT NULL |
| `keywords` | String | nullable (comma-separated) |
| `answer` | Text | NOT NULL |
| `is_active` | Boolean | default True |

---

## 20. `recently_viewed`

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | Integer | FK → users.id, NOT NULL |
| `ad_id` | Integer | FK → ads.id, NOT NULL |
| `viewed_at` | DateTime | default utcnow, ON UPDATE utcnow |

**Unique Constraint:** `(user_id, ad_id)` — upsert logic, max 20 per user.
