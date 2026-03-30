import { getActivities } from "../activitiesData.js";

// ── Render ──────────────────────────────────────────────────────
const goingCounts = {};

function renderCards(activities) {
  const list = document.getElementById("activity-list");

  activities.forEach((a) => (goingCounts[a.id] = a.goingCount));

  list.innerHTML = activities
    .map(
      (activity, index) => `
                <div class="activity-card" onclick="goToActivity('${activity.id}')">
                    <img src="${activity.image}" alt="${activity.title}">
                    <div class="card-body">
                        <h3 class="card-title">${activity.title}</h3>
                        <p class="card-time">${activity.displayTime}</p>
                        <p class="card-description">${activity.description}</p>
                    </div>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn-going"    onclick="rsvp(this, 'going',    'status-${index}', '${activity.id}')" title="I'm going">✓</button>
                        <button class="btn-notgoing" onclick="rsvp(this, 'notgoing', 'status-${index}', '${activity.id}')" title="Not going">✕</button>
                        <span class="rsvp-status" id="status-${index}"></span>
                        <span class="going-count" id="count-${activity.id}">${activity.goingCount > 0 ? activity.goingCount + " going" : ""}</span>
                    </div>
                </div>
            `
    )
    .join("");
}

getActivities().then(renderCards);

function goToActivity(activityId) {
  window.location.href = `activitiesdescription.html?activity=${activityId}`;
}

function rsvp(btn, type, statusId, activityId) {
  const actions = btn.closest(".card-actions");
  const goingBtn = actions.querySelector(".btn-going");
  const notBtn = actions.querySelector(".btn-notgoing");
  const status = document.getElementById(statusId);
  const countEl = document.getElementById("count-" + activityId);

  const wasGoing = goingBtn.classList.contains("active");
  const isTogglingOff = btn.classList.contains("active");

  if (isTogglingOff) {
    if (type === "going") goingCounts[activityId]--;
    btn.classList.remove("active");
    status.textContent = "";
  } else {
    if (type === "notgoing" && wasGoing) goingCounts[activityId]--;
    if (type === "going") goingCounts[activityId]++;

    goingBtn.classList.remove("active");
    notBtn.classList.remove("active");
    btn.classList.add("active");

    if (type === "going") {
      status.textContent = "Going!";
      status.style.color = "#2e7d32";
    } else {
      status.textContent = "Not going";
      status.style.color = "#c62828";
    }
  }

  const count = goingCounts[activityId];
  countEl.textContent = count > 0 ? count + " going" : "";
}

function toggleFilters() {
  document.getElementById("filter-panel")?.classList.toggle("hidden");
}

const freeOnly = document.getElementById("freeOnly");
const timeFilter = document.getElementById("timeFilter");
const sortBy = document.getElementById("sortBy");

if (freeOnly && timeFilter && sortBy) {
  freeOnly.addEventListener("change", applyFilters);
  timeFilter.addEventListener("change", applyFilters);
  sortBy.addEventListener("change", applyFilters);
}

function applyFilters() {
  const cards = Array.from(document.querySelectorAll(".activity-card"));
  const list = document.querySelector(".activity-list");

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
    filtered.sort((a, b) => b.dataset.popularity - a.dataset.popularity);
  }

  list.innerHTML = "";
  filtered.forEach((card) => list.appendChild(card));
}

window.goToActivity = goToActivity;
window.rsvp = rsvp;
window.toggleFilters = toggleFilters;
