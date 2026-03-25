// public/js/rsvpListeners.js

import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase.js";

export function listenToRsvpCount(activityId, callback) {
  const rsvpRef = collection(db, "rsvp");

  const q = query(
    rsvpRef,
    where("activityId", "==", activityId),
    where("status", "==", "yes")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}