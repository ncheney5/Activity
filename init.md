# Fishy Activities — Project Init

## Project Goal

Fishy Activities is a social activity discovery web app for BYU-Idaho students in Rexburg, Idaho. It aggregates activities from multiple sources, adds a social layer (RSVP counts, attendee visibility), and lets admin users create their own events — making it more dynamic and community-driven than the school's existing activity page.

### Target Outcomes

1. **Activity Feed** — A browsable, filterable list of activities sourced from admin-created entries (and, in the future, scraped from BYU-Idaho's student activities page).
2. **RSVP System** — Any signed-in user can mark "going" or "not going" on an activity. A live count of attendees is visible to everyone.
3. **Admin Activity Creation** — Authenticated admin users can create, edit, and delete activities with full details (name, date/time, location, cost, description).
4. **Google OAuth Login** — Users sign in with Google. Two roles exist: regular user and admin.
5. **Google Maps Integration** — Activity locations link out to Google Maps.
6. **Filtering & Sorting** — Filter activities by time, cost, and sort by date or popularity.
7. **Future: Attendee Chat** — Users RSVP'd "going" can message each other within an activity (Priority 2, not in initial scope).
8. **Future: BYU-Idaho Scrape** — Automated activity import from `byui.edu/student-activities/search` once Firebase Cloud Functions billing is available.

### Differentiators vs. BYU-I Activity Page

- Aggregates multiple sources (not just the school)
- Shows social proof: how many people are going
- Supports admin-created events alongside official ones
- Communication layer for committed attendees (future)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Hosting | Firebase Hosting |
| Database | Cloud Firestore |
| Authentication | Firebase Auth (Google OAuth) |
| CI/CD | GitHub Actions → Firebase Hosting deploy on merge / preview on PR |
| Frontend | Vanilla HTML / CSS / JavaScript (no framework) |
| Cloud Functions | **Not available** — school billing not set up. All logic is client-side for now. |

### Constraint: No Cloud Functions

Without billing, Firebase Cloud Functions cannot be used. This means:

- All Firestore reads/writes happen client-side via the Firebase JS SDK.
- Admin roles are stored in a Firestore `users` collection and enforced via security rules (custom auth claims require Cloud Functions to set).
- The BYU-Idaho scraper is deferred. A stub module (`scraper-service.js`) defines the interface so integration is straightforward once Functions are available.
- All activities are entered manually by admin users for the proof of concept.

---

## Current Project State

### What Exists

| Item | Status | Notes |
|------|--------|-------|
| Firebase project | Done | `cit170-activity-votes` — Firestore + Hosting initialized |
| CI/CD pipelines | Done | GitHub Actions for deploy on merge to `main` and preview on PR |
| `index.html` | Partial | Landing page with hero image, logo, nav bar, intro text, embedded YouTube video, footer |
| `styles.css` | Partial | Styling for header, nav, hero, signup card, footer. **Not responsive** — fixed at 800px width |
| Firestore rules | Placeholder | Wide-open temporary rules: `allow read, write` expiring April 8, 2026 |
| Git branches | Done | `main` and `back_end` branches |
| `.firebaserc` | Done | Points to `cit170-activity-votes` |
| `firebase.json` | Done | Configures Firestore and Hosting with SPA rewrite |

### What Does NOT Exist Yet

- **No `package.json`** — No npm dependencies, Firebase JS SDK not installed
- **No JavaScript files** — Zero client-side logic; no Firebase SDK initialization, no auth, no Firestore interaction
- **No `activities.html`** — Linked in nav but the page doesn't exist
- **No `sign_in.html`** — Linked in nav but the page doesn't exist
- **No Firestore data model** — No collections defined, no schemas, no seed data
- **No Google OAuth integration** — Auth not configured in code
- **No RSVP system** — No data layer, no UI
- **No admin activity creation** — No form, no role system
- **No responsive/mobile design** — CSS is hardcoded to 800px width
- **No filtering or sorting**
- **No Google Maps integration**
- **No scraper or scraper stub**

### File Tree (non-git)

```
Activity/
├── .firebaserc
├── .gitignore
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml
│       └── firebase-hosting-pull-request.yml
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── init.md
├── README.md
└── public/
    ├── index.html
    └── styles.css
```

---

## 3-Week Roadmap Overview

| Week | Focus | Backend | Frontend |
|------|-------|---------|----------|
| **1** | Foundation | Firestore schema, Firebase SDK init, auth service, security rules, seed data | Project restructure, responsive CSS, all HTML pages, card/form design |
| **2** | Feature Dev | CRUD + RSVP services, real-time listeners, filtering queries, scraper stub | Wire auth, render live feed, RSVP UI, admin form, filters, Maps links |
| **3** | QA & Polish | Security audit, harden rules, edge-case testing, CI/CD verification, documentation | Cross-browser/mobile/a11y testing, performance, UX polish, user acceptance testing |
