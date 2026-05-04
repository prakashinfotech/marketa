# QuikrClone — UI Component Specifications

> Every React component, its route, purpose, and key behavior.

---

## Layout Components

### Navbar (`Navbar.jsx`)
- **Logged out:** Logo, Search bar, Login/Signup buttons
- **Logged in:** Logo, Search bar, Post Ad button, Chat icon (unread badge), Bell icon (notification badge), User avatar dropdown
- **User dropdown:** Profile, My Ads, Favorites, Chat, Inquiries, Alerts, Notifications, Admin Panel (if admin), Logout
- **Admin badge:** Shows "Admin Panel" link if `user.role_id === 1 || 2`

### Footer (`Footer.jsx`)
- Links: About, Contact, Services, Terms, Privacy
- Copyright text with QuikrClone branding
- Consistent across all public pages

### AdminLayout (`AdminLayout.jsx`)
- Dark sidebar with navigation links (indigo highlight on active)
- Pages: Inquiries, Locations, Categories, Reports, FAQs, Knowledge Base
- Breadcrumb navigation
- Outlet renders child admin pages
- Admin-only guard (redirects non-admins)

### ChatBot (`ChatBot.jsx`)
- Floating button (bottom-right, all public pages)
- Click → opens chat widget with welcome message
- FAQ suggestion chips at top
- User types → bot responds (see chatbot module spec)
- Markdown rendering for responses
- Typing indicator animation

### ScrollToTop (`ScrollToTop.js`)
- React Router listener → scrolls to top on route change

---

## Auth Pages

### Login (`Login.jsx`)
- Route: `/login`
- Fields: email, password
- Link to /forgot-password
- Link to /signup
- On success: `login(accessToken, refreshToken, userData)` → redirect to `/`

### Signup (`Signup.jsx`)
- Route: `/signup`
- Fields: name, username, email, password
- Validation: all required, password ≥ 6 chars
- On success: redirect to `/login` (NO auto-login, NO auto-verify)
- Link to /login

### ForgotPassword (`ForgotPassword.jsx`)
- Route: `/forgot-password`
- Field: email
- On submit: always shows success message (prevents email enumeration)

### ResetPassword (`ResetPassword.jsx`)
- Route: `/reset-password?token=xxx`
- Fields: new password, confirm password
- Validation: passwords match, ≥ 6 chars
- Error states: invalid token, expired token, already used

### VerifyEmail (`VerifyEmail.jsx`)
- Route: `/verify?token=xxx`
- Auto-submits token on mount
- Shows success/error states

---

## Core Pages

### HomePage (`HomePage.jsx`)
- Route: `/`
- Sections:
  1. Hero with search bar
  2. Category grid (emoji icons, click → search filtered by category)
  3. "Fresh Recommendations" — latest active ads in card grid
  4. "Recently Viewed" — horizontally scrollable (logged-in only, server-synced)
  5. "How It Works" — 3-step guide
  6. Testimonials slider
- Heart icon on ad cards (toggle favorite)

### SearchResults (`SearchResults.jsx`)
- Route: `/search?q=xxx&category=xxx&...`
- Left sidebar: Sort, Category, Price Range, Condition, Listing Type, Attribute filters
- Active filter chips (dismissible)
- Grid of ad cards with pagination
- Custom scrollbar on sidebar
- Attribute spec tags on cards (e.g., "Petrol", "2022")

### AdDetails (`AdDetails.jsx`)
- Route: `/ad/:id`
- Sections:
  1. Image carousel with left/right arrows + counter
  2. Title, price (with "Negotiable" badge), condition
  3. Attribute specs (category-specific)
  4. Description
  5. Seller info panel (avatar, name, member since)
  6. Actions: "Chat with Seller" (hidden if owner), "Show Phone" (login required), Share, Report
  7. Similar Ads section (up to 6)
  8. Safety Tips
- View count increment (session-based, no refresh inflation)
- Report modal with reason dropdown + description
- Share dropdown: Copy Link, WhatsApp, X, Facebook

### PostAd (`PostAd.jsx`)
- Route: `/post-ad` (create) or `/edit-ad/:id` (edit)
- Login required (redirect if not)
- Edit mode: ownership check (redirect if not owner)
- Fields:
  1. Title (required)
  2. Category dropdown (required, triggers dynamic attributes)
  3. State → City dropdowns (required)
  4. Locality (optional)
  5. Description (required)
  6. Price (required, must be > 0)
  7. Negotiable checkbox
  8. Condition (New/Used/Like New)
  9. Listing Type (Sell/Rent)
  10. Category-specific attribute fields (dynamic)
  11. Image upload (1-5, max 5MB each, preview with remove)
- Validation: all required fields, price > 0, at least 1 image

### MyAds (`MyAds.jsx`)
- Route: `/my-ads`
- Login required
- Status tabs: All, Active, Sold, Inactive
- Per-ad actions: Edit, Mark as Sold, Deactivate/Reactivate, Delete
- Inquiry count badge per ad
- Custom confirmation modals (no browser alerts)

### Profile (`Profile.jsx`)
- Route: `/profile`
- Login required
- Sections:
  1. Avatar (upload or cartoon selection)
  2. Profile info (name, username, email, phone)
  3. Email verification status + "Verify" button
  4. Change Password (expandable section)
  5. Delete Account (with email code confirmation)
- All confirmations use custom modals

---

## Communication Pages

### Chat (`Chat.jsx`)
- Route: `/chat?room=xxx`
- Login required
- Left: room list with last message + timestamp
- Right: active conversation with message bubbles
- WebSocket real-time messaging
- Send on Enter key
- Empty message prevented
- Custom delete confirmation modal

### SellerInquiries (`SellerInquiries.jsx`)
- Route: `/inquiries`
- Login required
- Groups chats by ad
- Shows inquiry count per ad
- Click ad → expand to see all conversations
- "Mark as Sold" action

### Favorites (`Favorites.jsx`)
- Route: `/favorites`
- Login required
- Grid of favorited ads
- Remove by clicking heart
- Empty state: "No favorites yet"

### Notifications (`Notifications.jsx`)
- Route: `/notifications`
- Login required
- List of all notifications with timestamps
- Unread/read visual distinction
- Click to navigate (uses `link` field)

### SearchAlerts (`SearchAlerts.jsx`)
- Route: `/alerts`
- Login required
- Create form: keyword, category, city, min/max price
- List with toggle active/inactive + delete
- Custom confirmation modals

---

## Admin Pages

### AdminInquiries (`AdminInquiries.jsx`)
- Contact form submissions
- Status management

### AdminLocations (`AdminLocations.jsx`)
- State + City CRUD
- Hierarchical display

### AdminCategories (`AdminCategories.jsx`)
- Category tree view
- Tab: Add Category / Add Attribute
- Attribute types: text, number, select, boolean

### AdminReports (`AdminReports.jsx`)
- Reported ads list
- Resolve/dismiss actions

### AdminFAQs (`AdminFAQs.jsx`)
- CRUD for chatbot FAQs
- Question, keywords, answer fields
- Toggle active/inactive
- Custom delete confirmation modals

### AdminKnowledgeBase (`AdminKnowledgeBase.jsx`)
- Drag-and-drop document upload
- File type validation (.md, .txt, .pdf), 5MB limit
- Document list with delete
- "How it works" explanation section
- Custom delete confirmation modals

---

## Static Pages

### About (`About.jsx`) — `/about`
### Contact (`Contact.jsx`) — `/contact` (with form submission)
### ServicesPage (`ServicesPage.jsx`) — `/services`
### TermsOfUse (`TermsOfUse.jsx`) — `/terms`
### PrivacyPolicy (`PrivacyPolicy.jsx`) — `/privacy`
