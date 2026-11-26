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
  const modal = doc.getElementById("bookingModal");
  const dialog = modal.querySelector(".modal__dialog");
  const modalBody = modal.querySelector(".modal__body");
  const formWrap = doc.getElementById("bookingFormWrap");
  const form = doc.getElementById("bookingForm");
  const success = doc.getElementById("bookingSuccess");
  const successName = doc.getElementById("successName");
  const successTelegram = doc.getElementById("successTelegram");
  const nameInput = doc.getElementById("name");
  const phoneInput = doc.getElementById("phone");
  const serviceSelect = doc.getElementById("service");
  const consent = doc.getElementById("consent");
  const consentLabel = doc.getElementById("consentLabel");
  const consentError = doc.getElementById("consentError");
  const nameField = doc.getElementById("nameField");
  const phoneField = doc.getElementById("phoneField");

  const topbar = doc.querySelector(".topbar");
  const main = doc.getElementById("main");
  const footer = doc.querySelector(".footer");
  const skipLink = doc.querySelector(".skip-link");

  let lastFocused = null;
  let lastMenuTrigger = null;

  /* ---------- Inert background while overlays are open ---------- */
  function refreshInertState() {
    const menuOpen = mobileMenu.classList.contains("is-open");
    const modalOpen = modal.classList.contains("is-open");

    [topbar, header, main, footer, mobileCta, skipLink].forEach((el) => {
      if (el) el.inert = false;
    });
    mobileMenu.inert = !menuOpen;

    if (modalOpen) {
      [topbar, header, main, footer, mobileCta, skipLink, mobileMenu].forEach((el) => {
        if (el) el.inert = true;
      });
      modal.inert = false;
    } else if (menuOpen) {
      [topbar, main, footer, mobileCta, skipLink].forEach((el) => {
        if (el) el.inert = true;
      });
      modal.inert = true;
    } else {
      modal.inert = true;
    }
  }

  /* ---------- Telegram links + footer year ---------- */
  doc.querySelectorAll('a[href^="https://t.me/"]').forEach((link) => {
    link.href = TELEGRAM;
  });

  const yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header / mobile CTA on scroll ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (mobileCta) {
      mobileCta.classList.toggle(
        "is-visible",
        y > 520 && !body.classList.contains("is-locked")
      );
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const isMenuOpen = () => mobileMenu.classList.contains("is-open");

  function openMenu() {
    if (!mobileMenu) return;
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
    }, 350);
  }

  function closeMenu() {
    if (!mobileMenu || !isMenuOpen()) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.inert = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    if (!modal.classList.contains("is-open")) body.classList.remove("is-locked");
    refreshInertState();

    const focusTarget = lastMenuTrigger instanceof HTMLElement ? lastMenuTrigger : burger;
    window.setTimeout(() => {
      if (!modal.classList.contains("is-open") && !isMenuOpen()) {
        focusTarget.focus({ preventScroll: true });
      }
    }, 0);
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
  }

  /* ---------- Booking modal ---------- */
  function getFocusable() {
    return Array.from(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }

  function clearErrors() {
    nameField.classList.remove("is-invalid");
    phoneField.classList.remove("is-invalid");
    consentLabel.classList.remove("is-invalid");
    consentError.hidden = true;
    nameInput.removeAttribute("aria-invalid");
    phoneInput.removeAttribute("aria-invalid");
    consent.removeAttribute("aria-invalid");
  }

  function resetBookingState(service) {
    form.reset();
    clearErrors();
    formWrap.hidden = false;
    success.hidden = true;
    modalBody.scrollTop = 0;

    if (service) {
      const match = Array.from(serviceSelect.options).find(
        (option) => option.value === service
      );
      serviceSelect.value = match ? service : "Другое / нужна помощь с выбором";
    }
  }

  function openBooking(service) {
    lastFocused = doc.activeElement;
    closeMenu();
    resetBookingState(service);
    modal.inert = false;
    modal.classList.add("is-open");
    body.classList.add("is-locked");
    refreshInertState();

    window.setTimeout(() => {
      nameInput.focus({ preventScroll: true });
    }, 380);
  }

  function closeBooking() {
    modal.classList.remove("is-open");
    modal.inert = true;
    if (!isMenuOpen()) body.classList.remove("is-locked");
    refreshInertState();

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  doc.querySelectorAll("[data-booking]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openBooking(trigger.getAttribute("data-service") || "");
    });

    trigger.addEventListener("keydown", (event) => {
      if (trigger.tagName !== "ARTICLE") return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openBooking(trigger.getAttribute("data-service") || "");
      }
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeBooking();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeBooking();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal.classList.contains("is-open")) closeBooking();
    else if (isMenuOpen()) closeMenu();
  });

  /* ---------- Phone mask ---------- */
  function formatPhone(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 5) out += ") " + digits.slice(4, 7);
    if (digits.length >= 8) out += "-" + digits.slice(7, 9);
    if (digits.length >= 10) out += "-" + digits.slice(9, 11);
    return out;
  }

  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value.trim()) phoneInput.value = "+7 (";
  });

  phoneInput.addEventListener("input", () => {
    if (!phoneInput.value.trim()) return;
    phoneInput.value = formatPhone(phoneInput.value);
    phoneField.classList.remove("is-invalid");
    phoneInput.removeAttribute("aria-invalid");
  });

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value === "+7 (" || phoneInput.value === "+7") {
      phoneInput.value = "";
    }
  });

  nameInput.addEventListener("input", () => {
    nameField.classList.remove("is-invalid");
    nameInput.removeAttribute("aria-invalid");
  });

  consent.addEventListener("change", () => {
    if (!consent.checked) return;
    consentLabel.classList.remove("is-invalid");
    consentError.hidden = true;
    consent.removeAttribute("aria-invalid");
  });

  /* ---------- Submit ---------- */
  function validateForm() {
    let isValid = true;

    if (nameInput.value.trim().length < 2) {
      nameField.classList.add("is-invalid");
      nameInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    const digits = phoneInput.value.replace(/\D/g, "");
    if (digits.length !== 11) {
      phoneField.classList.add("is-invalid");
      phoneInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    if (!consent.checked) {
      consentLabel.classList.add("is-invalid");
      consentError.hidden = false;
      consent.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    return isValid;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      const firstInvalid = form.querySelector(".is-invalid input, .is-invalid select");
      if (firstInvalid) firstInvalid.focus({ preventScroll: false });
      return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value;
    const service = serviceSelect.value;
    const timeInput = form.querySelector('input[name="time"]:checked');
    const time = timeInput ? timeInput.value : "Любое время";

    const message =
      "Здравствуйте! Хочу записаться в AURA.\n" +
      "Имя: " + name + "\n" +
      "Телефон: " + phone + "\n" +
      "Услуга: " + service + "\n" +
      "Удобное время: " + time;

    successName.textContent = name;
    successTelegram.href = TELEGRAM + "?text=" + encodeURIComponent(message);

    formWrap.hidden = true;
    success.hidden = false;
    modalBody.scrollTop = 0;

    const heading = success.querySelector("h3");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  });

  doc.getElementById("backToForm").addEventListener("click", () => {
    success.hidden = true;
    formWrap.hidden = false;
    modalBody.scrollTop = 0;
    nameInput.focus({ preventScroll: true });
  });

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
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
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

  /* ---------- Close menu on desktop resize ---------- */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  refreshInertState();
})();
