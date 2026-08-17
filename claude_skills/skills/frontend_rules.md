# Marketa — Frontend Rules (React Skill File)

> **Scope:** This file governs ALL JSX/CSS code in the `frontend/` directory. Claude MUST follow these patterns exactly.

---

## 1. Component Template

Every component follows this exact pattern:

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { SomeIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ComponentName() {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/endpoint/');
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.msg || 'Failed to load data.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section (optional) */}
      <section className="bg-primary-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Page Title</h1>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5" /> {error}</div>}
        {success && <div className="toast-success mb-6"><CheckCircle className="w-5 h-5" /> {success}</div>}
        {/* ... */}
      </section>
    </div>
  );
}
```

---

## 2. Component Rules

1. **Functional components only** — NO class components (one exception: `ErrorBoundary` must be a class — React requires it).
2. **File naming:** PascalCase (e.g., `PostAd.jsx`, `AdminFAQs.jsx`).
3. **One component per file.**
4. **Page components** go in `frontend/src/components/` (flat).
5. **Reusable primitives** go in `frontend/src/components/ui/` and are exported via `ui/index.js`.
6. **`export default`** — every component is a default export.
7. **No prop drilling** — use `useAuth()` from `AuthContext` and `useToast()` from `ToastContext`.

---

## 3. State Management

| Scope | Method |
|-------|--------|
| Auth state (user, token) | `AuthContext` via `useAuth()` hook |
| Component-local state | `useState()` |
| Complex local state | `useReducer()` (rarely needed) |
| Side effects | `useEffect()` |
| No Redux, no Zustand | Keep it simple |

---

## 4. API Integration

```jsx
import api from '../api';

// GET request
const res = await api.get('/ads/');
if (res.data.success) { /* use res.data.data */ }

// POST request
const res = await api.post('/ads/create/', { title, price });

// POST with FormData (file upload)
const formData = new FormData();
formData.append('file', file);
images.forEach(img => formData.append('images', img));
const res = await api.post('/ads/create/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// PUT request
const res = await api.put('/users/me/update/', { name, phone });

// DELETE request
const res = await api.delete(`/chatbot/documents/${docId}/`);
```

### API Rules
1. **ALWAYS** use the `api` instance from `src/api.js` — never raw `axios` or `fetch`.
2. **ALWAYS** check `res.data.success` before using data.
3. **ALWAYS** handle loading states with `setLoading(true/false)`.
4. **ALWAYS** handle errors with try/catch and show user-friendly messages.
5. **NEVER** expose raw error objects to the user.

---

## 5. Authentication Patterns

```jsx
import { useAuth } from '../AuthContext';

// Inside component:
const { user, isLoggedIn, login, logout } = useAuth();

// Protect a page:
useEffect(() => {
  if (!isLoggedIn) navigate('/login');
}, [isLoggedIn]);

// Check admin:
const isAdmin = user?.role_id === 1 || user?.role_id === 2;

// After login:
login(accessToken, refreshToken, userData);

// After logout:
logout();
```

### Session Storage
- Tokens stored in `sessionStorage` (not localStorage) for security.
- Keys: `token`, `refreshToken`, `user` (JSON string).

---

## 6. Styling Rules

### Use Tailwind Utility Classes
```jsx
// ✅ Correct
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

// ❌ Wrong — no inline styles
<div style={{backgroundColor: 'white', padding: '24px'}}>
```

### Use Design System Classes (from index.css)
```jsx
// Card container
<div className="card p-6">

// Primary button
<button className="btn-primary">Submit</button>

// Form input
<input className="input-field" />

// Form label
<label className="label">Name</label>

// Badge
<span className="badge bg-indigo-50 text-indigo-700">Active</span>

// Toast messages
<div className="toast-success"><CheckCircle /> Success!</div>
<div className="toast-error"><AlertCircle /> Error!</div>
```

### Color Palette
| Purpose | Tailwind Class | Hex |
|---------|---------------|-----|
| Primary | `primary-600` / `indigo-600` | #4f46e5 |
| Primary hover | `primary-700` / `indigo-700` | #4338ca |
| Success | `emerald-500` | #10b981 |
| Danger | `red-500` | #ef4444 |
| Background | `gray-50` | #f8fafc |
| Card border | `gray-100` | #f1f5f9 |
| Text primary | `gray-900` | #111827 |
| Text secondary | `gray-500` | #6b7280 |

### Font
- **Family:** Inter (imported from Google Fonts in `index.css`)
- **Weights used:** 300, 400, 500, 600, 700, 800, 900

---

## 7. Custom Modal Pattern (for confirmations)

Replace ALL `window.confirm()` with custom modals:

```jsx
const [showModal, setShowModal] = useState(false);
const [targetId, setTargetId] = useState(null);

const handleDeleteClick = (id) => {
  setTargetId(id);
  setShowModal(true);
};

const handleConfirmDelete = async () => {
  // Perform delete with targetId
  setShowModal(false);
  setTargetId(null);
};

// In JSX:
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
        <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleConfirmDelete}
          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  </div>
)}
```

**Rule:** NEVER use `window.confirm()`, `window.alert()`, or `window.prompt()` anywhere in the codebase.

---

## 8. Icon Usage

Use **Lucide React** icons exclusively:

```jsx
import { Search, Heart, MapPin, Clock, Eye, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

<Search className="w-5 h-5 text-gray-400" />
<Loader2 className="w-4 h-4 animate-spin" />
```

**Rule:** NEVER use emoji as functional icons. NEVER use Font Awesome or other icon libraries.

---

## 9. Loading State Pattern

```jsx
// Full page loader
<div className="min-h-[60vh] flex items-center justify-center">
  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
</div>

// Button loader
<button disabled={loading}>
  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save'}
</button>
```

---

## 10. Form Pattern

Either use raw `.input-field` / `.label` classes (legacy), OR use the `Input` / `Textarea` / `Select` primitives (preferred for new code):

```jsx
import { Input, Textarea, Button } from './ui';

<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Name"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter name"
    error={errors.name}
    hint="Public display name"
  />
  <Textarea label="Bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
  <Button type="submit" loading={loading} fullWidth>
    {loading ? 'Saving…' : 'Create'}
  </Button>
</form>
```

---

## 11. Reusable UI Primitives (`components/ui/`)

For all new code, prefer these over re-implementing buttons/cards/inputs/modals.
They wrap the existing `.btn-primary` / `.card` / `.input-field` design classes — **visuals are identical**, just less duplication.

```jsx
import {
  Button, Card, CardHeader,
  Input, Textarea, Select,
  Modal, ConfirmDialog,
  Skeleton, SkeletonText, SkeletonAdCard, SkeletonList,
  EmptyState,
  Spinner, PageSpinner,
  ImageWithSkeleton,
} from './ui';
```

### Button
```jsx
<Button variant="primary" size="md" leftIcon={Plus} loading={saving} onClick={save}>Save</Button>
<Button as={Link} to="/post-ad" variant="amber" leftIcon={PlusCircle}>Post Free Ad</Button>
<Button variant="secondary" fullWidth>Cancel</Button>
```
Variants: `primary` (indigo gradient), `secondary` (outlined), `ghost`, `danger`, `amber` (post-ad CTA).

### Card
```jsx
<Card padding="md">...</Card>
<Card padding="lg" interactive onClick={...}>...</Card>
<Card padding="none">
  <CardHeader title="Settings" description="Manage your profile" action={<Button>Edit</Button>} />
</Card>
```

### Modal & ConfirmDialog
```jsx
const [open, setOpen] = useState(false);
<Modal open={open} onClose={() => setOpen(false)} title="Edit profile" size="md"
       footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>Save</Button></>}>
  ...form...
</Modal>

// Drop-in replacement for window.confirm():
<ConfirmDialog
  open={deleting}
  onClose={() => setDeleting(false)}
  onConfirm={handleDelete}
  title="Delete this ad?"
  description="This cannot be undone."
  confirmLabel="Delete"
  loading={isDeleting}
/>
```
Handles Esc, scroll lock, backdrop click, focus, ARIA — automatically.

### Skeletons (preferred over spinners for content)
```jsx
{loading ? <SkeletonList count={8} /> : <AdsGrid ads={ads} />}
<Skeleton className="h-4 w-32" />
<SkeletonText lines={3} />
```

### EmptyState
```jsx
<EmptyState
  icon={Heart}
  title="No favorites yet"
  description="Tap the heart on any ad to save it here."
  action={<Button as={Link} to="/search">Browse ads</Button>}
/>
```

### ImageWithSkeleton (use on every ad image)
```jsx
<ImageWithSkeleton
  src={ad.image_url}
  alt={ad.title}
  aspect="aspect-[4/3]"
  wrapperClassName="rounded-xl"
/>
```
Lazy-loads, shows skeleton, falls back to a "Image unavailable" state on error.

---

## 12. Toast Notifications

Replace inline `setError` / `setSuccess` patterns with global toasts in new code:

```jsx
import { useToast } from '../ToastContext';

export default function MyComponent() {
  const toast = useToast();

  const save = async () => {
    try {
      const res = await api.post('/...');
      if (res.data.success) toast.success('Saved successfully');
      else toast.error(res.data.msg || 'Save failed');
    } catch {
      toast.error('Something went wrong');
    }
  };
}
```

**Rule:** for user-actionable feedback (save/delete/share), use toasts. For form-field validation errors, keep them inline on the `Input` (`<Input error="…">`).

---

## 13. Routing & Code Splitting

All page components are lazy-loaded in `App.jsx`:

```jsx
const NewPage = lazy(() => import('./components/NewPage'));

<Route path="/new" element={<PublicLayout><NewPage /></PublicLayout>} />
```
`Suspense` is already provided by `PublicLayout` with a `<PageSpinner />` fallback — no need to add another.

**Rule:** every new page must be added with `React.lazy()`, never a static import.

---

## 14. Error Handling

`ErrorBoundary` is mounted at the root of `App.jsx`. It catches any uncaught render error and shows a recovery UI. You generally don't need to add boundaries inside pages — only for high-risk widgets (e.g. embedded 3rd-party iframes).

---

## 15. Keyboard Shortcuts

`<GlobalShortcuts />` is mounted once in `App.jsx`. Shortcuts:
- `/` — focus the navbar search input
- `?` — open the shortcuts help dialog
- `g h` → home, `g a` → post-ad, `g m` → my-ads, `g f` → favorites
- `Esc` — close any open modal / blur the focused input

If you add a new page worth a shortcut, edit `GlobalShortcuts.jsx` (don't add separate global listeners in random components).
