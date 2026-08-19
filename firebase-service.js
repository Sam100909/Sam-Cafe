import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { FIREBASE_CONFIG, ADMIN_UIDS, isFirebaseConfigured } from "./firebase-config.js";

const configured = isFirebaseConfigured();
const app = configured ? initializeApp(FIREBASE_CONFIG) : null;

export const firebaseReady = configured;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;
export const isAdmin = user => Boolean(user && ADMIN_UIDS.includes(user.uid));
