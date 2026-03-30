import { auth, googleProvider } from "../firebase.js";
import {
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const ret = params.get("return") || "activities.html";

document.getElementById("google-sign-in").addEventListener("click", async () => {
  const errEl = document.getElementById("sign-error");
  errEl.textContent = "";
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = decodeURIComponent(ret);
  } catch (e) {
    console.error(e);
    errEl.textContent = e.message || "Sign-in failed.";
  }
});
