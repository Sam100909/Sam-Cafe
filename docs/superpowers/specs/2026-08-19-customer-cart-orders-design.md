# Sam Cafe customer cart and WhatsApp orders design

## Goal

Extend the existing Firebase menu system with Google customer sign-in, a persistent personal cart, WhatsApp ordering, customer order history, and administrator order management. Keep the current static HTML/CSS/JavaScript architecture, existing menu fallback, reservation flow, SEO, and administrator menu tools.

## Customer experience

The main navigation gains Account and Cart controls. A signed-out visitor can add available items to a LocalStorage cart. Google sign-in uses the existing Firebase provider. Once signed in, the account control shows the customer avatar and name; its menu offers My Cart, My Orders, and Sign Out.

Cart and order history share a right-side drawer. The cart supports quantity changes from 1 to 20, deletion, clearing, accessible status feedback, subtotal and total. Sold-out items remain visible but cannot be submitted. A guest cart merges into the signed-in user cart only after Firestore writes complete successfully.

Checkout requires sign-in. It re-reads menu items from Firestore, validates availability and quantities, recalculates all money values, collects the required pickup/dine-in fields, writes an order, then opens WhatsApp with the generated order request. A successful WhatsApp launch does not imply confirmation; new orders use `pending_whatsapp`.

## Data model

`users/{uid}/cartItems/{menuItemId}`:

```text
menuItemId: string
quantity: number (1–20)
note: string
updatedAt: timestamp
```

No client-provided price, title, or availability is trusted for checkout. Display data is always reconciled against the current `menuItems` document.

`orders/{orderId}`:

```text
userId: string
customerName: string
phone: string
orderType: "pickup" | "dine_in"
pickupTime: string
tableNumber: string
items: [{ menuItemId, name, price, quantity, subtotal, note }]
total: number
note: string
status: "pending_whatsapp" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
createdAt: timestamp
updatedAt: timestamp
```

Order prices are snapshots derived from current menu documents immediately before the order is created.

## Modules and files

- `auth-cart.js`: Firebase auth state, Google sign-in/out, cart storage selection, LocalStorage-to-Firestore merge, cart reconciliation, and UI events.
- `orders.js`: checkout validation, current-menu revalidation, order creation, WhatsApp message creation, and customer order queries.
- `script.js`: retain existing site behavior; integrate public menu Add to cart controls and initialize the new modules.
- `index.html` and `style.css`: add account/cart controls, drawer views and checkout form while preserving current visual language.
- `admin.html`, `admin.css`, `admin.js`: add an Orders view, filters, detail display, and controlled status updates while retaining the existing menu view.
- `firestore.rules`: extend the existing admin/menu rules for carts and orders.
- `README.md`: document collections, rules deployment, testing and Firebase Console prerequisites.

## Rules model

Public users retain read-only access to `menuItems`; only the existing administrator UID writes them. A signed-in user reads and writes only `users/{uid}/cartItems/*` where `uid == request.auth.uid`, with allowed fields and quantity limits enforced.

Users may read only orders where `resource.data.userId == request.auth.uid`. They can create only documents where `request.resource.data.userId == request.auth.uid`, the status is `pending_whatsapp`, values meet type/shape constraints, and the initial server timestamps are present. They cannot update or delete orders. The existing administrator UID may read all orders and update only permitted order status/metadata, without altering payment-relevant order content.

## Error handling and boundaries

- No Firebase configuration or Firestore failure: use the current static menu fallback and guest LocalStorage cart; disable checkout with an explanation.
- Failed cart merge: retain the guest cart and show an error.
- Failed order write: preserve the cart and do not open WhatsApp.
- Auth sign-out: clear private cart/order state from memory and show only the local guest cart.
- There is no payment collection, password storage, service account, Admin SDK, or privileged server secret.

## Verification

Check static fallback, guest cart persistence, authenticated merge, sign-out isolation, quantity limits, stale price refresh, sold-out blocking, required checkout fields, order creation failure behavior, order history, administrator status changes, rules deployment, mobile drawer layout, and existing reservation/navigation behavior. Browser console testing uses a local HTTP server after Firebase Console setup.
