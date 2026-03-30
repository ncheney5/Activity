/**
 * Single activity view: maps link, RSVP, admin edit/delete.
 */
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getActivityById } from "./activitiesData.js";
import {
  listenToRsvpCount,
  getUserRsvpMap,
  setUserRsvp
} from "./rsvp-service.js";

const params = new URLSearchParams(window.location.search);
const activityId = params.get("activity");

function mapsUrl(location) {
  const q = encodeURIComponent(location || "");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function requireAuthOrRedirect() {
  if (!auth.currentUser) {
    const here = encodeURIComponent(
      `activitiesdescription.html?activity=${activityId || ""}`
    );
    window.location.href = `sign.html?return=${here}`;
    return false;
  }
  return true;
}

async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() && snap.data().role === "admin";
}

function renderNotFound() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <p id="not-found">Activity not found. <a href="activities.html">Go back to activities.</a></p>
  `;
}

async function renderActivity(activity) {
  document.title = `Fishy Activities | ${activity.title}`;
  const content = document.getElementById("content");
  const mapLink = mapsUrl(activity.location);

  content.innerHTML = `
    <h1 id="title">${escapeHtml(activity.title)}</h1>
    <p id="location">
      <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="maps-link">${escapeHtml(activity.location)}</a>
    </p>
    <p id="time">${escapeHtml(activity.displayTime || "")}</p>
    <img id="image" src="${escapeAttr(activity.image)}" alt="${escapeAttr(activity.title)}">
    <p id="cost" class="cost">
    ${activity.cost ? `$${escapeHtml(activity.cost)}` : "Free"}
    </p>
    <p id="going-line" class="going-line"><span id="detail-going-count"></span></p>
    <div id="detail-rsvp" class="detail-rsvp">
      <button type="button" class="btn-going" id="detail-going">✓ Going</button>
      <button type="button" class="btn-notgoing" id="detail-not">✕ Not going</button>
    </div>
    <p id="description">${escapeHtml(activity.description || "")}</p>
    <div id="admin-actions" class="admin-actions" hidden>
      <a class="button-link" href="addActivities.html?edit=${encodeURIComponent(activity.id)}">Edit</a>
      <button type="button" class="button-danger" id="delete-activity">Delete</button>
    </div>
  `;

  let deleteHandlerBound = false;
  async function setupAdminUi() {
    const admin = await isAdmin();
    const box = document.getElementById("admin-actions");
    const delBtn = document.getElementById("delete-activity");
    if (!box || !delBtn) return;
    box.hidden = !admin;
    if (admin && !deleteHandlerBound) {
      deleteHandlerBound = true;
      delBtn.addEventListener("click", async () => {
        if (!confirm("Delete this activity permanently?")) return;
        try {
          await deleteDoc(doc(db, "activities", activity.id));
          window.location.href = "activities.html";
        } catch (e) {
          console.error(e);
          alert("Could not delete. Check permissions.");
        }
      });
    }
  }
  const countEl = document.getElementById("detail-going-count");
  listenToRsvpCount(activity.id, (n) => {
    countEl.textContent = n === 1 ? "1 person going" : `${n} people going`;
  });

  const goingBtn = document.getElementById("detail-going");
  const notBtn = document.getElementById("detail-not");

  async function refreshRsvpButtons() {
    const map = auth.currentUser ? await getUserRsvpMap() : {};
    const st = map[activity.id];
    goingBtn.classList.toggle("active", st === "going");
    notBtn.classList.toggle("active", st === "not_going");
  }

  goingBtn.addEventListener("click", async () => {
    if (!requireAuthOrRedirect()) return;
    try {
      if (goingBtn.classList.contains("active")) {
        await setUserRsvp(activity.id, null);
      } else {
        await setUserRsvp(activity.id, "going");
      }
      await refreshRsvpButtons();
    } catch (e) {
      if (e.code === "AUTH_REQUIRED" || e.message === "AUTH_REQUIRED") {
        requireAuthOrRedirect();
      } else {
        console.error(e);
        alert("Could not update RSVP.");
      }
    }
  });

  notBtn.addEventListener("click", async () => {
    if (!requireAuthOrRedirect()) return;
    try {
      if (notBtn.classList.contains("active")) {
        await setUserRsvp(activity.id, null);
      } else {
        await setUserRsvp(activity.id, "not_going");
      }
      await refreshRsvpButtons();
    } catch (e) {
      if (e.code === "AUTH_REQUIRED" || e.message === "AUTH_REQUIRED") {
        requireAuthOrRedirect();
      } else {
        console.error(e);
        alert("Could not update RSVP.");
      }
    }
  });

  await setupAdminUi();
  await refreshRsvpButtons();
  onAuthStateChanged(auth, () => {
    setupAdminUi();
    refreshRsvpButtons();
  });
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

async function boot() {
  if (!activityId) {
    renderNotFound();
    return;
  }
  const activity = await getActivityById(activityId);
  if (!activity) {
    renderNotFound();
    return;
  }
  await renderActivity(activity);
}

boot();
