import { auth, db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { seedActivities } from "./seed-firestore.js";

document.getElementById("seed-btn").addEventListener("click", async () => {
  const status = document.getElementById("seed-status");
  status.textContent = "";
  const user = auth.currentUser;
  if (!user) {
    status.textContent = "Sign in first.";
    return;
  }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    status.textContent = "Only admins can run the seed.";
    return;
  }
  try {
    const result = await seedActivities(user.uid);
    status.textContent = result.message;
  } catch (e) {
    console.error(e);
    status.textContent = e.message || "Seed failed.";
  }
});
