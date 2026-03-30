import { db } from "./firebase.js";
import { getActivities } from "./js/activitiesData.js";
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

    let firestoreActivities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    firestoreActivities = firestoreActivities.filter(activity => activity.active !== false);

    if (firestoreActivities.length > 0) {
      activities = firestoreActivities;
    } else {
      activities = await getActivities();
    }
  } catch (error) {
    console.error("Firestore failed. Using local activities.", error);
    activities = await getActivities();
  }

  if (!activities || activities.length === 0) {
    activities = getPlaceholderActivities();
  }

  buildWheel(activities);
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

  const dividerColor = "#ffffff";
  const dividerWidth = 1.5;
  const gradientParts = [];

  activityList.forEach((activity, index) => {
    const start = index * sliceSize;
    const end = start + sliceSize;
    const color = colors[index % colors.length];

    gradientParts.push(
      `${dividerColor} ${start}deg ${start + dividerWidth}deg`,
      `${color} ${start + dividerWidth}deg ${end - dividerWidth}deg`,
      `${dividerColor} ${end - dividerWidth}deg ${end}deg`
    );
  });

  wheel.style.background = `conic-gradient(${gradientParts.join(", ")})`;
  wheel.innerHTML = `
    <div class="wheel-center">
      <span>?</span>
    </div>
  `;
}

function spinWheel() {
  if (!activities.length) return;

  spinBtn.disabled = true;

  const sliceSize = 360 / activities.length;
  const randomIndex = Math.floor(Math.random() * activities.length);
  selectedActivity = activities[randomIndex];

  const extraSpins = 360 * 5;
  const targetAngle = 360 - (randomIndex * sliceSize) - (sliceSize / 2);

  currentRotation += extraSpins + targetAngle;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    popupText.textContent = selectedActivity.title || "No Activity";
    popup.classList.remove("hidden");
    spinBtn.disabled = false;
  }, 4000);
}

goBtn.addEventListener("click", () => {
  if (!selectedActivity || !selectedActivity.id) {
    alert("No activity available.");
    return;
  }

  if (selectedActivity.slug) {
    window.location.href = `activitiesdescription.html?activity=${encodeURIComponent(selectedActivity.slug)}`;
  } else if (selectedActivity.id) {
    window.location.href = `activitiesdescription.html?activity=${encodeURIComponent(selectedActivity.id)}`;
  } else {
    window.location.href = "activities.html";
  }
});

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

spinBtn.addEventListener("click", spinWheel);

function getPlaceholderActivities() {
  return [
    { id: null, title: "No Activity" },
    { id: null, title: "Try Again" },
    { id: null, title: "Nothing Loaded" },
    { id: null, title: "Check Back Later" }
  ];
}

loadActivities();