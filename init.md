# Fishy Activities — Project Init

## Project Goal

Fishy Activities is a social activity discovery web app for BYU-Idaho students in Rexburg, Idaho. It aggregates activities from multiple sources, adds a social layer (RSVP counts), and lets admin users create their own events.

### Target Outcomes

1. **Activity Feed** — Browsable, filterable list (Firestore + local fallback seed data).
2. **RSVP System** — Signed-in users mark going / not going; live counts from `rsvps` (readable by everyone per rules).
3. **Admin Activity Creation** — Admins create, edit, and delete activities (`addActivities.html`, detail page actions).
4. **Google OAuth** — Sign in with Google; roles in `users/{uid}.role`.
5. **Google Maps** — Location links open Maps (cards + detail page).
6. **Filtering & Sorting** — Free / time range / sort by date or popularity.
7. **Future: Attendee Chat** — Not implemented.
8. **Future: BYU-Idaho Scrape** — Stub in [`public/js/scraper-service.js`](public/js/scraper-service.js); needs Cloud Functions when billing exists.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Hosting | Firebase Hosting |
| Database | Cloud Firestore |
| Authentication | Firebase Auth (Google) |
| CI/CD | GitHub Actions → Firebase Hosting |
| Frontend | Vanilla HTML / CSS / JavaScript (ES modules, SDK via CDN) |
| Cloud Functions | **Not used** — client-side SDK only |

---

## Current Project State (updated)

### Implemented

| Item | Notes |
|------|--------|
| Firebase project | `cit170-activity-votes` |
| CI/CD | Deploy on merge to `main`, PR previews |
| [`public/firebase.js`](public/firebase.js) | App, `auth`, `db`, `googleProvider` — **you must add real Web API keys** |
| [`public/js/auth-ui.js`](public/js/auth-ui.js) | Nav: Sign In / user + Sign Out; shows **Add Activity** for admins |
| [`public/js/activitiesData.js`](public/js/activitiesData.js) | `getActivities` / `getActivityById` — Firestore with local fallback |
| [`public/js/rsvp-service.js`](public/js/rsvp-service.js) | Persisted RSVPs, live counts |
| [`public/sign.html`](public/sign.html) | Google sign-in |
| [`public/activities.html`](public/activities.html) | Feed, filters, RSVP |
| [`public/activitiesdescription.html`](public/activitiesdescription.html) | Detail, Maps, RSVP, admin edit/delete |
| [`public/addActivities.html`](public/addActivities.html) | Admin create/edit (Firestore) |
| [`public/wheel.html`](public/wheel.html) | Random wheel → detail page |
| [`public/seed.html`](public/seed.html) | Admin one-time seed of six activities |
| [`firestore.rules`](firestore.rules) | Role-based admin; public read for activities + RSVPs |
| [`firestore.indexes.json`](firestore.indexes.json) | Composite index for RSVP queries |
| [`docs/firebase.md`](docs/firebase.md) | Schema + setup |

### Still manual / optional

- **No `package.json`** — SDK loaded from CDN; optional npm tooling not required.
- **Admin users** — Set `role: "admin"` on a user doc in Firestore Console.
- **Scraper** — Stub only; full scrape deferred until Cloud Functions.

### File tree (approx.)

```
Activity/
├── .firebaserc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── init.md
├── README.md
├── docs/
│   ├── firebase.md
│   └── firebase_model.md
└── public/
    ├── firebase.js
    ├── index.html
    ├── activities.html
    ├── activitiesdescription.html
    ├── addActivities.html
    ├── sign.html
    ├── wheel.html
    ├── about.html
    ├── seed.html
    ├── styles.css
    ├── wheelscript.js
    └── js/
        ├── activitiesData.js
        ├── activities-list.js
        ├── activity-detail.js
        ├── add-activity.js
        ├── auth-ui.js
        ├── rsvp-service.js
        ├── rsvpListeners.js
        ├── sign-page.js
        ├── seed-firestore.js
        ├── seed-page.js
        └── scraper-service.js
```

---

## Roadmap (remaining polish)

| Week | Focus |
|------|--------|
| **3** | QA: rules/index deploy, authorized domains, real `firebase.js` keys, mobile/a11y pass, performance |
