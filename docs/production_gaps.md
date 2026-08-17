# Marketa — Production Readiness Gap Analysis

> **Date:** 2026-05-18
> **Author:** Claude Code (analysis only — no implementation)
> **Purpose:** Module-by-module audit of missing CRUD operations, APIs, frontend integrations, validations, and production-grade features. Review and approve subsets before implementation.

**Priority legend**
- 🔴 **P0** — required for safe production launch (security / data-loss / broken flows)
- 🟠 **P1** — high impact on UX / trust / scale; expected by users
- 🟡 **P2** — polish / nice-to-have; raises quality bar
- ⚪ **P3** — future enhancement, scope-creep candidate

Where useful I show **(backend)** / **(frontend)** / **(full-stack)** to indicate where the work lives.

---

## 1. Users / Auth

### Missing CRUD / APIs
| ID | Priority | Item |
|---|---|---|
| USR-1 | 🟠 P1 | **List sessions / revoke other sessions** — multi-device sign-in is invisible to the user. Add `GET /users/me/sessions/`, `DELETE /users/me/sessions/{id}/`. Requires a `user_sessions` table (refresh-token jti + UA + IP + last-active). (full-stack) |
| USR-2 | 🟠 P1 | **Resend verification email** — endpoint exists but no rate-limit-respecting UI on Profile page when `is_verified=false`. (frontend) |
| USR-3 | 🟠 P1 | **Resend password-reset email cooldown** — backend should track last-sent timestamp and return cooldown remaining (currently spammable up to the rate-limit). (backend) |
| USR-4 | 🟠 P1 | **Change email flow** — currently `UpdateMyProfileRequest` allows changing email silently. Should require: verify new email via token, send "your email was changed" notification to the old address, log security event. (full-stack) |
| USR-5 | 🟡 P2 | **Soft-delete (account deactivation) UI** — backend supports it (`is_delete`); add a "Deactivate / delete my account" section on Profile with the existing confirm-code flow. (frontend) |
| USR-6 | 🟡 P2 | **Profile completeness indicator** — show % complete (name, phone verified, avatar, etc.) to nudge users to fill missing fields. (frontend) |
| USR-7 | 🟡 P2 | **Login activity log** — show user their last 10 logins (timestamp, IP, UA) on Profile. Requires audit table. (full-stack) |
| USR-8 | ⚪ P3 | **2FA (TOTP)** — backend `pyotp` + recovery codes; UI in Profile → Security. |
| USR-9 | ⚪ P3 | **Social login (Google)** — OAuth via authlib; replace/augment email-password. |

### Validations & errors
| USR-V1 | 🔴 P0 | **Phone validation** — `phone` is currently `Optional[str]` with no format/regex check. Add E.164 / Indian (`+91XXXXXXXXXX`) validation. |
| USR-V2 | 🟠 P1 | **Email uniqueness on update** — `update_my_profile` should reject if the new email already belongs to another active user (race-safe at the DB level too — add a unique partial index `WHERE is_delete = false`). |
| USR-V3 | 🟠 P1 | **Username uniqueness + character set** — only `[a-z0-9_]{3,30}`. Currently any string passes. |
| USR-V4 | 🟠 P1 | **Old password required for email change** — sensitive field changes should ask for the password again. |
| USR-V5 | 🟡 P2 | **Name length / safe chars** — strip leading/trailing whitespace, max 100, no control chars. |

### Auth/AuthZ
| USR-A1 | 🟠 P1 | **Token rotation on refresh** — current refresh endpoint returns a new refresh-token but does not invalidate the old one. A leaked old refresh-token stays valid. Add jti tracking + reuse detection. |
| USR-A2 | 🟠 P1 | **Account lockout after N failed logins** — rate-limit alone allows distributed attacks; add per-account lockout with backoff. |
| USR-A3 | 🟡 P2 | **Token revocation list (logout-everywhere)** — already partially supported by `token_version`; expose a "Sign out of all devices" button on Profile. |
| USR-A4 | 🟡 P2 | **Admin → user impersonation** for support (with audit trail). |

---

## 2. Ads

### Missing CRUD / APIs
| AD-1 | 🔴 P0 | **Ad edit history / audit** — when a user edits an ad (price, title) the change is silent. For trust/anti-scam, store an audit of price changes. (full-stack) |
| AD-2 | 🟠 P1 | **Repost / mark-as-sold / reactivate** flows — model has `status` but no explicit endpoints. Today users have only "edit"/"delete". (full-stack) |
| AD-3 | 🟠 P1 | **Bulk operations on My Ads** — multi-select delete / pause / unpause. (frontend + backend bulk endpoint) |
| AD-4 | 🟠 P1 | **Image reorder + remove individual images** during edit. Today users can only re-upload entire set. (full-stack) |
| AD-5 | 🟠 P1 | **Server-side ad expiry** — ads currently never expire automatically. Add `expires_at`, a daily job to auto-pause expired ads, and a "renew" button. (backend cron / scheduler) |
| AD-6 | 🟡 P2 | **Draft ads** — let users save a draft and resume later. New `status="draft"`. (full-stack) |
| AD-7 | 🟡 P2 | **Saved drafts auto-save** while user is typing in PostAd. (frontend localStorage + debounced save). |

### Search / filter / sort / pagination
| AD-S1 | 🔴 P0 | **Cursor- or offset-based pagination on listings** — `/ads/`, `/ads/search/`, `/users/me/ads/` must return `{items, total, page, page_size, has_more}`. Today some return all rows. (backend) |
| AD-S2 | 🟠 P1 | **Server-side sort** — newest, price-asc, price-desc, popular (views), distance. Frontend filter UI exists but several sorts are not implemented server-side. |
| AD-S3 | 🟠 P1 | **Full-text search** — `title` + `description` + category name. Use Postgres `tsvector` + `tsquery` with `pg_trgm` for fuzzy. |
| AD-S4 | 🟠 P1 | **Filter by price range / condition / negotiable / posted-within-X-days** — backend endpoint supports some; ensure all filter combinations are accepted and SQL-injection-safe (use ORM params). |
| AD-S5 | 🟡 P2 | **Geographic search** — radius around lat/lng. Adds `city.lat/lng` + a `GEOGRAPHY` column or simple haversine. |

### Validations
| AD-V1 | 🔴 P0 | **Server-side price/title/description limits** — verify caps match the client (title ≤ 150, description ≤ 5000, price ≥ 0, price ≤ Decimal max). |
| AD-V2 | 🔴 P0 | **Profanity / spam keyword filter** at create + edit. Block known scam patterns. |
| AD-V3 | 🟠 P1 | **Phone / email scraping prevention in description** — strip or warn when ad text contains a phone number (drives scams off-platform). |
| AD-V4 | 🟠 P1 | **Image count cap** — max 8 images per ad, validated server-side. |
| AD-V5 | 🟠 P1 | **Category-attribute validation** — when an ad is in "Mobiles" with required attribute "Brand", reject create if missing. |

### UX / states
| AD-U1 | 🟠 P1 | **Optimistic favorites toggle** with revert on error. |
| AD-U2 | 🟠 P1 | **Saved-search → email/notification alerts** — `search_alerts` exists; add an opt-in checkbox after a search returns 0 results: "Notify me when matching ads are posted." |
| AD-U3 | 🟡 P2 | **Skeleton + empty state on SearchResults**, with "Clear filters" CTA and "Create alert" CTA. |
| AD-U4 | 🟡 P2 | **Image lightbox** with keyboard nav on AdDetails. |
| AD-U5 | 🟡 P2 | **Recently viewed strip persistence** for guests via localStorage; merge into server-side on login. |

---

## 3. Categories

### Missing CRUD
| CAT-1 | 🟠 P1 | **Reorder categories** — admin drag-and-drop or `display_order` field on the model. |
| CAT-2 | 🟠 P1 | **Category icon / image upload** — currently icons are hard-coded in `HomePage.jsx` (`Smartphone`, `Car`, …) instead of being driven by data. (full-stack) |
| CAT-3 | 🟠 P1 | **Bulk import/export categories** (CSV) — admin tool for seeding. |
| CAT-4 | 🟡 P2 | **Subcategory / nested categories** beyond depth-1. Schema supports it; UI doesn't fully render hierarchy. |

### Category Attributes
| CAT-A1 | 🟠 P1 | **Required vs optional attribute flag** + UI enforcement on PostAd. |
| CAT-A2 | 🟠 P1 | **Attribute reorder** within a category. |
| CAT-A3 | 🟡 P2 | **Attribute deletion impact warning** — show count of ads using the attribute before allowing delete. |

---

## 4. Locations

| LOC-1 | 🟠 P1 | **Restrict admin delete when in use** — currently a city with active ads can be deleted, orphaning the ads. Add FK-protect / count check. |
| LOC-2 | 🟠 P1 | **Bulk seed locations from CSV** (admin). |
| LOC-3 | 🟡 P2 | **Geocoding fields** (`lat`, `lng`) for radius search (ties into AD-S5). |
| LOC-4 | 🟡 P2 | **Detect user city from IP / geolocation** on first visit and offer "Use my location". |

---

## 5. Favorites

| FAV-1 | 🟠 P1 | **Sort favorites by date added / price / availability** on the Favorites page. |
| FAV-2 | 🟠 P1 | **Bulk delete from favorites** (multi-select). |
| FAV-3 | 🟠 P1 | **"Item no longer available" badge** when a favorited ad is deleted / sold / paused; option to keep or auto-cleanup. |
| FAV-4 | 🟡 P2 | **Notifications when favorited ad's price drops** — wire into existing notifications module. |
| FAV-5 | 🟡 P2 | **Optimistic toggle** + skeleton on Favorites. |

---

## 6. Chat / Messaging

### Backend
| CHT-B1 | 🔴 P0 | **Auth verification on every WS message** — currently authed once at handshake; if a user is banned mid-session they can keep sending. Re-validate token periodically. |
| CHT-B2 | 🔴 P0 | **Block / report user in chat** — endpoints to block a user (prevents new rooms) and report a message. |
| CHT-B3 | 🟠 P1 | **Read receipts** — `read_at` column on messages + a WS event when the other party reads. |
| CHT-B4 | 🟠 P1 | **Typing indicator** — ephemeral WS event. |
| CHT-B5 | 🟠 P1 | **Message pagination** — `/chat/rooms/{id}/messages/?cursor=...` instead of loading all messages at once. |
| CHT-B6 | 🟠 P1 | **Message content limits** — max length, no raw URLs without warning, no phone number in text (anti-scam). |
| CHT-B7 | 🟡 P2 | **Image / attachment support** — file upload + size/MIME validation (reuse the image-upload helper). |
| CHT-B8 | 🟡 P2 | **Redis pub-sub for WS broadcasts** (BE-015 from earlier audit) — required to scale beyond 1 uvicorn worker. |
| CHT-B9 | 🟡 P2 | **Delete-for-me / delete-for-everyone** with audit. |

### Frontend
| CHT-F1 | 🟠 P1 | **WS auto-reconnect with exponential backoff** when the socket drops. Today the user must reload the page. |
| CHT-F2 | 🟠 P1 | **Unsent / failed message states** — show pending / failed bubbles with retry. |
| CHT-F3 | 🟠 P1 | **Search messages by content** within a room. |
| CHT-F4 | 🟡 P2 | **Persisted "last read" per room** + sync to backend. |
| CHT-F5 | 🟡 P2 | **Mobile chat layout polish** — currently rooms-list+messages-pane is desktop-first. |

---

## 7. Chatbot

| BOT-1 | 🟠 P1 | **Conversation history** — persist user ↔ bot turns; today each session is ephemeral. |
| BOT-2 | 🟠 P1 | **Rate-limit per user** (otherwise a single user can exhaust the Groq quota). |
| BOT-3 | 🟠 P1 | **Knowledge-base versioning** — admin can upload a new doc, but no way to roll back. |
| BOT-4 | 🟡 P2 | **"Was this helpful?" feedback** per response, persisted for tuning. |
| BOT-5 | 🟡 P2 | **Streaming responses** (SSE) instead of waiting for full completion. |
| BOT-6 | 🟡 P2 | **Citations** — show which KB doc the answer came from. |

---

## 8. Search Alerts

| ALR-1 | 🟠 P1 | **Frequency control** — instant / daily / weekly delivery. Backend currently fires per-ad-created. |
| ALR-2 | 🟠 P1 | **Pause / resume alert** (currently only delete). |
| ALR-3 | 🟠 P1 | **Email delivery** (currently only in-app notifications); reuse SMTP utility. |
| ALR-4 | 🟡 P2 | **One-click "Create alert from current search"** on SearchResults. |
| ALR-5 | 🟡 P2 | **Cap per user** (e.g. 10 alerts) with friendly error message. |

---

## 9. Notifications

| NOT-1 | 🟠 P1 | **Mark single notification as read** (route exists?) + **mark all as read** on Notifications page. Verify both work end-to-end. |
| NOT-2 | 🟠 P1 | **Filter by type** (new-message, favorite-price-drop, system, admin). |
| NOT-3 | 🟠 P1 | **Real-time push** via WS or SSE — currently the badge only refreshes on route change (30 s throttle after recent fix). |
| NOT-4 | 🟠 P1 | **Email notifications opt-in toggle** in Profile → Preferences. |
| NOT-5 | 🟡 P2 | **Notification grouping** — "3 new messages in Chat" instead of 3 rows. |
| NOT-6 | 🟡 P2 | **Pagination + infinite scroll** on Notifications. |

---

## 10. Reports / Moderation

| RPT-1 | 🔴 P0 | **Admin actions on a report** — "approve report → hide ad / ban user / dismiss" with audit. Today reports are only listed. |
| RPT-2 | 🟠 P1 | **One-report-per-user-per-ad** dedupe + show "you already reported this" state in UI. |
| RPT-3 | 🟠 P1 | **Reasons enum** centralized (spam / fraud / inappropriate / duplicate / wrong-category / other) — both ends agree on values. |
| RPT-4 | 🟠 P1 | **User report counter** — auto-flag users with > N reports for admin review. |
| RPT-5 | 🟡 P2 | **Notification to reporter** when a report is resolved. |

---

## 11. Recently Viewed

| RV-1 | 🟠 P1 | **Cap per user** (last 50). Backend trim policy. |
| RV-2 | 🟡 P2 | **"Clear recently viewed"** button (HomePage already has it — verify works). |
| RV-3 | 🟡 P2 | **Guest support** — store in localStorage, merge into server on login. |

---

## 12. Reviews 🆕 (model exists, no CRUD/endpoint/UI)

This module has a database model but **zero implementation**. Decide first whether to ship it.

| REV-1 | 🟠 P1 | **CRUD endpoints**: create review (only on completed transactions), list reviews for a user, edit (within 24h), delete (admin-only). |
| REV-2 | 🟠 P1 | **Aggregate rating** on seller profile (avg, count, distribution). |
| REV-3 | 🟠 P1 | **Display on AdDetails** — seller's rating badge + link to their reviews. |
| REV-4 | 🟠 P1 | **Anti-abuse**: 1 review per reviewer→reviewee per ad; can't review yourself. |
| REV-5 | 🟡 P2 | **Seller reply** to a review (one reply per review). |

---

## 13. Packages / Premium Plans 🆕 (model exists, no CRUD/endpoint/UI)

Same status — model only. If you're not monetizing yet, mark as **out of scope** to avoid dead code.

| PKG-1 | ⚪ P3 | List packages (public), create/update (admin), purchase flow (user). |
| PKG-2 | ⚪ P3 | "Boost ad" UI — pick a package, payment integration (separate effort). |
| PKG-3 | ⚪ P3 | Apply package effects (badge, top-of-search, longer expiry). |

**Recommendation:** if there's no monetization roadmap in the next quarter, delete the model rather than letting it rot.

---

## 14. Contact / Inquiries

| CON-1 | 🟠 P1 | **Admin reply via email** — reply directly from `AdminInquiries.jsx` instead of opening their mail client. |
| CON-2 | 🟠 P1 | **Status workflow** — open → in-progress → resolved → closed, with timestamps. |
| CON-3 | 🟠 P1 | **Spam protection on `/contact/` POST** — honeypot field + rate-limit per IP. |
| CON-4 | 🟡 P2 | **Auto-acknowledgement email** to the submitter. |

---

## 15. Admin Module (cross-cutting)

| ADM-1 | 🔴 P0 | **Users admin page** — list/search users, view profile, ban/unban, role-change, view their ads. None of this exists today. |
| ADM-2 | 🔴 P0 | **Ads admin page** — list all ads with filters, hide/restore, mark-as-spam, force-delete with reason. |
| ADM-3 | 🟠 P1 | **Audit log** — every admin action (ban, hide, role-change) logged with admin id, target id, timestamp, before/after. |
| ADM-4 | 🟠 P1 | **Dashboard / stats** — total users, active users, ads posted/day, reports/day. Even a simple count panel is enough. |
| ADM-5 | 🟠 P1 | **Permission granularity** — currently `role_id=1` (super) and `role_id=2` (admin) get the same UI. Define which actions super-only. |
| ADM-6 | 🟡 P2 | **Export** users / ads / reports as CSV. |

---

## 16. Cross-cutting: API conventions, validation, error handling

| API-1 | 🔴 P0 | **Standardize pagination response** — every list endpoint returns `{ items, total, page, page_size, has_more }`. Today some return bare arrays. |
| API-2 | 🔴 P0 | **Error code taxonomy** — beyond just `success/msg`, return a stable `code` field (`USER_EMAIL_TAKEN`, `AD_NOT_FOUND`, …) so the frontend can branch on it without parsing strings. |
| API-3 | 🟠 P1 | **404 vs 403 vs 401 consistency** — many endpoints return 200 with `success: false` even for "not found". Use proper HTTP status codes. |
| API-4 | 🟠 P1 | **Envelope helper** (BE-017 from prior audit) — `def envelope(response, ok=200, err=400)` to remove ~30 lines of repetition per endpoint file. |
| API-5 | 🟠 P1 | **Request-id middleware** — generate or accept `X-Request-Id`, include in logs, return in response. Required for debugging in production. |
| API-6 | 🟠 P1 | **Global exception handler** — currently each endpoint has try/except. A FastAPI exception handler can centralize this. |
| API-7 | 🟡 P2 | **OpenAPI examples** in schema models — drives `/docs` quality. |
| API-8 | 🟡 P2 | **Versioned API** — `/api/v1/` is already there; ensure deprecation policy is documented. |

---

## 17. Cross-cutting: Frontend architecture & state

| FE-A1 | 🟠 P1 | **Server-state library** — switch from ad-hoc `useState + useEffect + try/catch` to **TanStack Query** (or SWR). Eliminates 80% of the loading/error boilerplate, gives free caching, retry, refetch-on-focus, mutation invalidation. |
| FE-A2 | 🟠 P1 | **Form library** — `react-hook-form` + `zod`/`yup`. Today every form re-implements validation. |
| FE-A3 | 🟠 P1 | **NotificationContext / UnreadContext** — encapsulate the unread-count fetching + WS push so multiple components don't independently fetch. |
| FE-A4 | 🟠 P1 | **Centralize API error → toast handler** — one place in `api.js` that maps backend `code` → toast message (uses API-2). |
| FE-A5 | 🟡 P2 | **Route-level data prefetch** with React Router's loaders (or TanStack Query prefetch). |
| FE-A6 | 🟡 P2 | **ESLint + eslint-plugin-react-hooks + Prettier** — would have caught the previous `window.location.pathname`-as-dep bug automatically. |
| FE-A7 | 🟡 P2 | **TypeScript migration** — strict mode catches a class of bugs (avatar URL type, response shape). Big effort. |
| FE-A8 | 🟡 P2 | **`useDocumentTitle` per route** — page titles currently just show "Vite + React". Bad for SEO/UX. |
| FE-A9 | 🟡 P2 | **Open-Graph / Twitter meta** on AdDetails (server-rendered for shares). Requires SSR or a small prerender step. |

---

## 18. Cross-cutting: UI/UX states

| UX-1 | 🟠 P1 | **Skeleton loaders everywhere** — primitive exists (`SkeletonAdCard`, `SkeletonList`); wire it into SearchResults, MyAds, Favorites, Chat list, Notifications. |
| UX-2 | 🟠 P1 | **Empty states everywhere** — primitive exists (`EmptyState`); wire into Favorites, MyAds, Notifications, Chat (no rooms), Search (no results), SearchAlerts. |
| UX-3 | 🟠 P1 | **Error states + retry button** — when a fetch fails, currently shows a static error message. Use `<EmptyState icon={AlertCircle} title="Couldn't load" action={<Button onClick={retry}>Try again</Button>}/>`. |
| UX-4 | 🟠 P1 | **Inline form errors** under each field, not a single top-level toast. The `Input` primitive supports `error`/`hint` — adopt it. |
| UX-5 | 🟠 P1 | **Optimistic updates** on favorites toggle, mark-as-read, delete-from-list. |
| UX-6 | 🟠 P1 | **Confirm before navigating away** if a form has unsaved changes (PostAd, Profile). `useBeforeUnload` + react-router blocker. |
| UX-7 | 🟡 P2 | **Image dropzone** on PostAd / avatar — drag-and-drop, with file validation. |
| UX-8 | 🟡 P2 | **Mobile bottom-nav** for the most common actions (Home / Search / Post / Chat / Profile). |
| UX-9 | 🟡 P2 | **Color contrast audit** — some `text-gray-400` on `bg-white` may fail WCAG AA. |
| UX-10 | 🟡 P2 | **Reduced-motion** support — already partially via CSS media query in `index.css`; verify all animated components respect it. |

---

## 19. Cross-cutting: Performance

| PRF-1 | 🟠 P1 | **N+1 query audits** — ads list, chat rooms list, notifications. Some already use `joinedload`; verify others. |
| PRF-2 | 🟠 P1 | **DB indexes** — `ads(category_id, status, created_at)`, `ads(city_id, status)`, `messages(room_id, created_at)`, `favorites(user_id, ad_id)`, `notifications(user_id, is_read, created_at)`. Confirm via `EXPLAIN`. |
| PRF-3 | 🟠 P1 | **Image processing pipeline** — resize uploads to multiple variants (thumb, medium, large) on upload; serve the smallest one that fits the layout. |
| PRF-4 | 🟠 P1 | **CDN for /uploads** — large images served from app server today; offload to S3 + CloudFront/Cloudflare. |
| PRF-5 | 🟠 P1 | **Connection pool tuning** — SQLAlchemy `pool_size` / `max_overflow` aren't set; defaults are too low for production. |
| PRF-6 | 🟡 P2 | **Response caching** — categories, locations, popular searches with short TTL (Redis). |
| PRF-7 | 🟡 P2 | **Compression middleware** — `GZipMiddleware` on FastAPI for JSON > 1 KB. |
| PRF-8 | 🟡 P2 | **Bundle further optimization** — tree-shake `lucide-react`, code-split big admin pages, prefetch the next likely route. |

---

## 20. Cross-cutting: Logging, monitoring, security

| OPS-1 | 🔴 P0 | **Structured logs** (JSON) with request_id, user_id, route, latency. Today it's plain `_logger.info`. |
| OPS-2 | 🔴 P0 | **Error tracking** — Sentry (or similar) on both backend (Python SDK) and frontend (React SDK). Currently unhandled errors vanish into the void. |
| OPS-3 | 🟠 P1 | **Health endpoints** — `/health` exists; add `/ready` (DB reachable, SMTP reachable) for orchestrator probes. |
| OPS-4 | 🟠 P1 | **Metrics** — Prometheus `/metrics` endpoint or app insights: request count, latency percentiles, DB pool usage, login failures. |
| OPS-5 | 🟠 P1 | **Audit log for admin actions** (also referenced as ADM-3). |
| OPS-6 | 🟠 P1 | **Backup strategy** for Postgres and uploads/. Documented + automated. |
| OPS-7 | 🟠 P1 | **Secrets management** — `.env` is fine for local; for production document use of a secret store (AWS SM / Vault). |
| OPS-8 | 🟠 P1 | **HSTS / CSP / X-Frame-Options** security headers via middleware. |
| OPS-9 | 🟠 P1 | **HTTPS redirect** in production (TrustedHostMiddleware + HTTPSRedirectMiddleware). |
| OPS-10 | 🟡 P2 | **Dependency scanning** — `pip-audit` + `npm audit` in CI. |
| OPS-11 | 🟡 P2 | **Container hardening** — production Dockerfile with non-root user, distroless or alpine, multi-stage build. |

---

## 21. Reusable components / code structure

| RC-1 | 🟠 P1 | **`PageHeader` primitive** (already drafted, not in use) — title + breadcrumbs + actions. Adopt across all admin and content pages. |
| RC-2 | 🟠 P1 | **`DataTable` primitive** — used everywhere in admin (categories, locations, reports, inquiries). Today each page hand-rolls its own table with hover/sort/pagination. |
| RC-3 | 🟠 P1 | **`FilterBar` primitive** — chip-style filter set used on SearchResults + admin. |
| RC-4 | 🟠 P1 | **`AdCard` primitive** — currently inlined in HomePage, SearchResults, Favorites, MyAds with slight variations. Consolidate. |
| RC-5 | 🟠 P1 | **`Pagination` primitive** — paired with `DataTable`. |
| RC-6 | 🟡 P2 | **`PriceInput`** — formatted INR input with parsing. |
| RC-7 | 🟡 P2 | **`Avatar`** primitive (already drafted from prior turn) — replace inline `<div class="rounded-full ...">{initial}</div>` everywhere. |
| RC-8 | 🟡 P2 | **`useDebouncedValue`**, **`useLocalStorage`**, **`useMediaQuery`** hooks. |

---

## 22. Edge cases worth fixing

| EDG-1 | 🟠 P1 | **Logged-in user deleted on server** — frontend still holds JWT until 401 hits. Add a `/users/me/` ping on app boot. |
| EDG-2 | 🟠 P1 | **User edits profile in tab A, logs out in tab B** — currently AuthContext now syncs (good); ensure all forms revalidate auth before submit. |
| EDG-3 | 🟠 P1 | **Concurrent ad edits** — two tabs editing the same ad. Add an `updated_at` optimistic-lock check on PUT. |
| EDG-4 | 🟠 P1 | **Image upload fails midway** — cleanup partial files, return clear error. |
| EDG-5 | 🟠 P1 | **DST / timezone** — backend uses UTC (now fixed); frontend should always render in the user's local timezone with `date-fns`. Verify. |
| EDG-6 | 🟡 P2 | **Soft-deleted seller's ads still showing** — verify all ad queries filter on `seller.is_delete = false`. |
| EDG-7 | 🟡 P2 | **Currency / locale** — INR-only today; if going international, abstract. |
| EDG-8 | 🟡 P2 | **Email bounce handling** — webhook from SMTP provider to mark addresses invalid; currently silent failures. |

---

## 23. Testing & QA

| TST-1 | 🔴 P0 | **No test suite exists**. At minimum smoke tests for: auth (signup → verify → login → me), ad lifecycle (post → edit → delete), favorites toggle, report flow, chat WS handshake. |
| TST-2 | 🟠 P1 | **Backend: pytest + httpx + test DB** — fixture for an authenticated client. |
| TST-3 | 🟠 P1 | **Frontend: vitest + @testing-library/react** for primitives (Button, Modal, ToastProvider, AuthContext) and one happy-path per page. |
| TST-4 | 🟠 P1 | **E2E** — Playwright smoke against `npm run dev` + a seeded backend. |
| TST-5 | 🟡 P2 | **Visual regression** — Storybook + Chromatic on primitives. |

---

## 24. CI / CD

| CI-1 | 🟠 P1 | **GitHub Actions** — backend: lint (`ruff`), type-check (`mypy`), test. Frontend: lint, build, test. |
| CI-2 | 🟠 P1 | **Pre-commit hooks** — `ruff format`, `prettier`, `eslint --max-warnings 0`. |
| CI-3 | 🟠 P1 | **Migration check** — CI runs `alembic upgrade head` on a fresh DB to catch broken migrations. |
| CI-4 | 🟡 P2 | **Containerized deploy** — Dockerfiles + compose. |

---

# Suggested execution order

Pick the priority you want to clear and I'll start there. My recommended path:

### Wave 1 — **P0 only** (security + data correctness, ~2–3 implementation sessions)
- USR-V1 (phone validation), USR-A1 (refresh-token rotation)
- AD-1 audit, AD-S1 pagination, AD-V1, AD-V2, AD-V4
- CHT-B1 (WS re-auth), CHT-B2 (block/report)
- RPT-1 (admin actions on reports)
- ADM-1 (users admin), ADM-2 (ads admin)
- API-1 (pagination envelope), API-2 (error codes)
- OPS-1 (structured logs), OPS-2 (Sentry)
- TST-1 (smoke tests)
- EDG-1 → EDG-5

### Wave 2 — **P1 high-impact** (1–2 weeks)
- All P1 items in Ads, Chat, Notifications, Admin, API, UX
- FE-A1 (TanStack Query) + FE-A2 (react-hook-form)
- RC-1 → RC-5 (reusable primitives)

### Wave 3 — **Reviews module** (REV-1..5) once Wave 1 is shipped

### Wave 4 — **Polish** (P2): performance, design tokens cleanup, mobile nav, dark mode, SEO meta

### Out of scope (recommend deferring or deleting)
- **Packages module** (PKG-1..3) — no monetization roadmap → either delete the model or freeze
- **2FA, social login** (USR-8/9) — large effort
- **Geographic radius search** (AD-S5, LOC-3) — needs lat/lng data

---

## How to approve

Reply with:
- `Approve Wave 1` to start P0 items now
- `Approve all P0 + listed P1 items` (specify which)
- `Approve specific IDs: USR-1, AD-S1, ...` for a custom set
- `Drop these: PKG-*, USR-8, ...` to remove items from scope

I'll wait for your approval before any code changes.
