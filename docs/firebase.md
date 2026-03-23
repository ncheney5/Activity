# Firebase Developer Documentation  
_For the Campus Activities RSVP App_

---

## 1. Firestore Collection Schemas

### **Collection: users**
Each document represents a student.

| Field       | Type                | Description                     |
|-------------|---------------------|---------------------------------|
| `uid`       | string (doc ID)     | Firebase Auth user ID           |
| `name`      | string              | Student’s full name             |
| `email`     | string              | Student’s email                 |
| `role`      | string              | `"user"` or `"admin"`           |
| `createdAt` | timestamp           | When the user was created       |

---

### **Collection: activities**
Campus activities that students can view and RSVP to.

| Field       | Type      | Description                                |
|-------------|-----------|--------------------------------------------|
| `title`     | string    | Activity name                              |
| `description` | string  | Details about the activity                 |
| `date`      | timestamp | Date and time of the activity              |
| `location`  | string    | Where the activity takes place             |
| `createdBy` | string    | UID of the admin who created it            |
| `createdAt` | timestamp | When the activity was created              |

---

### **Collection: rsvp**
Tracks each student’s RSVP for each activity.

| Field        | Type      | Description                     |
|--------------|-----------|---------------------------------|
| `activityId` | string    | ID of the activity              |
| `userId`     | string    | ID of the user                  |
| `status`     | string    | `"yes"`, `"no"`, `"maybe"`      |
| `timestamp`  | timestamp | Last update time                |

**Rule:** Each user should have only **one RSVP per activity**.

---

## 2. Security Rule Logic

These rules assume admin roles are stored in Firestore (`role: "admin"`).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // USERS
    match /users/{uid} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == uid;
    }

    // ACTIVITIES
    match /activities/{id} {
      allow read: if true; // public
      allow create, update, delete: if isAdmin();
    }

    // RSVP
    match /rsvp/{id} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if false;
    }
  }
}
```

---

## 3. Service Module Function Signatures

These are the functions the frontend uses to interact with Firebase.

### **Auth**
```javascript
login(email, password)
logout()
onAuthStateChanged(callback)
```

### **Users**
```javascript
getCurrentUser()
getUser(uid)
updateUser(uid, data)
```

### **Activities**
```javascript
getActivities()
getActivityById(id)
createActivity(data)        // admin only
updateActivity(id, data)    // admin only
```

### **RSVP**
```javascript
sendRSVP(activityId, status)   // yes/no/maybe
getUserRSVP(activityId, userId)
getActivityRSVPs(activityId)   // admin only
```

---

## 4. How to Add a New Admin User

Since there is no backend Cloud Function, admin roles are assigned manually.

### **Steps:**
1. Go to Firebase Console → Firestore Database  
2. Open the `users` collection  
3. Select the user document  
4. Add or update the field:

```json
role: "admin"
```

5. Save the document

The user now has admin permissions.

---

## 5. How to Seed Data

You can seed initial activities or users in two ways.

---

### **Method A — Import JSON (simple)**

Create a file named `seed.json`:

```json
{
  "activities": {
    "activity1": {
      "title": "Game Night",
      "description": "Fun activities at the student center",
      "date": { "_seconds": 1711238400, "_nanoseconds": 0 },
      "location": "Manwaring Center",
      "createdBy": "adminUID",
      "createdAt": { "_seconds": 1711230000, "_nanoseconds": 0 }
    }
  }
}
```

Then:

1. Firebase Console → Firestore  
2. Click **Import/Export**  
3. Upload the JSON file  

---

### **Method B — JavaScript Seeding Script**

```javascript
import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function seedActivities() {
  const activities = [
    {
      title: "Game Night",
      description: "Fun activities at the student center",
      date: new Date("2024-03-20T19:00:00"),
      location: "Manwaring Center",
      createdBy: "adminUID",
      createdAt: serverTimestamp()
    }
  ];

  for (const activity of activities) {
    await addDoc(collection(db, "activities"), activity);
  }
}

seedActivities();
```

Run it once with:

```
node seed.js
```

---

# End of Documentation
