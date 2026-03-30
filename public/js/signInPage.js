import { signInWithGoogle } from "./auth.js";

const btn = document.getElementById("google-sign-in");
const errEl = document.getElementById("auth-error");

btn?.addEventListener("click", async () => {
  errEl.hidden = true;
  errEl.textContent = "";
  try {
    await signInWithGoogle();
    window.location.href = "activities.html";
  } catch (e) {
    errEl.hidden = false;
    if (e?.code === "auth/popup-closed-by-user") {
      errEl.textContent = "Sign-in was cancelled.";
    } else if (e?.code === "auth/popup-blocked") {
      errEl.textContent =
        "Popup was blocked. Allow popups for this site and try again.";
    } else {
      errEl.textContent = e?.message || "Sign-in failed. Please try again.";
    }
  }
});
