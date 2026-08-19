/*
 * Paste the Firebase Web App configuration from Firebase Console here.
 * These values are public client identifiers, not server secrets. Never put a
 * service account, Admin SDK key, or private key in this project.
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAg726uDErkeIxk3bWs1Zq1fcx2Dt9JhJU",
  authDomain: "sam-cafe-715b4.firebaseapp.com",
  projectId: "sam-cafe-715b4",
  storageBucket: "sam-cafe-715b4.firebasestorage.app",
  messagingSenderId: "730135823707",
  appId: "1:730135823707:web:53821af76f31d28e77c67e",
  measurementId: "G-9V8CEB3C7D"
};

// Add Firebase Authentication user UIDs for staff who may manage the menu.
// Keep this list in sync with the allow-list in firestore.rules.
export const ADMIN_UIDS = [
  "KmkE2HuwhwOZauHMtO7LUFfpDYF2"
];

export const isFirebaseConfigured = () => !Object.values(FIREBASE_CONFIG)
  .some(value => !value || value.includes("REPLACE_WITH"));
