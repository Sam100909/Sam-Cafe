/* =========================================================
   SAM CAFE — SCRIPT
   ========================================================= */

/* ---------- 1. CLIENT CONFIGURATION ----------
   Edit the values below to update site-wide info. */
const SITE_CONFIG = {
  businessName: "Sam Cafe",
  whatsappNumber: "601156797653",   // e.g. "60123456789" (no + or spaces)
  instagramUrl: "https://www.instagram.com/sam.en.9421?igsh=ZzRiYWhqNmZiMXZx&igsi=ZzRiYWhqNmZiMXZx",       // e.g. "https://instagram.com/samcafe"
  address: "Jalan Sabar, Bandar Mersing, Johor, Malaysia",
  whatsappMessage: "Hi Sam Cafe! I found you through your website."
};

/* ---------- 2. MENU DATA ----------
   Edit prices/items here — the menu section renders from this list. */
const MENU_DATA = [
  {
    category: "Coffee",
    key: "coffee",
    items: [
      { name: "Espresso", desc: "Rich and concentrated, single shot.", price: "RM 8" },
      { name: "Americano", desc: "Espresso lengthened with hot water.", price: "RM 9" },
      { name: "Latte", desc: "Espresso with silky steamed milk.", price: "RM 12" },
      { name: "Cappuccino", desc: "Espresso, steamed milk and foam.", price: "RM 12" }
    ]
  },
  {
    category: "Matcha",
    key: "matcha",
    items: [
      { name: "Matcha Latte", desc: "Stone-ground matcha, steamed milk.", price: "RM 14" }
    ]
  },
  {
    category: "Desserts",
    key: "desserts",
    items: [
      { name: "Basque Cheesecake", desc: "Caramelised top, creamy centre.", price: "RM 15" },
      { name: "Tiramisu", desc: "Espresso-soaked layers, cocoa dusted.", price: "RM 15" }
    ]
  },
  {
    category: "Pastries",
    key: "pastries",
    items: [
      { name: "Croissant", desc: "Buttery, flaky, baked fresh daily.", price: "RM 9" }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  setupNavbarScroll();
  setupMobileNav();
  setupSmoothScrollClose();
  setupMenuFilter();
  setupScrollReveal();
  setupContactLinks();
  setupActiveNavLink();
});

/* ---------- 3. RENDER MENU ---------- */
function renderMenu() {
  const list = document.getElementById("menuList");
  if (!list) return;

  let html = "";
  MENU_DATA.forEach(group => {
    html += `<div class="menu__category" data-category="${group.key}">`;
    html += `<h3 class="menu__category-title">${group.category}</h3>`;
    group.items.forEach(item => {
      html += `
        <div class="menu-item" data-category="${group.key}">
          <div>
            <div class="menu-item__name">${item.name}</div>
            <div class="menu-item__desc">${item.desc}</div>
          </div>
          <div class="menu-item__price">${item.price}</div>
        </div>`;
    });
    html += `</div>`;
  });

  list.innerHTML = html;
}

/* ---------- 4. MENU FILTER ---------- */
function setupMenuFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const categories = document.querySelectorAll(".menu__category");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.dataset.filter;

      categories.forEach(cat => {
        const show = filter === "all" || cat.dataset.category === filter;
        cat.style.display = show ? "" : "none";
      });
    });
  });
}

/* ---------- 5. NAVBAR SCROLL STATE ---------- */
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- 6. MOBILE NAV ---------- */
function setupMobileNav() {
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const backdrop = document.getElementById("mobileNavBackdrop");
  if (!toggle || !mobileNav || !backdrop) return;

  const openNav = () => {
    mobileNav.classList.add("is-open");
    backdrop.classList.add("is-open");
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeNav = () => {
    mobileNav.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  backdrop.addEventListener("click", closeNav);

  document.querySelectorAll(".mobile-nav__link").forEach(link => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) closeNav();
  });
}

/* Close mobile menu automatically if the viewport grows back to desktop */
function setupSmoothScrollClose() {
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      const mobileNav = document.getElementById("mobileNav");
      const backdrop = document.getElementById("mobileNavBackdrop");
      const toggle = document.getElementById("navToggle");
      if (mobileNav && mobileNav.classList.contains("is-open")) {
        mobileNav.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    }
  });
}

/* ---------- 7. SCROLL REVEAL ---------- */
function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* ---------- 8. CONTACT LINKS (WhatsApp / Instagram / Directions) ---------- */
function setupContactLinks() {
  const waMessage = encodeURIComponent(SITE_CONFIG.whatsappMessage);
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${waMessage}`;
  const igLink = SITE_CONFIG.instagramUrl;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE_CONFIG.address)}`;

  const whatsappTargets = [document.getElementById("whatsappBtn"), document.getElementById("footerWhatsapp")];
  const instagramTargets = [document.getElementById("instagramBtn"), document.getElementById("footerInstagram")];
  const directionsBtn = document.getElementById("directionsBtn");

  whatsappTargets.forEach(el => { if (el) el.href = waLink; });
  instagramTargets.forEach(el => { if (el) el.href = igLink; });
  if (directionsBtn) directionsBtn.href = directionsLink;
}

/* ---------- 9. ACTIVE NAV LINK ON SCROLL ---------- */
function setupActiveNavLink() {
  const sections = ["home", "menu", "about", "visit"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll(".navbar__link");
  if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.style.opacity = link.getAttribute("href") === `#${entry.target.id}` ? "1" : "";
        });
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px" });

  sections.forEach(sec => observer.observe(sec));
}
