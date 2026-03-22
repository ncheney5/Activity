# FIRESTORE COLLECTION SCHEMAS

## 1. Collection: activities
- name — string
- date — string o timestamp
- time — string
- location — string
- cost — number
- description — string
- createdBy — string (uid)
- source — string

### Relationships
- createdBy → users/{uid}
- One activity can have many RSVPs

## 2. Collection: users
- uid — string (doc ID)
- displayName — string
- email — string
- photoURL — string
- role — string ("user" o "admin")

### Relationships
- A user can create activities (if admin)
- A user can have many RSVPs
- uid connects to rsvps.uid

## 3. Collection: rsvps
- activityId — string
- uid — string
- status — string ("yes", "no", "maybe")

### Relationships
- activityId → activities/{id}
- uid → users/{uid}
- Many-to-many relationship

### Important rule
- Only one RSVP per user per activity

## Diagram
users (1) ----< (N) activities
   │                │
   │                └───< (N) rsvps >─── (N) users
