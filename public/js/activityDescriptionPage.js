import { getActivityById } from "../activitiesData.js";

const params = new URLSearchParams(window.location.search);
const activityId = params.get("activity");

getActivityById(activityId).then((activity) => {
  const content = document.getElementById("content");

  if (!activity) {
    content.innerHTML = `
                    <p id="not-found">Activity not found. <a href="activities.html">Go back to activities.</a></p>
                `;
    return;
  }

  document.title = `Fishy Activities | ${activity.title}`;

  content.innerHTML = `
                <h1 id="title">${activity.title}</h1>
                <h2 id="location">${activity.location}</h2>
                <h2 id="time">${activity.displayTime}</h2>
                <img id="image" src="${activity.image}" alt="${activity.title}">
                <p id="description">${activity.description}</p>
            `;
});
