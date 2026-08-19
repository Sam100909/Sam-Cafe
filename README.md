# Sam Cafe

A lightweight static cafe website for GitHub Pages. It uses plain HTML, CSS and browser ES modules. Firebase is optional for visitors: before configuration, the menu stays available from the local fallback data.

## What Firebase does

- `menuItems` in Cloud Firestore is the live customer menu.
- Google Authentication identifies staff.
- `admin.html` lets approved staff add, edit, delete, reorder, mark sold out, and mark popular menu items.
- `firebase-config.js` is the only place for public Firebase Web App identifiers and the client-side staff UID list.

Firebase Web App configuration is safe to publish. **Never put a Service Account JSON file, Admin SDK private key, or any server secret in this repository.** Real security is enforced by `firestore.rules`, not by hiding `admin.html`.

## First-time Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Project settings → Your apps**, add a **Web app**. Copy the `firebaseConfig` values Firebase gives you.
3. Open `firebase-config.js` and replace every `REPLACE_WITH_…` value in `FIREBASE_CONFIG`. Do not change the object property names.
4. In **Build → Authentication → Sign-in method**, enable **Google** and choose a support email.
5. In **Build → Firestore Database**, create a database in Production mode and choose your preferred region.
6. In **Authentication → Settings → Authorized domains**, add your GitHub Pages hostname (for example `your-name.github.io`). `localhost` is normally already allowed for local testing.

## Add the administrator UID

1. Open **Authentication → Users** in Firebase Console.
2. Sign in once at `admin.html` with the intended Google account. It will be rejected initially; that is expected.
3. Return to **Authentication → Users**, open that user and copy its **User UID**.
4. Replace `REPLACE_WITH_ADMIN_UID` in the `ADMIN_UIDS` list in `firebase-config.js` with the UID. Add more quoted UIDs if needed.
5. Replace the same `REPLACE_WITH_ADMIN_UID` in `firestore.rules`. The client UID list improves user experience; the Firestore rule is the protection that matters.

## Deploy Firestore rules

In Firebase Console, open **Firestore Database → Rules**, replace the editor contents with `firestore.rules`, replace the UID placeholder, then click **Publish**.

The supplied rules mean:

- Anyone may read `/menuItems` (the public cafe menu).
- Only signed-in users whose UID is explicitly listed may create, update, or delete menu items.

For Firebase CLI users, run `firebase init firestore`, set the rules file to `firestore.rules`, then run `firebase deploy --only firestore:rules` from this folder after logging in. Do not deploy until you have replaced the UID placeholder.

## Import the current menu once

1. Complete Firebase setup and rules first.
2. Visit `admin.html` locally or on your deployed site and sign in using the approved administrator account.
3. Click **Import starter menu** and confirm.

The import adds the existing Sam Cafe menu from `menu-data.js` with `createdAt`, `updatedAt`, price, availability, featured state and `sortOrder`. It only runs when `menuItems` is empty; if any item exists, it stops instead of duplicating data.

After import, the customer menu automatically reads Firestore. You can then manage all items in `admin.html`.

## Apply the local menu images once

The starter menu already uses local WebP files under `assets/menu/`. Existing Firestore documents retain their previous `imageUrl` until you perform this separate migration:

1. Open `admin.html` over a local static server or your GitHub Pages site and sign in with the approved administrator Google account.
2. In **All menu items**, select **Update menu images**.
3. Read the confirmation and choose **OK**. The tool matches only the exact existing menu names and writes their local `assets/menu/*.webp` path.
4. Read the result message. It reports updated items, rows already current, and any unmatched custom names.

It does not change price, category, availability, featured state, sort order, description, or `createdAt`; `updatedAt` changes only as the normal Firestore audit timestamp. It is safe to run again: already-migrated paths are skipped, so there are no duplicate writes. Custom menu names are intentionally left untouched.

## Image and Open Graph notes

- All site and starter-menu photos are local WebP files; their source pages and photographers are listed in `IMAGE-CREDITS.md`.
- The `og:image` tag uses `https://sam100909.github.io/Sam-Cafe/assets/images/hero-cafe-interior.webp`, not a relative URL. Update it if the GitHub account or repository path changes before redeploying.

## Menu item schema

Every document in `menuItems` uses:

```text
name, description, price, category, imageUrl,
available, featured, sortOrder, createdAt, updatedAt
```

Prices are stored as numbers (for example `12`) and presented as `RM 12.00`. The provided categories include Coffee, Tea, Matcha, Desserts and Pastries.

## Local testing

Use any static server from this folder; do not open `index.html` directly because browser modules and Firebase need an HTTP origin. For example, with Node installed:

```powershell
npx serve .
```

Open the local address it prints, then test:

- Customer menu loading and category filters.
- Firebase disabled fallback (temporarily leave placeholders in `firebase-config.js`).
- Google sign-in and rejection of an unlisted UID.
- Add, edit, delete, sold-out, popular and order changes in `admin.html`.
- Reservation form, WhatsApp link, mobile menu, map and footer links.

## GitHub Pages redeploy

Commit the changed files and push through your normal GitHub Pages workflow. Paths are relative and do not require a build step. Before publishing, ensure your GitHub Pages hostname is listed in Firebase Authentication’s Authorized domains.

## Files of interest

- `firebase-config.js` — public Firebase identifiers and client administrator UIDs.
- `firebase-service.js` — modular Firebase app/auth/firestore initialization.
- `menu-data.js` — fallback menu and seed source.
- `seed-menu.js` — duplicate-safe one-time importer used only by the approved admin page.
- `firestore.rules` — production Firestore security rules.
- `admin.html`, `admin.css`, `admin.js` — staff menu manager.

## Customer carts and WhatsApp orders

Visitors can add available menu items to a browser-only cart. After Google sign-in, that cart is merged into `users/{uid}/cartItems/{menuItemId}`; the browser copy is cleared only after the Firestore write succeeds. Cart documents contain only the item ID, quantity (1–20), optional note and timestamp. Prices are always re-read from `menuItems` before an order is created.

Orders are stored in `orders/{orderId}` with a user ID, customer details, item snapshots, total, status and timestamps. Each new order also receives a customer-facing `orderCode` such as `SC-20260819-A7K3`; Firestore's document ID remains the internal database ID and is not shown to customers. Older records without an order code display `Legacy Order` plus the final six characters of their internal ID. New orders are `pending_whatsapp`; creating one opens a prefilled WhatsApp message but does not mean the cafe has confirmed it. Customers can only read their own orders. The approved administrator can view all orders and change only their workflow status in `admin.html`.

After replacing `firestore.rules`, publish it again in Firebase Console. Test guest cart persistence, Google sign-in merge, sign-out isolation, sold-out items, price changes, checkout validation, My Orders and admin status updates. Firebase Authentication with Google must remain enabled and your deployed domain must remain an Authorized domain.
