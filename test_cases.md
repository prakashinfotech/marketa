# QuikrClone — Test Cases (Positive & Negative)

> Comprehensive test plan covering all features.
> ✅ = Positive (expected to work) · ❌ = Negative (expected to fail gracefully)

---

## 1. Authentication — Sign Up

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 1.1 | ✅ | Sign up with valid name, email, and password | Account created, redirected to home, logged in |
| 1.2 | ✅ | Sign up and check JWT token is stored in localStorage | Token present, user stays logged in on refresh |
| 1.3 | ❌ | Sign up with an already registered email | Error message: "Email already exists" |
| 1.4 | ❌ | Sign up with empty name field | Validation error, form not submitted |
| 1.5 | ❌ | Sign up with invalid email format (e.g., "abc@") | Validation error shown |
| 1.6 | ❌ | Sign up with password less than minimum length | Validation error shown |
| 1.7 | ❌ | Sign up with empty fields (all blank) | Validation errors on all fields |

---

## 2. Authentication — Login

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 2.1 | ✅ | Login with valid email and password | Logged in, redirected to home, navbar shows user name |
| 2.2 | ✅ | Login as admin (role_id 1 or 2) and navigate to /admin | Admin panel loads correctly |
| 2.3 | ❌ | Login with wrong password | Error: "Invalid credentials" |
| 2.4 | ❌ | Login with non-existent email | Error: "Invalid credentials" |
| 2.5 | ❌ | Login with empty email or password | Validation error, form not submitted |
| 2.6 | ✅ | Logout and verify session is cleared | JWT removed, navbar shows Login/Signup buttons |
| 2.7 | ❌ | Access /profile without logging in | Redirect to login or "Please login" message |

---

## 3. Email Verification

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 3.1 | ✅ | Click verification link with valid token | Account verified, success message shown |
| 3.2 | ❌ | Visit /verify with invalid/expired token | Error: "Invalid or expired token" |
| 3.3 | ❌ | Visit /verify with no token parameter | Error message shown |

---

## 4. User Profile

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 4.1 | ✅ | Update name and phone number | Profile updated successfully |
| 4.2 | ✅ | Upload a profile avatar image | Avatar saved and displayed |
| 4.3 | ✅ | Select a cartoon avatar | Cartoon avatar set and displayed |
| 4.4 | ❌ | Update email to an already taken email | Error: "Email already in use" |
| 4.5 | ❌ | Upload a non-image file as avatar | Error or file rejected |
| 4.6 | ✅ | View profile page when logged in | All user data displayed correctly |

---

## 5. Post Ad

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 5.1 | ✅ | Post ad with all required fields (title, category, city, description, price, images) | Ad created, redirect to My Ads or Ad Details |
| 5.2 | ✅ | Post ad with negotiable price checkbox enabled | Ad shows "Negotiable" badge |
| 5.3 | ✅ | Post ad with category-specific attributes (e.g., Fuel Type for Cars) | Attributes saved and displayed on ad card |
| 5.4 | ✅ | Upload 5 images to an ad | All images uploaded, first one is primary |
| 5.5 | ❌ | Post ad without title | Validation error: "Title is required" |
| 5.6 | ❌ | Post ad without selecting a category | Validation error shown |
| 5.7 | ❌ | Post ad without selecting a city | Validation error shown |
| 5.8 | ❌ | Post ad without logging in | Redirect to login or unauthorized error |
| 5.9 | ❌ | Post ad with price = 0 or negative | Validation error or handled gracefully |
| 5.10 | ✅ | Post ad with "Rent" listing type | Ad type saved as "rent" |
| 5.11 | ✅ | Select category and verify dynamic attribute fields appear | Fields render based on CategoryAttribute |

---

## 6. My Ads (Seller Dashboard)

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 6.1 | ✅ | View list of own posted ads | All user's ads shown with status tabs |
| 6.2 | ✅ | Filter ads by status (Active, Sold, Inactive) | Only matching ads displayed |
| 6.3 | ✅ | Edit an existing ad (change title, price, images) | Ad updated successfully |
| 6.4 | ✅ | Mark an ad as "Sold" | Status changes to Sold, ad removed from active listings |
| 6.5 | ✅ | Deactivate an ad | Status changes to Inactive |
| 6.6 | ✅ | Re-activate a deactivated ad | Status returns to Active |
| 6.7 | ❌ | Access My Ads without logging in | Redirect to login |
| 6.8 | ✅ | See inquiry count per ad | Chat count badge shown per ad card |

---

## 7. Search & Filters

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 7.1 | ✅ | Search by keyword (e.g., "iPhone") | Matching ads displayed |
| 7.2 | ✅ | Filter by category (e.g., "Mobiles") | Only Mobiles ads shown |
| 7.3 | ✅ | Filter by price range (e.g., ₹5K–₹25K) | Only ads in range shown |
| 7.4 | ✅ | Filter by condition (e.g., "Brand New") | Only new condition ads shown |
| 7.5 | ✅ | Apply category-specific filters (e.g., Fuel Type = "Petrol") | Only matching attribute ads shown |
| 7.6 | ✅ | Sort by "Price: Low to High" | Ads sorted by ascending price |
| 7.7 | ✅ | Sort by "Newest First" | Most recent ads shown first |
| 7.8 | ✅ | Clear all filters | All ads shown, filter chips removed |
| 7.9 | ✅ | Dismiss a single active filter chip | That filter removed, results updated |
| 7.10 | ❌ | Search with empty query | All ads shown or "Enter a search term" |
| 7.11 | ✅ | Search results show attribute spec tags on cards | Tags like "Petrol", "2022", "4GB" visible |
| 7.12 | ✅ | Custom scrollbar works on sidebar filter panel | Smooth scrolling with styled scrollbar |

---

## 8. Ad Details Page

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 8.1 | ✅ | View ad with multiple images, navigate carousel | Images cycle with left/right arrows |
| 8.2 | ✅ | View count increments on first visit | View counter increases by 1 |
| 8.3 | ❌ | View count does NOT increment on page refresh | Counter stays same (single-count logic) |
| 8.4 | ✅ | Click "Show Phone Number" (when logged in) | Phone number revealed |
| 8.5 | ❌ | Click "Show Phone Number" when not logged in | Prompt to login |
| 8.6 | ✅ | Click "Chat with Seller" | Chat room created, redirect to /chat |
| 8.7 | ❌ | Click "Chat with Seller" on own ad | Button hidden or error message |
| 8.8 | ✅ | Click "Report this ad" → submit report | Report submitted, confirmation shown |
| 8.9 | ✅ | Attribute specs displayed (e.g., "Diesel", "Manual") | Category attributes shown |
| 8.10 | ✅ | Ad stored in "Recently Viewed" localStorage | Ad ID added to localStorage array |

---

## 9. Share Ad

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 9.1 | ✅ | Click Share → "Copy Link" | URL copied to clipboard, "Link Copied!" toast shown |
| 9.2 | ✅ | Click Share → WhatsApp | WhatsApp share opens in new tab with ad title + URL |
| 9.3 | ✅ | Click Share → X (Twitter) | Twitter intent opens with ad text + URL |
| 9.4 | ✅ | Click Share → Facebook | Facebook sharer opens with ad URL |
| 9.5 | ✅ | Click outside the share dropdown | Dropdown closes |

---

## 10. Similar Ads

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 10.1 | ✅ | View ad detail → "Similar Ads" section appears | Up to 6 ads from same category shown |
| 10.2 | ✅ | Similar ads have similar price range (±50%) | Prices are within expected range |
| 10.3 | ✅ | Current ad is NOT shown in similar ads | Current ad excluded from list |
| 10.4 | ✅ | Click a similar ad → navigates to that ad's detail | New ad page loads correctly |
| 10.5 | ❌ | Ad has no similar ads (only ad in category) | "Similar Ads" section hidden |

---

## 11. Recently Viewed

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 11.1 | ✅ | View 3 ads → go to homepage | "Recently Viewed" section shows those 3 ads |
| 11.2 | ✅ | View same ad twice | Only 1 entry in recently viewed (no duplicates) |
| 11.3 | ✅ | View 25 ads | Only latest 20 stored in localStorage |
| 11.4 | ✅ | Click "Clear History" | Recently viewed section disappears, localStorage cleared |
| 11.5 | ❌ | No ads viewed yet | "Recently Viewed" section hidden on homepage |

---

## 12. Favorites / Wishlist

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 12.1 | ✅ | Click heart icon on an ad (logged in) | Heart turns red, ad saved to favorites |
| 12.2 | ✅ | Click heart again to unfavorite | Heart goes back to gray, ad removed from favorites |
| 12.3 | ✅ | Navigate to /favorites | All favorited ads displayed |
| 12.4 | ❌ | Click heart when not logged in | Alert: "Please login to save favorites" |
| 12.5 | ✅ | Favorite from homepage, check in search results | Heart is red on both pages (synced) |

---

## 13. Real-Time Chat

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 13.1 | ✅ | Buyer clicks "Chat with Seller" → sends a message | Message appears in chat for both users |
| 13.2 | ✅ | Seller receives message in real-time via WebSocket | Message appears without page refresh |
| 13.3 | ✅ | View all chat rooms on /chat page | Chat list shows all conversations |
| 13.4 | ✅ | Unread message count badge appears in navbar | Badge shows correct count |
| 13.5 | ❌ | Send empty message | Message not sent, button disabled |
| 13.6 | ❌ | Access /chat when not logged in | Redirect to login |
| 13.7 | ✅ | Chat with seller on Ad A, then Ad B | Two separate chat rooms created |

---

## 14. Seller Inquiries

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 14.1 | ✅ | Seller views /inquiries | All ads with active chats listed |
| 14.2 | ✅ | Click an ad → see all chats for that ad | Chats grouped by ad, buyer names shown |
| 14.3 | ✅ | Mark ad as "Sold" from inquiries page | Ad status updated, confirmation shown |
| 14.4 | ❌ | Non-seller (user with no ads) views /inquiries | Empty state: "No inquiries yet" |

---

## 15. AI Chatbot (QuikrBot)

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 15.1 | ✅ | Click chatbot icon → widget opens | Chat widget opens with welcome message |
| 15.2 | ✅ | Ask "How to post an ad?" | Static FAQ answer returned instantly (no API delay) |
| 15.3 | ✅ | Ask a DB FAQ question (admin-added) | Database FAQ answer returned |
| 15.4 | ✅ | Ask "what is python" (FAQ with keywords "python aiml") | FAQ answer returned (keyword match) |
| 15.5 | ✅ | Say "Hello" or "Hi" | Friendly chitchat response from LLM |
| 15.6 | ✅ | Ask "How do I search?" | Detailed platform FAQ answer |
| 15.7 | ✅ | Ask an off-topic question (e.g., "What is calculus?") | Politely refused: "I can only help with QuikrClone" |
| 15.8 | ✅ | Click a FAQ suggestion chip | That question is sent and answered |
| 15.9 | ❌ | Send empty message | Not sent, validation prevents it |
| 15.10 | ✅ | Ask question related to uploaded knowledge doc | RAG retrieves relevant chunks, grounded answer |
| 15.11 | ❌ | Backend Groq API is down | Fallback response: "I'm having trouble right now" |

---

## 16. Notifications

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 16.1 | ✅ | Receive notification for new chat message | Notification appears in bell dropdown |
| 16.2 | ✅ | Click bell icon → see all notifications | Notifications listed with timestamps |
| 16.3 | ✅ | Unread count badge on bell icon | Badge shows correct unread count |
| 16.4 | ✅ | Navigate to /notifications page | Full notification history shown |
| 16.5 | ❌ | Access notifications when not logged in | Redirect or empty state |

---

## 17. Search Alerts

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 17.1 | ✅ | Create alert with keyword + category + price range | Alert saved, shown in alerts list |
| 17.2 | ✅ | Post a new ad matching an alert | Alert owner notified |
| 17.3 | ✅ | Toggle alert active/inactive | Alert status updated |
| 17.4 | ✅ | Delete an alert | Alert removed from list |
| 17.5 | ❌ | Create alert with all empty fields | Validation error |
| 17.6 | ❌ | Access /alerts when not logged in | Redirect to login |

---

## 18. Contact Form

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 18.1 | ✅ | Submit contact form with name, email, subject, message | Inquiry submitted, success toast |
| 18.2 | ❌ | Submit with empty required fields | Validation errors shown |
| 18.3 | ❌ | Submit with invalid email format | Validation error |
| 18.4 | ✅ | Admin views inquiry in Admin Panel → Inquiries | Submitted form visible in admin list |

---

## 19. Admin — Locations

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 19.1 | ✅ | Add a new State | State created, appears in list |
| 19.2 | ✅ | Add a City under a State | City created with correct state_id |
| 19.3 | ✅ | Add a Locality under a City | Locality created |
| 19.4 | ✅ | Edit a city name | Name updated |
| 19.5 | ✅ | Delete a locality | Locality removed |
| 19.6 | ❌ | Add State with empty name | Validation error |
| 19.7 | ❌ | Delete a State that has cities under it | Error or cascade handled |

---

## 20. Admin — Categories & Attributes

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 20.1 | ✅ | View all categories | Categories listed with counts |
| 20.2 | ✅ | Add a new attribute to a category (e.g., "Color" to Mobiles) | Attribute created with field type |
| 20.3 | ✅ | Edit attribute display order | Order updated, reflected in search filters |
| 20.4 | ✅ | Delete an attribute | Attribute removed |
| 20.5 | ❌ | Add attribute with empty name | Validation error |

---

## 21. Admin — Reports

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 21.1 | ✅ | View all reported ads | Reports listed with reason + reporter info |
| 21.2 | ✅ | Take action on a reported ad | Status updated (resolved/dismissed) |
| 21.3 | ❌ | Regular user tries to access /admin/reports | Redirect or 403 error |

---

## 22. Admin — FAQs

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 22.1 | ✅ | Add FAQ with question, comma-separated keywords, answer | FAQ created, appears in list |
| 22.2 | ✅ | Edit an existing FAQ | FAQ updated |
| 22.3 | ✅ | Delete a FAQ | FAQ soft-deleted, no longer shown |
| 22.4 | ✅ | Toggle FAQ active/inactive | Inactive FAQ not matched by chatbot |
| 22.5 | ❌ | Add FAQ with empty question | Validation error |
| 22.6 | ✅ | Add FAQ → ask that question in chatbot | Chatbot returns the FAQ answer |

---

## 23. Admin — Knowledge Base (RAG)

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 23.1 | ✅ | Upload a .txt document | Document chunked, indexed, success message with chunk count |
| 23.2 | ✅ | Upload a .md document | Document indexed successfully |
| 23.3 | ✅ | Upload a .pdf document | PDF text extracted (pdfminer), indexed |
| 23.4 | ✅ | View list of indexed documents | All doc IDs shown |
| 23.5 | ✅ | Delete a document | Vectors + physical file deleted |
| 23.6 | ✅ | Ask chatbot a question about uploaded doc | RAG retrieves chunks, grounded answer |
| 23.7 | ❌ | Upload unsupported file type (.jpg, .xlsx) | Error: "Unsupported file type" |
| 23.8 | ❌ | Upload an empty .txt file | Error: "Document appears to be empty" |
| 23.9 | ❌ | Regular user tries to upload | 403: "SuperAdmin access required" |
| 23.10 | ✅ | Drag and drop a file into the upload zone | File uploaded successfully |

---

## 24. Navigation & UI

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 24.1 | ✅ | Navbar shows correct items based on login state | Login/Signup when logged out; Avatar/name when logged in |
| 24.2 | ✅ | Admin user sees "Admin Panel" link in navbar dropdown | Link present, navigates to /admin |
| 24.3 | ✅ | Clicking QuikrClone logo navigates to homepage | Redirect to / |
| 24.4 | ✅ | Footer links (About, Contact, Terms, Privacy) work | All links navigate correctly |
| 24.5 | ✅ | Page scrolls to top on route change | ScrollToTop component working |
| 24.6 | ✅ | Mobile responsive — all pages render on small screens | No horizontal overflow, readable layout |
| 24.7 | ✅ | Admin sidebar highlights current active page | Active page has indigo highlight |

---

## 25. Edge Cases & Security

| # | Type | Test Case | Expected Result |
|---|------|-----------|-----------------|
| 25.1 | ❌ | Access /admin routes as regular user | No admin panel shown, redirect or 403 |
| 25.2 | ❌ | Call API with expired JWT token | 401 Unauthorized response |
| 25.3 | ❌ | Try SQL injection in search query | Query sanitized, no injection |
| 25.4 | ❌ | Upload file larger than server limit | Error handled gracefully |
| 25.5 | ❌ | Visit /ad/99999 (non-existent ad ID) | 404 page or "Ad not found" message |
| 25.6 | ❌ | Edit someone else's ad via URL (/edit-ad/5) | 403 or "Not authorized" |
| 25.7 | ❌ | Delete someone else's ad via API | 403 Forbidden |
| 25.8 | ❌ | Rapidly click "Favorite" toggle button | No duplicate entries, debounced |
| 25.9 | ✅ | Refresh page while logged in | Session persists via JWT in localStorage |
| 25.10 | ❌ | Backend is down → frontend handles errors | Error toasts shown, no blank screens |

---

**Total Test Cases: ~130**
**Positive: ~85 · Negative: ~45**
