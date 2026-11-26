(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const TELEGRAM = body.dataset.telegram || "https://t.me/aura_beauty_demo";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = doc.getElementById("header");
  const mobileCta = doc.getElementById("mobileCta");
  const burger = doc.querySelector(".burger");
  const mobileMenu = doc.getElementById("mobileMenu");
  const main = doc.getElementById("main");
  const footer = doc.querySelector(".footer");
  const skipLink = doc.querySelector(".skip-link");

  /* ---------- Links and year ---------- */
  doc.querySelectorAll('a[href^="https://t.me/"]').forEach((link) => {
    link.href = TELEGRAM;
  });

  const yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header / mobile CTA ---------- */
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
    if (mobileCta) {
      mobileCta.classList.toggle(
        "is-visible",
        window.scrollY > 520 && !body.classList.contains("is-locked")
      );
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const isMenuOpen = () => !!mobileMenu && mobileMenu.classList.contains("is-open");
  let lastMenuTrigger = null;

  function refreshInertState() {
    if (!mobileMenu) return;
    const menuOpen = isMenuOpen();
    mobileMenu.inert = !menuOpen;
    [main, footer, mobileCta, skipLink].forEach((el) => {
      if (el) el.inert = menuOpen;
    });
  }

  function openMenu() {
    if (!mobileMenu || !burger) return;
    lastMenuTrigger = doc.activeElement;
    mobileMenu.inert = false;
    mobileMenu.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    body.classList.add("is-locked");
    refreshInertState();

    window.setTimeout(() => {
      if (!isMenuOpen()) return;
      const firstLink = mobileMenu.querySelector(".mobile-menu__link");
      if (firstLink) firstLink.focus({ preventScroll: true });
    }, 320);
  }

  function closeMenu() {
    if (!mobileMenu || !isMenuOpen()) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.inert = true;
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    }
    body.classList.remove("is-locked");
    refreshInertState();

    const focusTarget = lastMenuTrigger instanceof HTMLElement ? lastMenuTrigger : burger;
    if (focusTarget) {
      window.setTimeout(() => {
        if (!isMenuOpen()) focusTarget.focus({ preventScroll: true });
      }, 0);
    }
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const headerLogo = doc.querySelector("#header .logo");
    if (headerLogo) headerLogo.addEventListener("click", closeMenu);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080) closeMenu();
    });
  }

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) closeMenu();
  });

  refreshInertState();

  /* ---------- Reveal on scroll ---------- */
  const revealItems = doc.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Scroll spy ---------- */
  const navLinks = Array.from(doc.querySelectorAll(".nav__link"));
  const spySections = navLinks
    .map((link) => doc.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && spySections.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    spySections.forEach((section) => spyObserver.observe(section));
  }
})();
