# Marketa — Design System

> Visual design language, CSS classes, color palette, typography, and animation patterns.

---

## Font

- **Family:** Inter (Google Fonts)
- **Import:** `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`
- **Fallback:** `system-ui, -apple-system, sans-serif`
- **Rendering:** `antialiased`

---

## Color Palette

### Brand Colors (Indigo-based)
| Name | Tailwind | Hex | Usage |
|------|---------|-----|-------|
| Primary | `indigo-600` | #4f46e5 | Buttons, links, active states |
| Primary Hover | `indigo-700` | #4338ca | Button hover |
| Primary Light | `indigo-50` | #eef2ff | Backgrounds, badges |
| Primary Accent | `indigo-500` | #6366f1 | Icons, borders |

### Semantic Colors
| Name | Tailwind | Hex | Usage |
|------|---------|-----|-------|
| Success | `emerald-500` | #10b981 | Success toasts, badges |
| Success Light | `emerald-50` | #ecfdf5 | Toast background |
| Error | `red-500` | #ef4444 | Error toasts, delete buttons |
| Error Dark | `red-700` | #b91c1c | Error text |
| Warning | `amber-500` | #f59e0b | Warning badges |

### Neutral Colors
| Name | Tailwind | Hex | Usage |
|------|---------|-----|-------|
| Background | `gray-50` | #f8fafc | Page background |
| Card | `white` | #ffffff | Card backgrounds |
| Card Border | `gray-100` | #f1f5f9 | Card borders |
| Input Border | `gray-200` | #e2e8f0 | Form input borders |
| Text Primary | `gray-900` | #111827 | Headings, bold text |
| Text Secondary | `gray-500` | #6b7280 | Descriptions, labels |
| Text Muted | `gray-400` | #9ca3af | Placeholders, captions |

---

## CSS Component Classes (defined in `index.css` `@layer components`)

### `.card`
```css
background: #fff;
border: 1px solid #f1f5f9;
border-radius: 1rem;
box-shadow: 0 1px 3px rgba(0,0,0,0.04);
/* Hover: elevated shadow + border darken */
```

### `.glass-card`
```css
background: rgba(255,255,255,0.75);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255,255,255,0.4);
```

### `.btn-primary`
```css
background: linear-gradient(135deg, #4f46e5, #6366f1);
color: #fff;
font-weight: 600;
padding: 0.625rem 1.25rem;
border-radius: 0.625rem;
box-shadow: 0 1px 3px rgba(79,70,229,0.3);
/* Hover: darker gradient + lift (-1px translateY) */
```

### `.input-field`
```css
width: 100%;
padding: 0.625rem 0.875rem;
border: 1.5px solid #e2e8f0;
border-radius: 0.625rem;
background: #f8fafc;
/* Focus: white bg + indigo border + ring */
```

### `.label`
```css
font-size: 0.8125rem;
font-weight: 600;
color: #475569;
margin-bottom: 0.375rem;
```

### `.badge`
```css
display: inline-flex;
align-items: center;
padding: 0.25rem 0.625rem;
border-radius: 99px;
font-size: 0.75rem;
font-weight: 600;
```

### `.toast-success`
```css
background: linear-gradient(135deg, #ecfdf5, #d1fae5);
border: 1px solid #a7f3d0;
color: #065f46;
border-radius: 0.75rem;
/* slideIn animation */
```

### `.toast-error`
```css
background: linear-gradient(135deg, #fef2f2, #fecaca);
border: 1px solid #fca5a5;
color: #991b1b;
border-radius: 0.75rem;
/* slideIn animation */
```

---

## Animations

### Keyframes (defined in `index.css`)
```css
@keyframes slideIn { from { opacity:0; translateY(-8px); } to { opacity:1; translateY(0); } }
@keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; scale(0.95); } to { opacity:1; scale(1); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes scrollX  { 0% { translateX(0); } 100% { translateX(-50%); } }
```

### Utility Classes
| Class | Animation | Duration |
|-------|-----------|----------|
| `.animate-fade-in` | fadeIn | 0.4s |
| `.animate-scale-in` | scaleIn | 0.3s |
| `.animate-slide-in` | slideIn | 0.3s |
| `.animate-scroll-x` | scrollX (infinite) | 40s |

---

## Scrollbar Styles

### Default (global)
- Width: 6px
- Track: transparent
- Thumb: `#cbd5e1`, hover → `#94a3b8`
- Border-radius: 99px

### Premium Sidebar (`.custom-scrollbar`)
- Width: 5px
- Track: indigo gradient (transparent → `#eef2ff` → transparent)
- Thumb: indigo gradient (`#a5b4fc` → `#818cf8`)
- Hover: darker gradient

---

## Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Focus Ring
```css
input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  border-color: #6366f1;
}
```

---

## Responsive Breakpoints (Tailwind defaults)

| Breakpoint | Min Width | Usage |
|-----------|-----------|-------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

**Rule:** All pages must be mobile-first responsive. No horizontal overflow on any screen.

---

## Design Principles

1. **Premium feel:** Glassmorphism, gradients, subtle shadows, micro-animations
2. **Consistent spacing:** Use Tailwind's spacing scale (`p-4`, `gap-3`, `mb-6`)
3. **Rounded corners:** Cards = `rounded-2xl`, Buttons/inputs = `rounded-xl`, Badges = `rounded-full`
4. **No browser defaults:** Custom modals (no `window.confirm`), custom scrollbars, custom focus rings
5. **Hover states:** Everything interactive has a visible hover transition
6. **Loading states:** Skeletons for content (preferred), spinner for actions, disabled buttons during submission

---

## React Component Library (`frontend/src/components/ui/`)

The primitives below wrap the CSS classes above. Visuals are identical — use the components in new code instead of repeating Tailwind classes.

### `<Button>`
Wraps `.btn-primary` plus secondary / ghost / danger / amber variants. Renders a built-in spinner when `loading` is true.
```jsx
<Button variant="primary" leftIcon={Plus}>Save</Button>
<Button variant="amber"   leftIcon={PlusCircle}>Post Free Ad</Button>
<Button variant="secondary" fullWidth>Cancel</Button>
```
Variants: `primary` · `secondary` · `ghost` · `danger` · `amber`
Sizes: `sm` · `md` · `lg`

### `<Card>` / `<CardHeader>`
Wraps `.card`. Standard padding presets (`none` / `sm` / `md` / `lg`) and optional `interactive` prop for hover lift.

### `<Input>`, `<Textarea>`, `<Select>`
Wrap `.input-field` + `.label`. Built-in label, hint, error message, left icon slot, right slot, `aria-invalid` / `aria-describedby` wiring.

### `<Modal>` / `<ConfirmDialog>`
Replaces all `window.confirm`/`alert`. Handles Esc, scroll lock, backdrop click, focus, ARIA.
Sizes: `sm` · `md` · `lg` · `xl` · `2xl`.

### `<Skeleton>` / `<SkeletonText>` / `<SkeletonAdCard>` / `<SkeletonList>`
Tailwind `animate-pulse` placeholders. Use for content-shaped loading states (preferred over a full-page spinner).

### `<EmptyState>`
Light indigo icon + title + description + optional action. Use whenever a list/grid is empty.

### `<Spinner>` / `<PageSpinner>`
Border-spinner (indigo). `PageSpinner` for Suspense fallbacks; `Spinner` for inline action loading.

### `<ImageWithSkeleton>`
Drop-in `<img>` replacement with: `loading="lazy"`, `decoding="async"`, skeleton placeholder during load, friendly "image unavailable" fallback on error. Use on every ad image.

---

## Toast Notifications

Global system, mounted via `<ToastProvider>` at the app root. Consume with the `useToast()` hook:

```jsx
const toast = useToast();
toast.success('Saved');
toast.error('Failed');
toast.info('Heads up');
toast.warning('Careful');
toast.show('Custom', { variant: 'success', title: 'Heads up', duration: 6000 });
```

Visual: success = emerald gradient (uses `.toast-success`), error = red gradient (`.toast-error`), info = sky, warning = amber. Mounted top-right, max 4 stacked. Auto-dismiss after `duration` ms (default 4000). Esc closes the focused toast.

---

## Accessibility Patterns

- **Skip link:** `PublicLayout` renders a visually-hidden link that becomes visible on focus.
- **Modals:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (title), Esc-to-close, scroll lock, focus moves into dialog.
- **Toasts:** wrapper has `aria-live="polite"`; error variant uses `role="alert"`.
- **Icon-only buttons:** must have `aria-label` (or visible `title` text). Lucide icons use `aria-hidden="true"`.
- **Forms:** errors set `aria-invalid` and link to a hint/error message via `aria-describedby`.
- **Focus ring:** all focusable elements have a visible 3px indigo ring.

---

## Keyboard Shortcuts (Global)

Mounted via `<GlobalShortcuts />` in `App.jsx`. Visible to the user via the `?` help dialog.

| Keys | Action |
|------|--------|
| `/` | Focus the navbar search input |
| `?` | Open the shortcuts help dialog |
| `g h` | Navigate home |
| `g a` | Navigate to post-ad |
| `g m` | Navigate to my-ads |
| `g f` | Navigate to favorites |
| `Esc` | Close active modal / blur active input |
