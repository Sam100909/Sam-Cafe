import { collection, getDocs, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady, isAdmin } from "./firebase-service.js";
import { MENU_IMAGE_PATHS } from "./menu-images.js";

// Safe to run more than once: rows already pointing to their local image are skipped.
export async function updateMenuImages() {
  if (!firebaseReady || !db || !isAdmin(auth?.currentUser)) throw new Error("Administrator access is required to update menu images.");
  const result = { updated: [], skipped: [], unmatched: [] };
  const snapshot = await getDocs(collection(db, "menuItems"));
  for (const item of snapshot.docs) {
    const name = item.data().name, imageUrl = MENU_IMAGE_PATHS[name];
    if (!imageUrl) { result.unmatched.push(name || item.id); continue; }
    if (item.data().imageUrl === imageUrl) { result.skipped.push(name); continue; }
    // imageUrl is the only menu field changed; updatedAt remains the normal audit stamp.
    await updateDoc(item.ref, { imageUrl, updatedAt: serverTimestamp() });
    result.updated.push(name);
  }
  return result;
}
