/**
 * Admin-only create/edit activity form.
 */
import { auth, db } from "../firebase.js";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// #region agent log
const _dl=(loc,msg,data,hid)=>{const p={sessionId:'b7e0b2',location:loc,message:msg,data:data,timestamp:Date.now(),hypothesisId:hid};console.log('[DEBUG]',msg,data);fetch('http://127.0.0.1:7688/ingest/f3c5dd6e-bc8f-4a40-90b5-5f2b4baf9d25',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b7e0b2'},body:JSON.stringify(p)}).catch(()=>{});};
_dl('add-activity.js:TOP','module loaded',{authExists:!!auth,authStateReadyExists:typeof auth.authStateReady,currentUserAtLoad:auth.currentUser?.uid||null},'H1,H4');
// #endregion

const params = new URLSearchParams(window.location.search);
const editId = params.get("edit");

/** Wait until persisted auth has restored (avoids false "signed out" on cold load). */
async function getResolvedUser() {
  // #region agent log
  _dl('add-activity.js:getResolvedUser','entering getResolvedUser',{hasAuthStateReady:typeof auth.authStateReady==='function',currentUserBefore:auth.currentUser?.uid||null},'H1,H2');
  // #endregion
  try {
    await auth.authStateReady();
  } catch(e) {
    // #region agent log
    _dl('add-activity.js:getResolvedUser','authStateReady THREW',{error:e.message,code:e.code},'H1');
    // #endregion
  }
  // #region agent log
  _dl('add-activity.js:getResolvedUser','authStateReady resolved',{currentUserAfter:auth.currentUser?.uid||null,currentUserEmail:auth.currentUser?.email||null},'H2');
  // #endregion
  return auth.currentUser;
}

function buildDisplayTime(dateStr, timeStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T${timeStr || "12:00"}:00`);
  if (Number.isNaN(d.getTime())) return `${dateStr} · ${timeStr || ""}`;
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

async function requireAdmin() {
  const user = await getResolvedUser();
  // #region agent log
  _dl('add-activity.js:requireAdmin','after getResolvedUser',{userUid:user?.uid||null,userEmail:user?.email||null},'H2');
  // #endregion
  if (!user) {
    // #region agent log
    _dl('add-activity.js:requireAdmin','REDIRECTING - no user',{},'H2');
    // #endregion
    window.location.href = "sign.html?return=addActivities.html";
    return false;
  }
  let snap;
  try {
    snap = await getDoc(doc(db, "users", user.uid));
  } catch(e) {
    // #region agent log
    _dl('add-activity.js:requireAdmin','Firestore user read FAILED',{error:e.message,code:e.code},'H3');
    // #endregion
  }
  // #region agent log
  _dl('add-activity.js:requireAdmin','user doc result',{exists:snap?.exists(),role:snap?.exists()?snap.data().role:null},'H3');
  // #endregion
  if (!snap || !snap.exists() || snap.data().role !== "admin") {
    document.querySelector("main").innerHTML = `
      <h1>Not authorized</h1>
      <p>Only administrators can add or edit activities.</p>
      <p><a href="activities.html">Back to activities</a></p>
    `;
    return false;
  }
  return true;
}

async function loadEdit() {
  if (!editId) return;
  const snap = await getDoc(doc(db, "activities", editId));
  if (!snap.exists()) {
    alert("Activity not found.");
    return;
  }
  const a = snap.data();
  document.getElementById("activity-name").value = a.title || "";
  document.getElementById("activity-description").value = a.description || "";
  document.getElementById("activity-location").value = a.location || "";
  document.getElementById("activity-date").value = a.date || "";
  document.getElementById("activity-time").value = a.time || "";
  document.getElementById("activity-cost").value =
    typeof a.cost === "number" ? a.cost : 0;
  document.getElementById("activity-image").value = a.image || "";
  document.querySelector("h1").textContent = "Edit Activity";
}

document.getElementById("add-activity-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!(await requireAdmin())) return;

  const title = document.getElementById("activity-name").value.trim();
  const description = document.getElementById("activity-description").value.trim();
  const location = document.getElementById("activity-location").value.trim();
  const date = document.getElementById("activity-date").value;
  const time = document.getElementById("activity-time").value.trim();
  const cost = Number(document.getElementById("activity-cost").value) || 0;
  let image = document.getElementById("activity-image").value.trim();
  if (!image) image = "images/hero.jpeg";

  const displayTime = buildDisplayTime(date, time);
  let user = auth.currentUser;
  if (!user) user = await getResolvedUser();

  const basePayload = {
    title,
    description,
    location,
    date,
    time,
    displayTime,
    image,
    cost,
    active: true
  };

  const msg = document.getElementById("form-message");
  if (!user) {
    msg.textContent = "Session expired. Sign in again.";
    return;
  }
  msg.textContent = "Saving…";

  try {
    if (editId) {
      await updateDoc(doc(db, "activities", editId), {
        ...basePayload,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      msg.textContent = "Saved! Redirecting…";
      window.location.href = `activitiesdescription.html?activity=${encodeURIComponent(editId)}`;
    } else {
      const ref = await addDoc(collection(db, "activities"), {
        ...basePayload,
        goingCount: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      msg.textContent = "Created! Redirecting…";
      window.location.href = `activitiesdescription.html?activity=${encodeURIComponent(ref.id)}`;
    }
  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Save failed.";
  }
});

(async () => {
  if (!(await requireAdmin())) return;
  await loadEdit();
})();
