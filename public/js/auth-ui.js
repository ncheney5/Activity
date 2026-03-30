/**
 * Shared nav: Sign In vs profile + Sign Out; sets body.is-admin for CSS/visibility.
 */
import { auth, db } from "../firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || null,
      role: "user",
      createdAt: serverTimestamp()
    });
  }
}

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return "user";
  return snap.data().role === "admin" ? "admin" : "user";
}

function setAdminUi(isAdmin) {
  document.body.classList.toggle("is-admin", isAdmin);
  document.querySelectorAll(".quick-nav-add").forEach((el) => {
    el.hidden = !isAdmin;
  });
}

function renderSignedOut(slot) {
  slot.innerHTML =
    '<a class="sign-in" href="sign.html">Sign In</a>';
  setAdminUi(false);
}

function renderSignedIn(slot, user, role) {
  const name = user.displayName || user.email || "Account";
  const initial = (name[0] || "?").toUpperCase();
  const photo = user.photoURL
    ? `<img src="${user.photoURL}" alt="" class="nav-user-avatar">`
    : `<span class="nav-user-initial">${initial}</span>`;
  slot.innerHTML = `
    <span class="nav-user">
      ${photo}
      <span class="nav-user-name">${escapeHtml(name)}</span>
    </span>
    <button type="button" class="nav-sign-out">Sign out</button>
  `;
  slot.querySelector(".nav-sign-out").addEventListener("click", () => {
    signOut(auth).catch(console.error);
  });
  setAdminUi(role === "admin");
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

export function initAuthNav() {
  const slot = document.querySelector(".nav-auth-slot");
  if (!slot) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      renderSignedOut(slot);
      return;
    }
    try {
      await ensureUserDoc(user);
      const role = await getRole(user.uid);
      renderSignedIn(slot, user, role);
    } catch (e) {
      console.error(e);
      renderSignedIn(slot, user, "user");
    }
  });
}

initAuthNav();
