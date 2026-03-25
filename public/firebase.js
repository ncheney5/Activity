import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU5KpQa9T7lFHq4AdnHcYugJAwwIZrjbQ",
  authDomain: "cit170-activity-votes.firebaseapp.com",
  projectId: "cit170-activity-votes",
  storageBucket: "cit170-activity-votes.firebasestorage.app",
  messagingSenderId: "771325751641",
  appId: "1:771325751641:web:8822d42a3541cccfb1dc48",
  measurementId: "G-YW7CSN76JM",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };
