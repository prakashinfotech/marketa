# QuikrClone — API Conventions

> Every API endpoint in the system MUST follow these rules. No exceptions.

---

## 1. Response Format (MANDATORY)

### Standard Response
```json
{
  "success": true,
  "msg": "Human-readable message",
  "data": {}
}
```

### List Response
```json
{
  "success": true,
  "msg": "Items fetched.",
  "data": [ ... ],
  "total": 50,
  "skip": 0,
  "limit": 20
}
```

### Error Response
```json
{
  "success": false,
  "msg": "Descriptive error message",
  "data": {}
}
```

**Rule:** The `data` field is ALWAYS present. For errors, it's `{}` or `[]`. NEVER return `null` or omit it.

---

## 2. URL Conventions

| Pattern | URL | Example |
|---------|-----|---------|
| Base path | `/api/v1/` | — |
| Module prefix | `/api/v1/<module>/` | `/api/v1/ads/` |
| Create | `POST /module/` or `POST /module/create/` | `POST /api/v1/ads/` |
| List | `GET /module/` | `GET /api/v1/ads/` |
| Get by ID | `GET /module/{id}/` | `GET /api/v1/ads/5/` |
| Update | `PUT /module/{id}/update/` | `PUT /api/v1/ads/5/update/` |
| Delete | `DELETE /module/{id}/` | `DELETE /api/v1/ads/5/` |
| Custom action | `POST /module/{id}/action/` | `POST /api/v1/ads/5/view/` |

**Rule:** ALL URLs end with a trailing slash `/`.

---

## 3. HTTP Status Codes

| Code | When to Use |
|------|-------------|
| `200` | Success (read, update, delete) |
| `201` | Created (new resource, optional — 200 is also fine) |
| `400` | Bad request — validation failed, business logic error |
| `401` | Unauthorized — no token or expired token |
| `403` | Forbidden — wrong role |
| `404` | Not found |
| `500` | Internal server error (catch-all in endpoint) |

### How Status Codes Are Set

```python
# CRUD returns a dict:
return {"success": True, "msg": "Created.", "data": {"id": 1}}
return {"success": False, "msg": "Not found.", "data": {}}

# Endpoint wraps with JSONResponse:
return JSONResponse(
    status_code=200 if response.get("success") else 400,
    content={
        "success": response.get("success"),
        "msg": response.get("msg"),
        "data": response.get("data", {}),
    },
)
```

---

## 4. Authentication Rules

### Auth Dependency Shortcuts

| Dependency | Allowed Roles | Use For |
|-----------|---------------|---------|
| `get_current_user` | SuperAdmin (1), Admin (2), User (3) | Any authenticated user |
| `get_current_admin_user` | SuperAdmin (1), Admin (2) | Admin-only endpoints |
| `get_current_user_optional` | Any (returns None if no token) | Optional auth (e.g., recently viewed) |
| No dependency | Guest | Public endpoints (search, view ad) |

### JWT Token Structure

```json
{
  "sub": "123",              // user ID as string
  "token_version": 0,       // matches user.token_version
  "exp": 1714000000         // expiry timestamp
}
```

### Token Storage (Frontend)
- `sessionStorage.setItem('token', accessToken)`
- `sessionStorage.setItem('refreshToken', refreshToken)`
- `sessionStorage.setItem('user', JSON.stringify(userData))`

### Refresh Flow
1. Request gets 401 → interceptor catches
2. Call `POST /api/v1/users/refresh-token/` with refresh token
3. Store new tokens → retry original request
4. If refresh fails → clear storage → redirect to `/login`

---

## 5. Complete API Endpoint Map

### Users (`/api/v1/users/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register/` | Public | Sign up |
| POST | `/login/` | Public | Login → returns tokens |
| POST | `/refresh-token/` | Public | Refresh JWT |
| GET | `/me/` | User | Get current user profile |
| PUT | `/me/update/` | User | Update profile |
| POST | `/me/avatar/` | User | Upload avatar |
| POST | `/send-verification/` | User | Send verification email |
| GET | `/verify/` | Public | Verify email with token |
| POST | `/forgot-password/` | Public | Request password reset |
| POST | `/reset-password/` | Public | Reset password with token |
| POST | `/change-password/` | User | Change password (authenticated) |
| POST | `/request-delete-account/` | User | Request deletion code |
| POST | `/confirm-delete-account/` | User | Confirm deletion with code |

### Ads (`/api/v1/ads/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create ad (FormData with images) |
| GET | `/` | Public | List/search ads with filters |
| GET | `/{id}/` | Public | Get ad details |
| PUT | `/{id}/update/` | Owner | Update ad (FormData) |
| DELETE | `/{id}/` | Owner | Soft-delete ad |
| POST | `/{id}/view/` | Public | Increment view count |
| PATCH | `/{id}/status/` | Owner | Change status (active/sold/inactive) |
| GET | `/{id}/similar/` | Public | Get similar ads |
| GET | `/my-ads/` | User | Get current user's ads |

### Categories (`/api/v1/categories/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all categories (tree) |
| POST | `/` | Admin | Create category |
| GET | `/{id}/attributes/` | Public | Get category attributes |
| POST | `/attributes/` | Admin | Create attribute |

### Locations (`/api/v1/locations/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/states/` | Public | List states |
| GET | `/states/{id}/cities/` | Public | List cities by state |
| GET | `/cities/popular/` | Public | List popular cities |
| POST | `/states/` | Admin | Create state |
| POST | `/cities/` | Admin | Create city |

### Chat (`/api/v1/chat/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/rooms/` | User | Create/get chat room for an ad |
| GET | `/rooms/` | User | List user's chat rooms |
| GET | `/rooms/{id}/messages/` | User | Get messages in a room |
| WS | `/ws/{room_id}?token=xxx` | User | WebSocket connection |

### Favorites (`/api/v1/favorites/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/toggle/` | User | Toggle favorite (add/remove) |
| GET | `/` | User | List favorites |
| GET | `/ids/` | User | List favorited ad IDs (for heart sync) |

### Notifications (`/api/v1/notifications/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | User | List notifications |
| GET | `/unread-count/` | User | Get unread count (for badge) |
| PUT | `/{id}/read/` | User | Mark as read |

### Search Alerts (`/api/v1/alerts/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create alert |
| GET | `/` | User | List alerts |
| PUT | `/{id}/` | User | Update alert |
| DELETE | `/{id}/` | User | Delete alert |
| PATCH | `/{id}/toggle/` | User | Toggle active/inactive |

### Chatbot (`/api/v1/chatbot/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ask/` | Public | Ask chatbot a question |
| POST | `/upload-doc/` | SuperAdmin | Upload knowledge document |
| GET | `/documents/` | SuperAdmin | List indexed documents |
| DELETE | `/documents/{id}/` | SuperAdmin | Delete document |
| GET | `/faqs/` | Public | List FAQs |
| POST | `/faqs/` | Admin | Create FAQ |
| PUT | `/faqs/{id}/` | Admin | Update FAQ |
| DELETE | `/faqs/{id}/` | Admin | Delete FAQ |

### Reports (`/api/v1/reports/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Report an ad |
| GET | `/` | Admin | List all reports |
| PATCH | `/{id}/` | Admin | Update report status |

### Contact (`/api/v1/contact/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Submit contact form |
| GET | `/` | Admin | List inquiries |

### Recently Viewed (`/api/v1/recently-viewed/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Record ad view |
| GET | `/` | User | Get recently viewed ads |
