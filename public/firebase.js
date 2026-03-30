/**
 * Firebase Web SDK (ES modules + CDN).
 * Replace the placeholder values with your Web app config:
 * Firebase Console → Project settings → Your apps → SDK setup and configuration.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCU5KpQa9T7lFHq4AdnHcYugJAwwIZrjbQ",
  authDomain: "cit170-activity-votes.firebaseapp.com",
  projectId: "cit170-activity-votes",
  storageBucket: "cit170-activity-votes.firebasestorage.app",
  messagingSenderId: "771325751641",
  appId: "1:771325751641:web:8822d42a3541cccfb1dc48",
  measurementId: "G-YW7CSN76JM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
