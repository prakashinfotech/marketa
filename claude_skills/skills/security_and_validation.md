# QuikrClone — Security & Validation Rules

> Every security measure, validation rule, and protection mechanism in the system.

---

## 1. Authentication Security

### Password Rules
- **Minimum length:** 6 characters
- **Hashing:** bcrypt with auto-generated salt
- **Truncation:** Passwords truncated to 72 bytes before hashing (bcrypt limit)
- **Storage:** Only hash stored in DB, plain text never logged

### JWT Security
- **Algorithm:** HS256
- **Secret:** `JWT_SECRET_KEY` from environment
- **Access token expiry:** 30 minutes
- **Refresh token expiry:** 7 days
- **Token versioning:** `token_version` in JWT payload must match `user.token_version` in DB
  - Incremented on: password reset, password change
  - Effect: invalidates ALL existing tokens for that user

### Session Storage
- Tokens in `sessionStorage` (cleared on tab close, not persistent like localStorage)
- Keys: `token`, `refreshToken`, `user`
- Auto-refresh: 401 response triggers refresh token flow

---

## 2. Role-Based Access Control (RBAC)

### Role Constants (`app/core/roles.py`)
```python
class RoleConstants:
    SUPER_ADMIN = 1
    ADMIN = 2
    USER = 3
```

### Auth Dependencies
| Dependency | Roles Allowed | Import |
|-----------|---------------|--------|
| `get_current_user` | 1, 2, 3 | `from app.api.deps import get_current_user` |
| `get_current_admin_user` | 1, 2 | `from app.api.deps import get_current_admin_user` |
| `get_current_user_optional` | Any (returns None if no token) | `from app.api.deps import get_current_user_optional` |

### Frontend Admin Guard
```jsx
const isAdmin = user?.role_id === 1 || user?.role_id === 2;
// AdminLayout redirects non-admins to /
```

---

## 3. Input Validation

### Backend Validation
- Pydantic schemas validate request bodies automatically
- CRUD layer catches `IntegrityError` for unique constraint violations
- All SQL queries use SQLAlchemy ORM (parameterized) — **SQL injection impossible**

### Frontend Validation (PostAd form)
| Field | Rule | Error Message |
|-------|------|---------------|
| Title | Required, non-empty | "Title is required" |
| Category | Required | "Please select a category" |
| City | Required (State → City) | "Please select a city" |
| Description | Required | "Description is required" |
| Price | Required, > 0 | "Price must be greater than 0" |
| Images | At least 1 (create), at least 1 remaining (edit) | "Please upload at least 1 image" |

### Frontend Validation (Signup)
| Field | Rule |
|-------|------|
| Name | Required (HTML `required`) |
| Username | Required |
| Email | Required, valid format (`type="email"`) |
| Password | Required, ≥ 6 characters |

### Frontend Validation (Change Password)
| Field | Rule |
|-------|------|
| Old Password | Required |
| New Password | ≥ 6 chars, ≠ old password |
| Confirm Password | Must match new password |

---

## 4. File Upload Security

### Image Upload Limits
| Rule | Value | Where Enforced |
|------|-------|----------------|
| Max file size | 5MB (5 × 1024 × 1024 bytes) | Frontend + Backend |
| Max images per ad | 5 | Frontend + Backend |
| Allowed types (ads) | `.jpg`, `.jpeg`, `.png`, `.webp` | Backend (extension check) |
| Allowed types (avatar) | `.jpg`, `.jpeg`, `.png`, `.webp` | Backend |
| Allowed types (knowledge docs) | `.md`, `.txt`, `.pdf` | Frontend + Backend |

### Frontend File Size Check Pattern
```jsx
const MAX_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  setError('File exceeds the 5MB size limit.');
  return;
}
```

### Backend File Size Check Pattern
```python
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
file.file.seek(0, 2)
file_size = file.file.tell()
file.file.seek(0)
if file_size > MAX_FILE_SIZE:
    return {"success": False, "msg": f"File exceeds the 5MB size limit."}
```

### Image Storage
- Path: `uploads/users/{user_id}/ads/{ad_id}/{random_hex}.ext`
- Filename: UUID-based (prevents path traversal)
- Static mount: `/uploads` → `uploads/` directory

---

## 5. Ownership Verification

### Ad Operations
- **Edit ad:** Backend checks `ad.user_id == current_user.id`
- **Edit ad (frontend):** `PostAd.jsx` checks `ad.user.id !== user.id` → redirect to `/`
- **Delete ad:** Backend checks ownership before soft-delete
- **Change status:** Backend checks ownership

### Chat Operations
- Users can only access rooms they are part of (buyer or seller)
- Room creation prevented if user is the ad owner

---

## 6. Soft Delete Security

### Account Deletion
1. User requests deletion → backend sends code to email
2. User enters code → backend verifies
3. On confirmation:
   - All user's ads: `is_delete=True`
   - User record: `is_delete=True`, `is_active=False`
   - Email anonymized: `email_deleted_{timestamp}@deleted.local`
   - Username anonymized: `deleted_user_{timestamp}`
4. Same email can now re-register (unique constraint unblocked)

### Ad Deletion
- `is_delete=True` and `deleted_at=utcnow()`
- ALL queries filter: `.filter(Ad.is_delete.isnot(True))`
- Soft-deleted ads invisible in search, browse, favorites

---

## 7. Rate Limiting

- Enabled via `slowapi` middleware in `main.py`
- `Limiter(key_func=get_remote_address)` — rate limits by IP
- Can be applied to specific endpoints:
```python
@router.post("/login/")
@limiter.limit("5/minute")
def login(...):
```

---

## 8. Email Enumeration Prevention

- `/forgot-password` ALWAYS returns: `"If an account with that email exists, a reset link has been sent"`
- Never reveals whether an email is registered
- This is a security best practice

---

## 9. View Count Anti-Inflation

- Frontend uses `sessionStorage` key `viewedAds` (JSON array of ad IDs)
- Before calling `/ads/{id}/view/`, checks if ID already in the array
- If already viewed in this session → skip API call
- Prevents view count from inflating on page refresh

---

## 10. XSS Prevention

- React auto-escapes JSX expressions by default
- Never use `dangerouslySetInnerHTML` except for trusted markdown rendering
- All user input sanitized through Pydantic on backend

---

## 11. CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Note:** Replace `allow_origins=["*"]` with specific frontend domain.

---

## 12. No Browser Dialogs Rule

**NEVER** use these in the codebase:
- ❌ `window.confirm()`
- ❌ `window.alert()`
- ❌ `window.prompt()`

**ALWAYS** use custom Tailwind modals with proper animation (`.animate-scale-in`).
