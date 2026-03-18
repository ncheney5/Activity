import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const goBtn = document.getElementById("goBtn");
const closeBtn = document.getElementById("closeBtn");

let activities = [];
let currentRotation = 0;
let selectedActivity = null;

async function loadActivities() {
  try {
    const snapshot = await getDocs(collection(db, "activities"));

    activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    activities = activities.filter(activity => activity.active !== false);

    if (activities.length === 0) {
      wheel.innerHTML = "<p>No activities found.</p>";
      spinBtn.disabled = true;
      return;
    }

    buildWheel(activities);
  } catch (error) {
    console.error("Error loading activities:", error);
    wheel.innerHTML = "<p>Could not load activities.</p>";
    spinBtn.disabled = true;
  }
}

function buildWheel(activityList) {
  const sliceSize = 360 / activityList.length;
  const colors = [
    "#3b82f6",
    "#06b6d4",
    "#14b8a6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899"
  ];

  const gradientParts = activityList.map((activity, index) => {
    const start = index * sliceSize;
    const end = start + sliceSize;
    const color = colors[index % colors.length];
    return `${color} ${start}deg ${end}deg`;
  });

  wheel.style.background = `conic-gradient(${gradientParts.join(", ")})`;
  wheel.innerHTML = "";

  activityList.forEach((activity, index) => {
    const label = document.createElement("div");
    label.classList.add("slice-label");
    label.textContent = activity.name;

    const angle = index * sliceSize;
    label.style.transform = `rotate(${angle}deg) translate(110px, -10px)`;

    wheel.appendChild(label);
  });
}

function spinWheel() {
  if (activities.length === 0) return;

  const sliceSize = 360 / activities.length;
  const randomIndex = Math.floor(Math.random() * activities.length);
  selectedActivity = activities[randomIndex];

  const extraSpins = 360 * 5;
  const stopAngle = 360 - (randomIndex * sliceSize) - (sliceSize / 2);

  currentRotation += extraSpins + stopAngle;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    popupText.textContent = `Go to activity: ${selectedActivity.name}`;
    popup.classList.remove("hidden");
  }, 4000);
}

spinBtn.addEventListener("click", spinWheel);

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

goBtn.addEventListener("click", () => {
  if (!selectedActivity) return;

  if (selectedActivity.slug) {
    window.location.href = `activity.html?slug=${selectedActivity.slug}`;
  } else {
    window.location.href = `activities.html?id=${selectedActivity.id}`;
  }
});

loadActivities();