/**
 * RSVP: collection `rsvps`, doc id `${uid}_${activityId}`, fields per firestore.rules
 */
import { auth, db } from "../firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const RSVPS = "rsvps";

export function rsvpDocId(uid, activityId) {
  return `${uid}_${activityId}`;
}

/** Subscribe to count of users with status "going" for an activity. */
export function listenToRsvpCount(activityId, callback) {
  const q = query(
    collection(db, RSVPS),
    where("activityId", "==", activityId),
    where("status", "==", "going")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (err) => {
      console.error("RSVP count listener:", err);
      callback(0);
    }
  );
}

/** All RSVPs for the signed-in user (activityId -> status). */
export async function getUserRsvpMap() {
  const user = auth.currentUser;
  if (!user) return {};
  const q = query(collection(db, RSVPS), where("ownerUid", "==", user.uid));
  const snap = await getDocs(q);
  const map = {};
  snap.forEach((d) => {
    const x = d.data();
    if (x.activityId) map[x.activityId] = x.status;
  });
  return map;
}

/**
 * @param {"going"|"not_going"|null} status — null removes the RSVP doc
 */
export async function setUserRsvp(activityId, status) {
  const user = auth.currentUser;
  if (!user) {
    const err = new Error("AUTH_REQUIRED");
    err.code = "AUTH_REQUIRED";
    throw err;
  }
  const rid = rsvpDocId(user.uid, activityId);
  const ref = doc(db, RSVPS, rid);
  if (status === null) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(
    ref,
    {
      ownerUid: user.uid,
      activityId,
      status,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
