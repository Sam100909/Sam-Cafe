import { collection, getDocs, limit, serverTimestamp, writeBatch, doc, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-service.js";
import { FALLBACK_MENU_ITEMS } from "./menu-data.js";

export async function seedInitialMenu() {
  if (!firebaseReady || !db) throw new Error("Firebase is not configured.");
  const existing = await getDocs(query(collection(db, "menuItems"), limit(1)));
  if (!existing.empty) throw new Error("menuItems already contains data. Import was skipped to prevent duplicates.");

  const batch = writeBatch(db);
  FALLBACK_MENU_ITEMS.forEach((item, index) => {
    batch.set(doc(collection(db, "menuItems")), { ...item, sortOrder: item.sortOrder ?? (index + 1) * 10, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  await batch.commit();
  return FALLBACK_MENU_ITEMS.length;
}
