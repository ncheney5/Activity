# Firebase — Fishy Activities

## Web client

- SDK: ES modules from `https://www.gstatic.com/firebasejs/10.12.2/` (see [`public/firebase.js`](../public/firebase.js)).
- Paste your Web app config from **Firebase Console → Project settings → Your apps** into `firebase.js` (`apiKey`, `messagingSenderId`, `appId`, etc.).
- Enable **Google** sign-in under **Authentication → Sign-in method**.
- Add your Hosting domain (and `localhost`) under **Authentication → Settings → Authorized domains**.

## Collections

### `users/{uid}`

| Field | Type | Notes |
|-------|------|--------|
| `displayName` | string | From Google profile |
| `email` | string | |
| `photoURL` | string \| null | |
| `role` | `"user"` \| `"admin"` | Set `admin` manually in console for admins |
| `createdAt` | timestamp | Set on first sign-in |

### `activities/{activityId}`

| Field | Type | Notes |
|-------|------|--------|
| `title`, `description`, `location` | string | |
| `date` | string | ISO `YYYY-MM-DD` (used for sorting) |
| `time` | string | e.g. `14:00` |
| `displayTime` | string | Human-readable line |
| `image` | string | URL or path under `public/` |
| `cost` | number | `0` = free (used by filters) |
| `goingCount` | number | Optional legacy; live count uses `rsvps` |
| `active` | boolean | `false` hides from lists |
| `createdBy`, `updatedBy` | string | UIDs |
| `createdAt`, `updatedAt` | timestamp | |

### `rsvps/{uid}_{activityId}`

Document ID: `{uid}_{activityId}`.

| Field | Type | Notes |
|-------|------|--------|
| `ownerUid` | string | Must equal `request.auth.uid` |
| `activityId` | string | |
| `status` | `"going"` \| `"not_going"` | Only `"going"` rows are counted |
| `updatedAt` | timestamp | |

## Security rules

See [`firestore.rules`](../firestore.rules): public read on `activities` and `rsvps` (for feed and counts); writes restricted as documented there.

## Composite index

Deploy [`firestore.indexes.json`](../firestore.indexes.json) for RSVP queries: `activityId` + `status`.

## Seeding

- Admins can open [`public/seed.html`](../public/seed.html) (while signed in) to batch-write the six sample activities **only if** the `activities` collection is empty.
