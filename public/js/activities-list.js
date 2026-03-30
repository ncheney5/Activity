/**
 * Activities feed: cards, filters, Firestore RSVPs.
 */
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getActivities } from "./activitiesData.js";
import {
  listenToRsvpCount,
  getUserRsvpMap,
  setUserRsvp
} from "./rsvp-service.js";

const goingCounts = {};
const unsubByActivity = {};

function requireAuthOrRedirect() {
  if (!auth.currentUser) {
    const here = encodeURIComponent(
      window.location.pathname.split("/").pop() || "activities.html"
    );
    window.location.href = `sign.html?return=${here}`;
    return false;
  }
  return true;
}

function renderCards(activities, rsvpMap) {
  const list = document.getElementById("activity-list");
  Object.values(unsubByActivity).forEach((u) => u && u());
  for (const k of Object.keys(unsubByActivity)) delete unsubByActivity[k];

  activities.forEach((a) => {
    goingCounts[a.id] = typeof a.goingCount === "number" ? a.goingCount : 0;
  });

  list.innerHTML = activities
    .map((activity, index) => {
      const free = (activity.cost ?? 0) === 0;
      const pop =
        typeof activity.goingCount === "number" ? activity.goingCount : 0;
      const st = rsvpMap[activity.id];
      const goingActive = st === "going" ? " active" : "";
      const notActive = st === "not_going" ? " active" : "";

      return `
        <div class="activity-card"
            data-free="${free}"
            data-date="${activity.date}"
            data-popularity="${pop}"
            data-activity-id="${activity.id}"
            data-index="${index}"
            onclick="window.__goToActivity('${activity.id}')">
            <img src="${activity.image}" alt="${escapeAttr(activity.title)}">
            <div class="card-body">
                <h3 class="card-title">${escapeHtml(activity.title)}</h3>
                <p class="card-time">${escapeHtml(activity.displayTime || "")}</p>
                <p class="card-maps"><a href="${mapsUrl(activity.location)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Open in Maps</a></p>
                <p class="card-cost">${free
                  ? '<span class="cost-badge cost-free">Free</span>'
                  : `<span class="cost-badge cost-paid">$${Number(activity.cost).toFixed(2)}</span>`
          }</p>
        <p class="card-description">${escapeHtml(activity.description || "")}</p>
            </div>
            <div class="card-actions" onclick="event.stopPropagation()">
                <button type="button" class="btn-going${goingActive}" data-action="going" data-id="${activity.id}" data-idx="${index}" title="I'm going">✓</button>
                <button type="button" class="btn-notgoing${notActive}" data-action="notgoing" data-id="${activity.id}" data-idx="${index}" title="Not going">✕</button>
                <span class="rsvp-status" id="status-${index}"></span>
                <span class="going-count" id="count-${activity.id}"></span>
            </div>
        </div>`;
    })
    .join("");

  activities.forEach((activity, index) => {
    const st = rsvpMap[activity.id];
    const statusEl = document.getElementById(`status-${index}`);
    if (statusEl && st === "going") {
      statusEl.textContent = "Going!";
      statusEl.style.color = "#2e7d32";
    } else if (statusEl && st === "not_going") {
      statusEl.textContent = "Not going";
      statusEl.style.color = "#c62828";
    }
  });

  activities.forEach((activity) => {
    const el = document.getElementById(`count-${activity.id}`);
    unsubByActivity[activity.id] = listenToRsvpCount(activity.id, (n) => {
      goingCounts[activity.id] = n;
      if (el) el.textContent = n > 0 ? `${n} going` : "";
      const card = document.querySelector(
        `.activity-card[data-activity-id="${activity.id}"]`
      );
      if (card) card.dataset.popularity = String(n);
    });
  });

  list.querySelectorAll(".btn-going, .btn-notgoing").forEach((btn) => {
    btn.addEventListener("click", onRsvpClick);
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

function mapsUrl(location) {
  const q = encodeURIComponent(location || "");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

window.__goToActivity = function (activityId) {
  window.location.href = `activitiesdescription.html?activity=${encodeURIComponent(activityId)}`;
};

async function onRsvpClick(ev) {
  const btn = ev.currentTarget;
  const activityId = btn.getAttribute("data-id");
  const idx = btn.getAttribute("data-idx");
  const type = btn.getAttribute("data-action");
  if (!requireAuthOrRedirect()) return;

  const actions = btn.closest(".card-actions");
  const goingBtn = actions.querySelector(".btn-going");
  const notBtn = actions.querySelector(".btn-notgoing");
  let statusEl = actions.querySelector(".rsvp-status");
  if (!statusEl) {
    statusEl = document.createElement("span");
    statusEl.className = "rsvp-status";
    statusEl.id = `status-${idx}`;
    actions.insertBefore(statusEl, actions.querySelector(".going-count"));
  }

  const wasGoing = goingBtn.classList.contains("active");
  const isTogglingOff = btn.classList.contains("active");

  try {
    if (type === "going") {
      if (isTogglingOff) {
        await setUserRsvp(activityId, null);
        goingBtn.classList.remove("active");
        statusEl.textContent = "";
      } else {
        await setUserRsvp(activityId, "going");
        goingBtn.classList.add("active");
        notBtn.classList.remove("active");
        statusEl.textContent = "Going!";
        statusEl.style.color = "#2e7d32";
      }
    } else {
      if (isTogglingOff) {
        await setUserRsvp(activityId, null);
        notBtn.classList.remove("active");
        statusEl.textContent = "";
      } else {
        await setUserRsvp(activityId, "not_going");
        notBtn.classList.add("active");
        goingBtn.classList.remove("active");
        statusEl.textContent = "Not going";
        statusEl.style.color = "#c62828";
        if (wasGoing) {
          /* count updates via listener */
        }
      }
    }
  } catch (e) {
    if (e.code === "AUTH_REQUIRED" || e.message === "AUTH_REQUIRED") {
      requireAuthOrRedirect();
    } else {
      console.error(e);
      alert("Could not save RSVP. Check your connection and Firestore rules.");
    }
  }
}

function toggleFilters() {
  document.getElementById("filter-panel").classList.toggle("hidden");
}
window.toggleFilters = toggleFilters;

function applyFilters() {
  const freeOnly = document.getElementById("freeOnly");
  const timeFilter = document.getElementById("timeFilter");
  const sortBy = document.getElementById("sortBy");
  const cards = Array.from(document.querySelectorAll(".activity-card"));
  const list = document.getElementById("activity-list");

  let filtered = cards.filter((card) => {
    const isFree = card.dataset.free === "true";
    const date = new Date(card.dataset.date);
    const now = new Date();

    if (freeOnly.checked && !isFree) return false;

    if (timeFilter.value === "today") {
      if (date.toDateString() !== now.toDateString()) return false;
    }

    if (timeFilter.value === "week") {
      const diff = (date - now) / (1000 * 60 * 60 * 24);
      if (diff < 0 || diff > 7) return false;
    }

    return true;
  });

  if (sortBy.value === "soonest") {
    filtered.sort(
      (a, b) => new Date(a.dataset.date) - new Date(b.dataset.date)
    );
  }

  if (sortBy.value === "popular") {
    filtered.sort(
      (a, b) =>
        Number(b.dataset.popularity || 0) - Number(a.dataset.popularity || 0)
    );
  }

  filtered.forEach((card) => list.appendChild(card));
}

async function boot() {
  let rsvpMap = {};
  if (auth.currentUser) {
    try {
      rsvpMap = await getUserRsvpMap();
    } catch (e) {
      console.warn(e);
    }
  }

  const activities = await getActivities();
  renderCards(activities, rsvpMap);

  const freeOnly = document.getElementById("freeOnly");
  const timeFilter = document.getElementById("timeFilter");
  const sortBy = document.getElementById("sortBy");
  freeOnly.addEventListener("change", applyFilters);
  timeFilter.addEventListener("change", applyFilters);
  sortBy.addEventListener("change", applyFilters);

  onAuthStateChanged(auth, async () => {
    try {
      const map = auth.currentUser ? await getUserRsvpMap() : {};
      const acts = await getActivities();
      renderCards(acts, map);
    } catch (e) {
      console.warn(e);
    }
  });
}

boot();
