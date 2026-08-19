import { isFirebaseConfigured } from "./firebase-config.js";
import { FALLBACK_MENU_ITEMS } from "./menu-data.js";
import { initCommerce, addToCart, refreshCart } from "./auth-cart.js";
import { initOrders } from "./orders.js";
import { collapseExactMenuDuplicates } from "./menu-duplicates.js";

const SITE_CONFIG = {
  businessName: "Sam Cafe",
  whatsappNumber: "601156797653",
  instagramUrl: "https://www.instagram.com/sam.en.9421?igsh=ZzRiYWhqNmZiMXZx&igsi=ZzRiYWhqNmZiMXZx",
  address: "Jalan Sabar, Bandar Mersing, Johor, Malaysia",
  openingHours: [["Monday – Tuesday", "10:00 AM – 9:00 PM"], ["Wednesday", "Closed"], ["Thursday – Friday", "10:00 AM – 9:00 PM"], ["Saturday – Sunday", "9:00 AM – 10:00 PM"]],
  announcement: { enabled: true, text: "Try our new Matcha Latte — made slow, served fresh." }
};
const REVIEWS = [{ name: "Aina R.", text: "The matcha is beautifully balanced, and the cafe feels wonderfully unhurried." }, { name: "Daniel T.", text: "A lovely little stop in Mersing. Great coffee, warm service and excellent cheesecake." }, { name: "Nurul H.", text: "My favourite place for a quiet catch-up. The staff made our birthday table feel special." }];
let menuById = new Map();

document.addEventListener("DOMContentLoaded", () => {
  renderSiteDetails(); renderReviews(); decorateReveals(); setupNavbarScroll(); setupMobileNav(); setupMenuFilter(); setupScrollReveal(); setupButtonFeedback(); setupContactLinks(); setupActiveNavLink(); setupReservationForm(); initCommerce(id => menuById.get(id)); initOrders(id => menuById.get(id), SITE_CONFIG.whatsappNumber); loadCustomerMenu();
});

async function loadCustomerMenu() {
  if (!isFirebaseConfigured()) { renderFeaturedMenu(renderMenu(FALLBACK_MENU_ITEMS)); return; }
  setMenuState("Loading today’s menu…");
  try {
    const [{ db, firebaseReady }, firestore] = await Promise.all([import("./firebase-service.js"), import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")]);
    if (!firebaseReady || !db) throw new Error("Firebase is not configured.");
    const snapshot = await firestore.getDocs(firestore.query(firestore.collection(db, "menuItems"), firestore.orderBy("sortOrder", "asc")));
    if (snapshot.empty) { renderFeaturedMenu([]); return setMenuState("Our menu is being prepared. Please check back shortly.", "empty"); }
    const items = snapshot.docs.map(item => ({ id: item.id, ...item.data() })); renderFeaturedMenu(renderMenu(items));
  } catch (error) {
    console.warn("Firestore menu unavailable; displaying local fallback.", error);
    renderFeaturedMenu(renderMenu(FALLBACK_MENU_ITEMS));
    setMenuState("We’re showing our current menu while the live menu reconnects.", "notice");
  }
}

function renderMenu(items) {
  const documentItems = items.map((item, index) => ({ ...item, id: item.id || `fallback-${index}` }));
  const { allByDocumentId, items: visibleItems, duplicateGroups } = collapseExactMenuDuplicates(documentItems);
  menuById = allByDocumentId;
  refreshCart();
  const list = document.getElementById("menuList"); if (!list) return;
  setMenuState("");
  const nameCounts = Object.fromEntries(documentItems.reduce((counts, item) => counts.set(item.name || "Untitled item", (counts.get(item.name || "Untitled item") || 0) + 1), new Map()));
  console.info("[Sam Cafe] Full menu payload", { documentCount: documentItems.length, nameCounts, visibleCount: visibleItems.length, suppressedDuplicateDocumentIds: duplicateGroups.flatMap(group => group.duplicates.map(item => item.id)), conflictingDuplicateDocumentIds: duplicateGroups.filter(group => !group.exact).flatMap(group => group.duplicates.map(item => item.id)) });
  const grouped = visibleItems.slice().sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)).reduce((groups, item) => {
    const category = item.category || "Other"; (groups[category] ||= []).push(item); return groups;
  }, {});
  list.innerHTML = Object.entries(grouped).map(([category, menuItems]) => `<section class="menu__category" data-category="${escapeHtml(category.toLowerCase())}" aria-label="${escapeHtml(category)}"><h3 class="menu__category-title">${escapeHtml(category)}</h3>${menuItems.map(renderMenuItem).join("")}</section>`).join("");
  list.onclick = event => { const button = event.target.closest("[data-add-cart]"); if (button) addToCart(button.dataset.addCart); };
  setupMenuFilter();
  return visibleItems;
}

function renderMenuItem(item) {
  const badges = `${item.featured ? '<span class="menu-badge menu-badge--popular">Popular</span>' : ""}${item.available === false ? '<span class="menu-badge menu-badge--soldout">Sold Out</span>' : ""}`;
  const imageUrl = escapeHtml(item.imageUrl || "assets/images/about-cafe-interior.webp");
  const name = escapeHtml(item.name || "Menu item");
  return `<article class="menu-item ${item.available === false ? "is-soldout" : ""}"><div class="menu-item__image-wrap"><img src="${imageUrl}" alt="${name}" loading="lazy" decoding="async" class="menu-item__image" onerror="this.onerror=null;this.src='assets/images/about-cafe-interior.webp';this.alt='Sam Cafe interior';"></div><div class="menu-item__content"><div class="menu-item__name">${name} ${badges}</div><div class="menu-item__desc">${escapeHtml(item.description || "")}</div><div class="menu-item__actions"><button class="add-cart-btn" data-add-cart="${escapeHtml(item.id)}" type="button" ${item.available === false ? "disabled" : ""}>${item.available === false ? "Sold Out" : "Add to cart"}</button></div></div><div class="menu-item__price">${formatPrice(item.price)}</div></article>`;
}
function renderFeaturedMenu(items) {
  const list = document.getElementById("featuredMenuList"); if (!list) return;
  const featured = items.filter(item => item.available !== false && item.featured).slice(0, 4);
  const cards = (featured.length ? featured : items.filter(item => item.available !== false).slice(0, 4));
  list.innerHTML = cards.length ? cards.map(item => `<article class="card reveal"><div class="card__image-wrap"><img src="${escapeHtml(item.imageUrl || "assets/images/about-cafe-interior.webp")}" alt="${escapeHtml(item.name)} at Sam Cafe" loading="lazy" decoding="async" class="card__image" onerror="this.onerror=null;this.src='assets/images/about-cafe-interior.webp';this.alt='Sam Cafe interior';"></div><div class="card__body"><h3 class="card__name">${escapeHtml(item.name)}</h3><p class="card__desc">${escapeHtml(item.description || "")}</p><span class="card__price">${formatPrice(item.price)}</span></div></article>`).join("") : '<p class="menu-state">Favourites will appear here soon.</p>';
  list.querySelectorAll(".reveal").forEach((card, index) => { card.classList.add(index % 2 ? "reveal--right" : "reveal--left"); card.style.setProperty("--reveal-delay", `${index * 70}ms`); });
  setupScrollReveal();
}
function setMenuState(message, type = "") { const state = document.getElementById("menuState"); if (!state) return; state.textContent = message; state.className = `menu-state ${type}`; state.hidden = !message; }
function formatPrice(value) { const amount = Number(value); return Number.isFinite(amount) ? `RM ${amount.toFixed(2)}` : "Price on request"; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }

function renderSiteDetails() {
  const announcement = document.getElementById("announcement"), announcementText = document.getElementById("announcementText");
  if (announcement && announcementText && SITE_CONFIG.announcement.enabled && SITE_CONFIG.announcement.text) { announcementText.textContent = SITE_CONFIG.announcement.text; announcement.hidden = false; }
  const addressText = document.getElementById("addressText"), footerAddress = document.getElementById("footerAddress");
  if (addressText) addressText.innerHTML = SITE_CONFIG.address.replace(/,\s*/g, ",<br>"); if (footerAddress) footerAddress.textContent = SITE_CONFIG.address;
  const map = document.getElementById("locationMap"); if (map) map.src = `https://www.google.com/maps?q=${encodeURIComponent(SITE_CONFIG.address)}&output=embed`;
  const hoursList = document.getElementById("hoursList"), footerHours = document.getElementById("footerHours");
  if (hoursList) hoursList.innerHTML = SITE_CONFIG.openingHours.map(([day, hours]) => `<li><span>${day}</span><span>${hours}</span></li>`).join("");
  if (footerHours) footerHours.innerHTML = SITE_CONFIG.openingHours.map(([day, hours]) => `<p>${day}: ${hours}</p>`).join("");
}
function renderReviews() { const list = document.getElementById("reviewsList"); if (list) list.innerHTML = REVIEWS.map(review => `<article class="review reveal"><p class="review__stars" aria-label="5 out of 5 stars">★★★★★</p><blockquote>“${review.text}”</blockquote><p class="review__name">${review.name}</p></article>`).join(""); }
function setupMenuFilter() { document.querySelectorAll(".filter-btn").forEach(btn => { if (btn.dataset.bound) return; btn.dataset.bound = "true"; btn.addEventListener("click", () => { document.querySelectorAll(".filter-btn").forEach(item => { item.classList.toggle("is-active", item === btn); item.setAttribute("aria-selected", String(item === btn)); }); document.querySelectorAll(".menu__category").forEach(category => { category.hidden = btn.dataset.filter !== "all" && category.dataset.category !== btn.dataset.filter; }); }); }); }
function setupNavbarScroll() { const navbar = document.getElementById("navbar"); if (!navbar) return; const update = () => navbar.classList.toggle("is-scrolled", window.scrollY > 12); update(); window.addEventListener("scroll", update, { passive: true }); }
function setupMobileNav() { const toggle = document.getElementById("navToggle"), nav = document.getElementById("mobileNav"), backdrop = document.getElementById("mobileNavBackdrop"); if (!toggle || !nav || !backdrop) return; const close = () => { nav.classList.remove("is-open"); backdrop.classList.remove("is-open"); toggle.classList.remove("is-active"); toggle.setAttribute("aria-expanded", "false"); nav.setAttribute("aria-hidden", "true"); document.body.classList.remove("nav-open"); }; const open = () => { nav.classList.add("is-open"); backdrop.classList.add("is-open"); toggle.classList.add("is-active"); toggle.setAttribute("aria-expanded", "true"); nav.setAttribute("aria-hidden", "false"); document.body.classList.add("nav-open"); }; toggle.addEventListener("click", () => nav.classList.contains("is-open") ? close() : open()); backdrop.addEventListener("click", close); nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close)); document.addEventListener("keydown", event => { if (event.key === "Escape") close(); }); window.addEventListener("resize", () => { if (window.innerWidth > 860) close(); }); }
function setupScrollReveal() { const items = document.querySelectorAll(".reveal"); if (!items.length) return; if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach(item => item.classList.add("is-visible")); return; } const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12 }); items.forEach(item => observer.observe(item)); }
function decorateReveals() { [".featured__grid .reveal", ".reviews__grid .reveal", ".gallery__grid", ".menu__list", ".reservation"].forEach((selector, groupIndex) => document.querySelectorAll(selector).forEach((item, index) => { if (!item.classList.contains("reveal")) item.classList.add("reveal"); item.classList.add(index % 3 === 0 ? "reveal--left" : index % 3 === 1 ? "reveal--up" : "reveal--right"); item.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 70 + groupIndex * 20}ms`); })); }
function setupButtonFeedback() { document.querySelectorAll(".btn, .filter-btn, .navbar__toggle").forEach(control => { control.addEventListener("pointerdown", () => control.classList.add("is-pressed")); ["pointerup", "pointercancel", "pointerleave"].forEach(event => control.addEventListener(event, () => control.classList.remove("is-pressed"))); }); }
function setupContactLinks() { const message = encodeURIComponent(`Hi ${SITE_CONFIG.businessName}! I found you through your website.`), whatsappLink = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`, directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE_CONFIG.address)}`; ["whatsappBtn", "footerWhatsapp"].forEach(id => { const link = document.getElementById(id); if (link) link.href = whatsappLink; }); ["instagramBtn", "footerInstagram"].forEach(id => { const link = document.getElementById(id); if (link) link.href = SITE_CONFIG.instagramUrl; }); const directions = document.getElementById("directionsBtn"); if (directions) directions.href = directionsLink; }
function setupReservationForm() { const form = document.getElementById("reservationForm"), date = document.getElementById("reservationDate"); if (!form || !date) return; date.min = localDateString(new Date()); form.addEventListener("submit", event => { event.preventDefault(); const reservation = Object.fromEntries(new FormData(form).entries()), error = validateReservation(reservation); if (error) return showReservationStatus(error, true); sendReservationToWhatsApp(reservation); }); }
function validateReservation(reservation) { if (!reservation.name.trim() || !reservation.phone.trim() || !reservation.date || !reservation.time || !reservation.guests) return "Please complete all required fields before reserving."; if (reservation.date < localDateString(new Date())) return "Please select today or a future date."; return ""; }
function sendReservationToWhatsApp(reservation) { const formattedDate = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${reservation.date}T12:00:00`)), formattedTime = new Intl.DateTimeFormat("en-MY", { hour: "numeric", minute: "2-digit" }).format(new Date(`1970-01-01T${reservation.time}:00`)), notes = reservation.notes.trim() || "None", message = `Reservation Request — ${SITE_CONFIG.businessName}\n\nName: ${reservation.name.trim()}\nPhone: ${reservation.phone.trim()}\nDate: ${formattedDate}\nTime: ${formattedTime}\nGuests: ${reservation.guests}\nSpecial Request: ${notes}`; window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener"); showReservationStatus("Your reservation request is ready in WhatsApp.", false); }
function showReservationStatus(message, isError) { const status = document.getElementById("reservationStatus"); if (!status) return; status.textContent = message; status.classList.toggle("is-error", isError); status.hidden = false; }
function localDateString(date) { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }
function setupActiveNavLink() { const sections = ["home", "about", "menu", "gallery", "reservation", "location", "contact"].map(id => document.getElementById(id)).filter(Boolean); if (!("IntersectionObserver" in window)) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) document.querySelectorAll(".navbar__link").forEach(link => link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`)); }), { rootMargin: "-35% 0px -55% 0px" }); sections.forEach(section => observer.observe(section)); }
