(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const TELEGRAM = body.dataset.telegram || "https://t.me/aura_beauty_demo";

  const services = [
    {
      id: "consultation",
      cat: "consultation",
      title: "Консультация косметолога",
      desc: "Осмотр кожи, план ухода и подбор процедуры",
      duration: 30,
      price: 0,
      oldPrice: 2500
    },
    {
      id: "cleaning",
      cat: "face",
      title: "Чистка лица",
      desc: "Комбинированная или механическая чистка",
      duration: 60,
      price: 5500
    },
    {
      id: "peeling",
      cat: "face",
      title: "Пилинг",
      desc: "Энзимный или кислотный пилинг",
      duration: 45,
      price: 4800
    },
    {
      id: "care",
      cat: "face",
      title: "Уход для лица",
      desc: "Увлажнение, питание и восстановление кожи",
      duration: 60,
      price: 4200
    },
    {
      id: "injection",
      cat: "injection",
      title: "Инъекционная косметология",
      desc: "Биоревитализация, ботулинотерапия, контурная пластика",
      duration: 60,
      price: 6900
    },
    {
      id: "biorev",
      cat: "injection",
      title: "Биоревитализация",
      desc: "Препараты на основе гиалуроновой кислоты",
      duration: 60,
      price: 12900
    },
    {
      id: "laser",
      cat: "laser",
      title: "Лазерная эпиляция · 6 зон",
      desc: "Диодный лазер с охлаждением",
      duration: 60,
      price: 4900,
      oldPrice: 7800
    },
    {
      id: "rf",
      cat: "hardware",
      title: "RF-лифтинг",
      desc: "Аппаратная методика для тонуса кожи",
      duration: 60,
      price: 7500
    },
    {
      id: "hardware",
      cat: "hardware",
      title: "Аппаратная косметология",
      desc: "Микротоки и аппаратные методики",
      duration: 45,
      price: 3800
    },
    {
      id: "certificate",
      cat: "gift",
      title: "Подарочный сертификат",
      desc: "Номинал от 5 000 ₽, действует 12 месяцев",
      duration: 0,
      price: 5000
    }
  ];

  const categories = [
    { id: "all", label: "Все" },
    { id: "consultation", label: "Консультации" },
    { id: "face", label: "Лицо" },
    { id: "injection", label: "Инъекции" },
    { id: "hardware", label: "Аппаратные" },
    { id: "laser", label: "Эпиляция" },
    { id: "gift", label: "Сертификаты" }
  ];

  const specialists = [
    { id: "any", label: "Любой специалист" },
    { id: "anna", label: "Анна Верещагина" },
    { id: "maria", label: "Мария Соколова" },
    { id: "elena", label: "Елена Смирнова" }
  ];

  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const monthsShort = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const monthsFull = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

  const state = {
    step: 1,
    category: "all",
    selected: new Set(),
    specialist: "any",
    date: null,
    time: null
  };

  const dates = buildDates();

  const picker = doc.getElementById("servicePicker");
  const tabs = doc.getElementById("categoryTabs");
  const specialistsEl = doc.getElementById("specialists");
  const dateStrip = doc.getElementById("dateStrip");
  const timeGrid = doc.getElementById("timeGrid");
  const timeHint = doc.getElementById("timeHint");
  const stepsEl = doc.getElementById("steps");
  const layout = doc.getElementById("bookingLayout");
  const page = doc.querySelector(".booking-page");
  const summaryServices = doc.getElementById("summaryServices");
  const summaryCount = doc.getElementById("summaryCount");
  const summaryTotal = doc.getElementById("summaryTotal");
  const summaryInfo = doc.getElementById("summaryInfo");
  const summaryNext = doc.getElementById("summaryNext");
  const mobileCount = doc.getElementById("mobileCount");
  const mobileTotal = doc.getElementById("mobileTotal");
  const form = doc.getElementById("bookingForm");
  const nameInput = doc.getElementById("name");
  const phoneInput = doc.getElementById("phone");
  const commentInput = doc.getElementById("comment");
  const consent = doc.getElementById("consent");
  const consentLabel = doc.getElementById("consentLabel");
  const consentError = doc.getElementById("consentError");
  const nameField = doc.getElementById("nameField");
  const phoneField = doc.getElementById("phoneField");
  const successSummary = doc.getElementById("successSummary");
  const successTelegram = doc.getElementById("successTelegram");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  function buildDates() {
    const result = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = 1; i <= 14; i += 1) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
      result.push({
        iso,
        weekday: weekdays[d.getDay()],
        day: d.getDate(),
        month: monthsShort[d.getMonth()],
        monthFull: monthsFull[d.getMonth()],
        year: d.getFullYear(),
        index: i
      });
    }
    return result;
  }

  const priceFmt = new Intl.NumberFormat("ru-RU");

  function formatPrice(value) {
    return priceFmt.format(value) + " ₽";
  }

  function plural(number, forms) {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  function getSelected() {
    return services.filter((s) => state.selected.has(s.id));
  }

  function totalPrice() {
    return getSelected().reduce((sum, s) => sum + s.price, 0);
  }

  function findDate(iso) {
    return dates.find((d) => d.iso === iso) || null;
  }

  function longDate(date) {
    return date.day + " " + date.monthFull + " " + date.year;
  }

  function specialistLabel() {
    return specialists.find((s) => s.id === state.specialist)?.label || "Любой специалист";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function arrowIcon() {
    return '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
  }

  /* ---------- Categories ---------- */
  function renderCategories() {
    tabs.innerHTML = categories.map((cat) => (
      '<button class="btab' + (state.category === cat.id ? " is-active" : "") +
      '" type="button" data-cat="' + cat.id + '" aria-pressed="' +
      (state.category === cat.id ? "true" : "false") + '">' + cat.label + "</button>"
    )).join("");
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cat]");
    if (!button) return;
    state.category = button.getAttribute("data-cat");
    renderCategories();
    renderServices();
  });

  /* ---------- Services ---------- */
  function renderServices() {
    const list = state.category === "all"
      ? services
      : services.filter((service) => service.cat === state.category);

    picker.innerHTML = list.map((service) => {
      const checked = state.selected.has(service.id);
      const oldPrice = service.oldPrice
        ? '<s>' + formatPrice(service.oldPrice) + "</s>"
        : "";
      return (
        '<div class="pick">' +
          '<input class="pick__input" type="checkbox" id="pick-' + service.id +
          '" value="' + service.id + '"' + (checked ? " checked" : "") + ">" +
          '<label class="pick__label" for="pick-' + service.id + '">' +
            '<span class="pick__check" aria-hidden="true"></span>' +
            '<span class="pick__content">' +
              "<strong>" + service.title + "</strong>" +
              "<span>" + service.desc + "</span>" +
            "</span>" +
            '<span class="pick__meta">' + (service.duration ? service.duration + " мин" : "—") + "</span>" +
            '<span class="pick__price">' + formatPrice(service.price) + oldPrice + "</span>" +
          "</label>" +
        "</div>"
      );
    }).join("");
  }

  picker.addEventListener("change", (event) => {
    const input = event.target.closest(".pick__input");
    if (!input) return;
    if (input.checked) state.selected.add(input.value);
    else state.selected.delete(input.value);
    updateSummary();
  });

  /* ---------- Specialists ---------- */
  function renderSpecialists() {
    specialistsEl.innerHTML = specialists.map((specialist) => (
      '<button class="spec' + (state.specialist === specialist.id ? " is-active" : "") +
      '" type="button" data-spec="' + specialist.id + '" aria-pressed="' +
      (state.specialist === specialist.id ? "true" : "false") + '">' +
      specialist.label + "</button>"
    )).join("");
  }

  specialistsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-spec]");
    if (!button) return;
    state.specialist = button.getAttribute("data-spec");
    renderSpecialists();
    updateSummary();
  });

  /* ---------- Dates ---------- */
  function ensureDate() {
    if (!state.date) state.date = dates[0].iso;
  }

  function renderDates() {
    ensureDate();
    dateStrip.innerHTML = dates.map((date) => (
      '<button class="date' + (state.date === date.iso ? " is-active" : "") +
      '" type="button" data-date="' + date.iso + '" aria-pressed="' +
      (state.date === date.iso ? "true" : "false") + '">' +
        "<span>" + date.weekday + "</span>" +
        "<strong>" + date.day + "</strong>" +
        "<span>" + date.month + "</span>" +
      "</button>"
    )).join("");
  }

  dateStrip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    const iso = button.getAttribute("data-date");
    if (state.date === iso) return;
    state.date = iso;
    state.time = null;
    renderDates();
    renderTimes();
    updateSummary();
  });

  /* ---------- Time ---------- */
  function buildSlots() {
    const slots = [];
    for (let minutes = 10 * 60; minutes <= 20 * 60 + 30; minutes += 30) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
    }
    return slots;
  }

  const timeSlots = buildSlots();

  function renderTimes() {
    const date = findDate(state.date);
    if (!date) {
      timeGrid.innerHTML = "";
      timeHint.textContent = "Сначала выберите дату.";
      return;
    }

    timeGrid.innerHTML = timeSlots.map((time, index) => {
      const disabled = (index + date.index * 2) % 9 === 0;
      const active = state.time === time;
      return '<button class="time' + (active ? " is-active" : "") +
        '" type="button" data-time="' + time + '"' +
        (disabled ? " disabled aria-disabled=\"true\"" : "") +
        ' aria-pressed="' + (active ? "true" : "false") + '">' + time + "</button>";
    }).join("");

    timeHint.textContent = state.time
      ? "Выбрано: " + state.time
      : "Выберите свободное время.";
  }

  timeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-time]");
    if (!button || button.disabled) return;
    state.time = button.getAttribute("data-time");
    renderTimes();
    updateSummary();
  });

  /* ---------- Summary ---------- */
  function updateSummary() {
    const selected = getSelected();
    const count = selected.length;
    const total = totalPrice();
    const countText = count + " " + plural(count, ["услуга", "услуги", "услуг"]);

    summaryCount.textContent = countText;
    mobileCount.textContent = countText;
    summaryTotal.textContent = formatPrice(total);
    mobileTotal.textContent = formatPrice(total);

    if (!count) {
      summaryServices.innerHTML = '<p class="bsummary__empty">Услуги не выбраны</p>';
    } else {
      summaryServices.innerHTML = selected.map((service) => (
        '<div class="bsummary__service"><span>' + service.title + "</span><span>" +
        formatPrice(service.price) + "</span></div>"
      )).join("");
    }

    const date = findDate(state.date);
    if (date && state.time) {
      summaryInfo.hidden = false;
      summaryInfo.innerHTML =
        "<span><strong>" + longDate(date) + "</strong></span>" +
        "<span>Время: <strong>" + state.time + "</strong></span>" +
        "<span>Специалист: <strong>" + specialistLabel() + "</strong></span>";
    } else if (date && state.step >= 2) {
      summaryInfo.hidden = false;
      summaryInfo.innerHTML =
        "<span><strong>" + longDate(date) + "</strong></span>" +
        "<span>Время не выбрано</span>" +
        "<span>Специалист: <strong>" + specialistLabel() + "</strong></span>";
    } else {
      summaryInfo.hidden = true;
      summaryInfo.innerHTML = "";
    }

    if (state.step === 1) {
      summaryNext.disabled = count === 0;
      summaryNext.innerHTML = "Выбрать время " + arrowIcon();
    } else if (state.step === 2) {
      summaryNext.disabled = !state.time;
      summaryNext.innerHTML = "Перейти к контактам " + arrowIcon();
    } else if (state.step === 3) {
      summaryNext.disabled = false;
      summaryNext.innerHTML = "Подтвердить запись " + arrowIcon();
    }
  }

  /* ---------- Steps ---------- */
  function showStep(step) {
    const previous = state.step;
    state.step = step;

    doc.querySelectorAll(".bstep").forEach((panel) => {
      const panelStep = Number(panel.getAttribute("data-step"));
      const active = panelStep === step;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });

    if (stepsEl) {
      stepsEl.querySelectorAll(".step").forEach((item) => {
        const itemStep = Number(item.getAttribute("data-step"));
        item.classList.toggle("is-active", itemStep === step);
        item.classList.toggle("is-done", step === 4 || itemStep < step);
        if (itemStep === step) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
    }

    if (page) page.classList.toggle("is-complete", step === 4);
    updateSummary();

    if (step === 2) {
      ensureDate();
      renderDates();
      renderTimes();
      updateSummary();
    }

    const activePanel = doc.querySelector('.bstep[data-step="' + step + '"]');
    if (activePanel) {
      const heading = activePanel.querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        window.setTimeout(() => heading.focus({ preventScroll: true }), 80);
      }
    }

    if (layout) {
      const top = layout.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    }

    if (step === 3) {
      window.setTimeout(() => nameInput.focus({ preventScroll: true }), 420);
    }

    void previous;
  }

  doc.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      showStep(Number(button.getAttribute("data-back")));
    });
  });

  summaryNext.addEventListener("click", () => {
    if (state.step === 1) {
      if (!state.selected.size) return;
      showStep(2);
    } else if (state.step === 2) {
      if (!state.time) return;
      showStep(3);
    } else if (state.step === 3) {
      form.requestSubmit();
    }
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
    let valid = true;

    if (nameInput.value.trim().length < 2) {
      nameField.classList.add("is-invalid");
      nameInput.setAttribute("aria-invalid", "true");
      valid = false;
    }

    if (phoneInput.value.replace(/\D/g, "").length !== 11) {
      phoneField.classList.add("is-invalid");
      phoneInput.setAttribute("aria-invalid", "true");
      valid = false;
    }

    if (!consent.checked) {
      consentLabel.classList.add("is-invalid");
      consentError.hidden = false;
      consent.setAttribute("aria-invalid", "true");
      valid = false;
    }

    return valid;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.selected.size) {
      showStep(1);
      return;
    }

    const date = findDate(state.date);
    if (!date || !state.time) {
      showStep(2);
      return;
    }

    if (!validateForm()) {
      const invalid = form.querySelector(".is-invalid input");
      if (invalid) invalid.focus();
      return;
    }

    const selected = getSelected();
    const total = totalPrice();
    const name = nameInput.value.trim();
    const phone = phoneInput.value;
    const comment = commentInput.value.trim();
    const specialist = specialistLabel();
    const dateText = longDate(date);

    const message =
      "Здравствуйте! Хочу записаться в AURA.\n" +
      "Услуги: " + selected.map((s) => s.title).join("; ") + "\n" +
      "Сумма: " + formatPrice(total) + "\n" +
      "Дата: " + dateText + "\n" +
      "Время: " + state.time + "\n" +
      "Специалист: " + specialist + "\n" +
      "Имя: " + name + "\n" +
      "Телефон: " + phone +
      (comment ? "\nКомментарий: " + comment : "");

    successTelegram.href = TELEGRAM + "?text=" + encodeURIComponent(message);

    successSummary.innerHTML =
      "<span><strong>" + selected.map((s) => escapeHtml(s.title)).join(" · ") + "</strong></span>" +
      "<span>Дата и время: <strong>" + escapeHtml(dateText) + ", " + escapeHtml(state.time) + "</strong></span>" +
      "<span>Специалист: <strong>" + escapeHtml(specialist) + "</strong></span>" +
      "<span>Сумма: <strong>" + formatPrice(total) + "</strong></span>" +
      "<span>Контакт: <strong>" + escapeHtml(name) + " · " + escapeHtml(phone) + "</strong></span>" +
      (comment ? "<span>Комментарий: " + escapeHtml(comment) + "</span>" : "");

    showStep(4);
    const heading = doc.querySelector('.bstep[data-step="4"] h2');
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      window.setTimeout(() => heading.focus({ preventScroll: true }), 90);
    }
  });

  /* ---------- URL params ---------- */
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get("service");
  const requestedSpecialist = params.get("specialist");

  if (requestedService && services.some((s) => s.id === requestedService)) {
    state.selected.add(requestedService);
  }
  if (requestedSpecialist && specialists.some((s) => s.id === requestedSpecialist)) {
    state.specialist = requestedSpecialist;
  }

  /* ---------- Init ---------- */
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", "Услуги");
  renderCategories();
  renderServices();
  renderSpecialists();
  ensureDate();
  renderDates();
  renderTimes();
  updateSummary();
})();
