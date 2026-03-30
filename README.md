## Quick start (developers)

1. Clone the repo and open `public/firebase.js`.
2. In [Firebase Console](https://console.firebase.google.com/) → **Project settings** → **Your apps**, copy the Web app config into `firebase.js` (replace `YOUR_API_KEY`, `YOUR_MESSAGING_SENDER_ID`, `YOUR_APP_ID`).
3. **Authentication** → enable **Google** provider; add **Authorized domains** (your `*.web.app` / custom domain and `localhost` for local testing).
4. Deploy Firestore rules and indexes: `firebase deploy --only firestore` (requires Firebase CLI).
5. Sign in once, then in Firestore set `users/{yourUid}.role` to `"admin"` to use **Add Activity**, **seed.html**, and deletes.

---

## Current State Assessment

What's been completed:

|Area|Status|Details|
|---|---|---|
|Firebase project|Done|`cit170-activity-votes` — Firestore + Hosting initialized|
|CI/CD|Done|GitHub Actions deploy on merge to `main` + preview on PR|
|Landing page|Partial|`index.html` exists with hero, nav, intro text, embedded video|
|Basic CSS|Partial|`styles.css` with header/nav/card styles, but not responsive|
|Firestore rules|Placeholder|Wide-open temporary rules expiring April 8, 2026|
|Branch structure|Done|`main` and `back_end` branches exist|

What's missing (essentially all functional code):

- No `package.json` — zero npm dependencies, Firebase SDK not installed
- No JavaScript whatsoever — no Firebase SDK init, no auth, no Firestore interaction
- No Google OAuth — `sign_in.html` is linked in nav but the page doesn't exist
- No `activities.html` — linked in nav but doesn't exist
- No Firestore data model — no collections, no schema, no seed data
- No RSVP system — no data layer or UI
- No admin activity creation — no form, no role system
- No responsive/mobile design — CSS is fixed at 800px width
- No scraping (deferred, and Cloud Functions unavailable due to billing)

Key architectural constraint — No Cloud Functions: Since billing isn't set up, you can't use Cloud Functions. This means:

- All Firestore reads/writes are client-side via the Firebase JS SDK
- Admin roles must be stored in a Firestore `users` collection (you can't set custom auth claims without Functions)
- Security rules must check the `users/{uid}.role` field to enforce admin permissions
- The BYU-I scraper integration gets stubbed out as a module interface for future use once Functions are available
- All activities are manually entered by admin users for the proof of concept

---

## 3-Week Roadmap

---

### WEEK 1 — Foundation & Core Infrastructure

#### Backend Team

| #     | Task                                                     | Description                                                                                                                                                                                                                                      |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1.1  | Design Firestore data model                              | Define schemas for 3 collections: `activities` (name, date, time, location, cost, description, createdBy, source), `users` (uid, displayName, email, photoURL, role), `rsvps` (activityId, uid, status). Document field types and relationships. |
| B1.2  | Initialize `package.json` and install Firebase SDK       | Run `npm init`, install `firebase` package. Set up a build/bundling step if desired, or use ES module imports from CDN for simplicity.                                                                                                           |
| B1.3  | Create `firebase-config.js`                              | Initialize the Firebase app with project config (apiKey, projectId, etc.). Export `db` (Firestore) and `auth` instances for use across modules.                                                                                                  |
| B1.4  | Build auth service module (`auth.js`)                    | Implement `signInWithGoogle()`, `signOut()`, and `onAuthStateChanged()` listener using Firebase Auth with Google provider.                                                                                                                       |
| B1.5  | Build user profile service                               | On first Google sign-in, auto-create a doc in `users/{uid}` with default role `"user"`. On subsequent sign-ins, read existing profile.                                                                                                           |
| B1.6  | Design admin role system                                 | Admin status is determined by `users/{uid}.role == "admin"`. Manually set initial admin users directly in the Firebase Console. Expose a `isAdmin(uid)` helper function.                                                                         |
| B1.7  | Write Firestore security rules — `users` collection      | Authenticated users can read their own doc. Users cannot change their own `role` field. Only admins can read other user docs (for future chat features).                                                                                         |
| B1.8  | Write Firestore security rules — `activities` collection | Anyone authenticated can read. Only users where `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"` can create/update/delete.                                                                                 |
| B1.9  | Write Firestore security rules — `rsvps` collection      | Authenticated users can create/update/delete their own RSVP docs. All authenticated users can read all RSVPs (to display counts).                                                                                                                |
| B1.10 | Seed sample data                                         | Manually create 10–15 realistic sample activities in Firestore Console (or via a one-time script) representing a mix of free/paid, indoor/outdoor, various dates. Seed 2–3 test user docs (1 admin, 2 regular).                                  |

#### Frontend Team

|#|Task|Description|
|---|---|---|
|F1.1|Reorganize project structure|Create `public/js/`, `public/css/`, `public/images/` directories. Move `styles.css` into `css/`. Ensure `firebase.json` hosting config still serves correctly.|
|F1.2|Build responsive CSS foundation|Replace the fixed 800px layout with a fluid, mobile-first design system. Add CSS reset, CSS custom properties for the color palette (`#CC4716`, `#0D4157`, `#F9F9F1`), and responsive breakpoints (mobile < 768px, desktop >= 768px).|
|F1.3|Redesign `index.html` landing page|Modern mobile-first hero section, cleaner intro text (use `<p>` not `<h2>` for body copy), responsive embedded video, CTA button pointing to Activities page.|
|F1.4|Build shared navigation component|Responsive nav with hamburger menu on mobile. Include logo, links (Home, Activities, Sign In/Out). Create as reusable HTML partial or JS-injected component for consistency across pages.|
|F1.5|Build shared footer component|Consistent footer across all pages with copyright.|
|F1.6|Create `sign_in.html`|Clean sign-in page with Google sign-in button, brief explanation of why sign-in is needed, and the app logo.|
|F1.7|Create `activities.html` page shell|Page layout with header/nav/footer, placeholder area for the activity feed, and a filter bar section at the top.|
|F1.8|Design activity card component (HTML/CSS)|A reusable card showing: activity name, date/time, location (as link), cost, short description, attendee count badge, and RSVP button. Design both mobile and desktop variants.|
|F1.9|Design admin activity creation form (HTML/CSS)|Form with fields: name, date, time, location, cost ($0 = free), description, optional image URL. Styled consistently with the app. Hidden by default (admin-only).|
|F1.10|Design sign-in/sign-out UI states|When signed out: show "Sign In" link in nav. When signed in: show user photo/name and "Sign Out" button. Design both states in CSS so JS can toggle a class.|

---

### WEEK 2 — Core Feature Development & Wiring It All Together

#### Backend Team

|#|Task|Description|
|---|---|---|
|B2.1|Build activity CRUD service (`activity-service.js`)|Functions: `createActivity(data)`, `getActivities()`, `getActivityById(id)`, `updateActivity(id, data)`, `deleteActivity(id)`. All interact with the `activities` Firestore collection.|
|B2.2|Build RSVP service (`rsvp-service.js`)|Functions: `toggleRsvp(activityId, uid)`, `getRsvpStatus(activityId, uid)`, `getRsvpCount(activityId)`. Use compound doc IDs like `{activityId}_{uid}` for uniqueness.|
|B2.3|Implement real-time activity feed listener|Use Firestore `onSnapshot` on the `activities` collection so the feed updates live when a new activity is created or edited. Return an unsubscribe function for cleanup.|
|B2.4|Implement real-time RSVP count listener|Use `onSnapshot` with a query on `rsvps` filtered by `activityId` to provide live attendee counts per activity card.|
|B2.5|Build activity filtering/sorting queries|Support filtering by: upcoming (date >= today), cost (free vs. paid), and sorting by date (soonest first) or by popularity (most RSVPs). Add composite Firestore indexes as needed in `firestore.indexes.json`.|
|B2.6|Client-side input validation for activity creation|Validate required fields (name, date, time, location), sanitize text inputs, enforce character limits, validate date is in the future. Return user-friendly error messages.|
|B2.7|Stub scraper integration module (`scraper-service.js`)|Create a module with the interface `fetchScrapedActivities()` that currently returns an empty array with a console note. Document how it will connect to a Cloud Function endpoint once billing is enabled. Include the target URL (`byui.edu/student-activities/search`) and expected data mapping.|
|B2.8|Add Firestore composite indexes|Update `firestore.indexes.json` with indexes needed for filtered queries (e.g., `activities` sorted by `date` + filtered by `cost`). Deploy indexes.|
|B2.9|Implement auth-gated page protection|Create a utility that redirects unauthenticated users away from protected actions. Expose `requireAuth()` and `requireAdmin()` guard functions that check state before allowing operations.|
|B2.10|Integration testing|Test all service modules end-to-end against live Firestore: create activity as admin, RSVP as regular user, verify counts, verify non-admin cannot create, verify real-time updates propagate.|

#### Frontend Team

|#|Task|Description|
|---|---|---|
|F2.1|Wire Google sign-in button|Connect the sign-in page button to `auth.js`. On success, redirect to Activities page. Handle errors gracefully (popup blocked, network error).|
|F2.2|Implement auth state observer across all pages|On every page, listen to `onAuthStateChanged`. Update nav to show signed-in/out state. Store user info for use by other components.|
|F2.3|Render live activity feed|Connect `activities.html` to the real-time Firestore listener. Dynamically generate activity cards from data. Show loading spinner while data loads.|
|F2.4|Implement RSVP buttons on activity cards|Add going/not-going toggle button to each card. On click, call `toggleRsvp()`. Visually indicate current user's RSVP status (highlighted if going).|
|F2.5|Display live attendee counts|Show the real-time RSVP count on each activity card (e.g., "12 going"). Update in real time as others RSVP.|
|F2.6|Build admin activity creation flow|Show a "Create Activity" button only for admin users. On click, open the creation form. On submit, call `createActivity()`. Show success/error feedback. Clear form on success.|
|F2.7|Implement filter/sort UI|Add filter controls to the activity feed page: toggle for "Free only", date range picker or "This week / This month", sort dropdown (Soonest / Most Popular). Wire to backend filtering queries.|
|F2.8|Google Maps location links|Make the location field on each activity card a clickable link that opens `https://www.google.com/maps/search/?api=1&query={encoded location}` in a new tab.|
|F2.9|Build empty, loading, and error states|Design and implement: skeleton loading cards while feed loads, "No activities found" illustration when filters return nothing, error banner on network failure.|
|F2.10|Build "My RSVPs" view|Add a section or toggle on the activities page (or a separate view) that shows only activities the current user has RSVP'd "going" to, for easy reference.|

---

### WEEK 3 — Quality Assurance, Bug Fixing & UX Refinement

#### Backend Team

|#|Task|Description|
|---|---|---|
|B3.1|Security rules audit|Systematically test every Firestore rule: attempt unauthorized reads/writes, role escalation, cross-user RSVP manipulation. Use the Firebase Emulator Suite or manual testing in a staging environment.|
|B3.2|Replace temporary open rules|Remove the `allow read, write: if request.time < timestamp.date(2026, 4, 8)` catch-all and ensure only the granular per-collection rules from Week 1 are active.|
|B3.3|Test edge cases: RSVP logic|Verify: no duplicate RSVPs, rapid toggle doesn't create race conditions, RSVP count stays accurate under concurrent writes, deleting an activity cleans up orphaned RSVPs.|
|B3.4|Test auth flow end-to-end|Google sign-in, session persistence across page reloads, sign-out clears state, expired sessions handled gracefully, first-time user doc creation works.|
|B3.5|Test admin permissions end-to-end|Verify non-admin cannot create/edit/delete activities (both UI-hidden and rule-enforced). Verify admin CRUD works. Test edge case: what if admin role is revoked mid-session.|
|B3.6|Performance profiling|Verify Firestore queries return within 500ms. Check that real-time listeners don't cause memory leaks or excessive reads. Review Firestore usage dashboard for unexpected costs.|
|B3.7|Data integrity validation|Audit Firestore data: ensure all activity docs have required fields, no orphaned RSVPs, user docs are consistent. Write a checklist for ongoing data hygiene.|
|B3.8|Test CI/CD pipeline|Create a test PR, verify preview deployment works. Merge to `main`, verify live deployment succeeds. Confirm rollback process if a bad deploy goes out.|
|B3.9|Document Firestore schema & service API|Write developer documentation: collection schemas, security rule logic, service module function signatures, how to add a new admin user, how to seed data.|
|B3.10|Document future Cloud Functions integration plan|Write a technical spec for the BYU-I scraper: which Cloud Function triggers to use, how scraped data maps to the `activities` schema, how `scraper-service.js` will connect, and what billing setup is required.|

#### Frontend Team

|#|Task|Description|
|---|---|---|
|F3.1|Cross-browser testing|Test on Chrome, Firefox, Safari, and Edge — both desktop and mobile. Log and triage all visual/functional bugs.|
|F3.2|Mobile responsiveness audit|Test on screen widths: 320px, 375px, 414px, 768px, 1024px, 1440px. Fix any overflow, truncation, or layout breaking issues.|
|F3.3|Accessibility audit|Check: all images have alt text, form inputs have labels, buttons have focus states, color contrast meets WCAG AA, keyboard navigation works for all interactive elements.|
|F3.4|Fix all visual/layout bugs|Address every bug found in F3.1–F3.3. Prioritize mobile issues (target audience uses phones).|
|F3.5|Add transitions and micro-interactions|Smooth hover effects on cards and buttons, fade-in for cards loading, animated RSVP toggle (checkmark/X), subtle loading spinner animation.|
|F3.6|Optimize page load performance|Compress all images, add `loading="lazy"` to images, minimize CSS, ensure Firebase SDK is loaded efficiently (only import needed modules).|
|F3.7|UX flow walkthrough|Walk through every user journey end-to-end: land on home → sign in → browse activities → RSVP → view "my RSVPs" → (admin) create activity. Identify and fix any friction points.|
|F3.8|Polish empty and error states|Ensure friendly, on-brand messaging for: no activities found, network errors, sign-in required prompts. Add a relevant illustration or icon to each.|
|F3.9|Final UI consistency pass|Audit all pages for consistent spacing, font sizes, color usage, button styles, card padding. Ensure the design system is uniformly applied.|
|F3.10|User acceptance testing|Have 3–5 BYU-Idaho students test the live app. Collect feedback on usability, clarity, and missing features. Document findings and fix critical issues before final submission.|

---

## Summary View

|Week|Focus|Backend Theme|Frontend Theme|
|---|---|---|---|
|1|Foundation|Data model, auth service, security rules, seed data|Project structure, responsive CSS, all HTML pages, card/form design|
|2|Feature Dev|CRUD services, RSVP logic, real-time listeners, filtering, scraper stub|Wire auth, render feed, RSVP UI, admin form, filters, Maps links|
|3|QA & Polish|Security audit, harden rules, edge-case testing, docs, CI/CD verification|Cross-browser/mobile/a11y testing, perf optimization, UX polish, UAT|

Total: 60 tasks (10/week x 2 teams x 3 weeks)

The critical dependency chain is: B1.2–B1.4 (SDK + Auth) must be done early in Week 1 so Frontend can start wiring sign-in at the start of Week 2. Similarly, B1.7–B1.9 (security rules) and B2.1–B2.2 (CRUD + RSVP services) are prerequisites for most of the Frontend Week 2 wiring work. Coordinate daily standups between teams to avoid blockers.
