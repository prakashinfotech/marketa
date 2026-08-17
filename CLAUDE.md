# CLAUDE.md - Marketa Project Guide

This guide provides essential commands and context for working on the Marketa project.

## Build and Development Commands

### Backend (FastAPI)
- **Start Server**: `cd backend && uvicorn main:app --reload --port 8000`
- **Database Migrations**: `cd backend && alembic upgrade head`
- **Create Migration**: `cd backend && alembic revision --autogenerate -m "description"`
- **Seed Data**: `cd backend && python seed.py`
- **Dependencies**: Uses `uv` (managed in `backend/.venv`)

### Frontend (React + Vite)
- **Install Dependencies**: `cd frontend && npm install`
- **Start Dev Server**: `cd frontend && npm run dev`
- **Build Production**: `cd frontend && npm run build`
- **Preview Build**: `cd frontend && npm run preview`

> No ESLint config is checked in yet. Recommended next step: add
> `eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks` and wire up
> a `lint` script — it would catch hook-deps mistakes automatically.

## Project Architecture

```
quikr_copy/
├── .env                    # Shared environment variables
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── core/           # Security (JWT), config, constants
│   │   ├── db/             # Session management and base models
│   │   ├── modules/        # Modular domain logic (Users, Ads, etc.)
│   │   │   └── <module>/   # model.py, schema.py, crud.py, endpoint.py
│   │   ├── api/            # API router and dependencies
│   │   └── utils/          # Logging and utilities
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI entry point
│   └── pyproject.toml      # Python dependencies
└── frontend/                  # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── ui/             # Reusable primitives (Button, Card, Input, Modal,
    │   │   │                   #   Skeleton, EmptyState, Spinner, ImageWithSkeleton)
    │   │   ├── ErrorBoundary.jsx     # Global crash boundary
    │   │   ├── NotFound.jsx          # 404 page
    │   │   ├── GlobalShortcuts.jsx   # Keyboard shortcuts (/, ?, g h/a/m/f, Esc)
    │   │   ├── ShareButton.jsx       # Reusable share menu (Web Share API + fallback)
    │   │   └── ...page components
    │   ├── AuthContext.jsx     # Global authentication state
    │   ├── ToastContext.jsx    # Global toast notifications (useToast hook)
    │   ├── App.jsx             # Lazy-loaded routes wrapped in ErrorBoundary + ToastProvider
    │   └── api.js              # Axios instance with JWT interceptors
    ├── package.json
    └── vite.config.js
```

## Frontend Architecture (Production Patterns)

### Composition order (top of `App.jsx`)
```
<ErrorBoundary>
  <AuthProvider>
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <GlobalShortcuts />
        <Routes>...</Routes>
```
Keep this order — `ErrorBoundary` must wrap everything; `ToastProvider` needs to be inside Router so toasts work on every page.

### Reusable UI primitives (`components/ui/`)
Import from the barrel:
```jsx
import { Button, Card, Input, Modal, ConfirmDialog, Skeleton, SkeletonAdCard,
         EmptyState, PageSpinner, ImageWithSkeleton } from './ui';
```
**Rule:** prefer these over re-implementing buttons/cards/inputs/modals. Visual style matches the existing indigo/purple design system.

### Toast notifications
```jsx
import { useToast } from '../ToastContext';
const toast = useToast();
toast.success('Saved');
toast.error('Failed to save');
toast.info('Heads up');
toast.warning('Careful');
```
**Rule:** replace ad-hoc inline alerts in new code with `useToast()`.

### Routing
- All page components are lazy-loaded via `React.lazy()` in `App.jsx`. Add new pages the same way.
- Unknown routes resolve to `<NotFound />`.
- Use `<PageSpinner />` from `ui` as the Suspense fallback.

### Keyboard shortcuts (global)
`/` focuses search · `?` opens help · `g h/a/m/f` jumps to home / post-ad / my-ads / favorites · `Esc` closes dialogs

### Accessibility baselines
- Skip-to-main link present in `PublicLayout`.
- Modals use `role="dialog"`, `aria-modal`, Esc-to-close, focus return, scroll lock.
- Toasts use `aria-live="polite"` (errors use `role="alert"`).
- Always use semantic HTML and `aria-label` for icon-only buttons.

## Code Style Guidelines
- **Python**: Follow PEP 8. Use type hints for all function signatures. Use standard response format: `{"success": bool, "msg": str, "data": any}`.
- **JavaScript/React**: Use Functional Components and Hooks. Use Tailwind CSS for styling. Use Lucide React for icons.
- **Naming**: 
  - Python: `snake_case` for functions/variables, `PascalCase` for classes.
  - JS: `camelCase` for variables, `PascalCase` for Components.

## Authentication Flow
1. User logs in via `/api/v1/users/login/`.
2. Backend returns JWT `access_token` + `refresh_token`.
3. Frontend stores both in `sessionStorage` (keys: `token`, `refreshToken`, `user`).
4. Axios interceptor (`src/api.js`) attaches `Authorization: Bearer <token>` to every request.
5. On 401, a **single-flight** refresh hits `/users/refresh-token/`; other in-flight requests queue on the same refresh promise and retry once it resolves.
6. If refresh fails, a `auth:forced-logout` event fires; `AuthContext` listens and performs a clean logout (no hard redirect).
7. Cross-tab login/logout is mirrored via the browser `storage` event.
