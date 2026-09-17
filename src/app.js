(() => {
  let currentLang = 'ru';
  let tripType = 'oneway';
  let pax = { adults: 1, children: 0, infants: 0 };
  let activeSuggestField = null;
  let selectedFrom = null;
  let selectedTo = null;

  // ── DOM refs ────────────────────────────────────────────────
  const inputFrom       = document.getElementById('inputFrom');
  const inputTo         = document.getElementById('inputTo');
  const suggestFrom     = document.getElementById('suggestFrom');
  const suggestTo       = document.getElementById('suggestTo');
  const swapBtn         = document.getElementById('swapBtn');
  const searchForm      = document.getElementById('searchForm');
  const fieldDateBack   = document.getElementById('fieldDateBack');
  const inputDateOut    = document.getElementById('inputDateOut');
  const inputDateBack   = document.getElementById('inputDateBack');
  const passengersBtn   = document.getElementById('passengersBtn');
  const passengersPopover = document.getElementById('passengersPopover');
  const inputClass      = document.getElementById('inputClass');
  const directOnly      = document.getElementById('directOnly');
  const langSwitch      = document.getElementById('langSwitch');
  const routesScroller  = document.getElementById('routesScroller');
  const hostelsGrid     = document.getElementById('hostelsGrid');
  const infoGrid        = document.getElementById('infoGrid');
  const promoCopyBtn    = document.getElementById('promoCopyBtn');
  const promoCode       = document.getElementById('promoCode');
  const heroArt         = document.getElementById('heroArt');

  // ── SVG illustrations ──────────────────────────────────────────
  const HERO_ILLUSTRATION = `
    <svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="170" cy="230" rx="140" ry="14" fill="#ffffff" opacity=".08"/>
      <path d="M40 120 Q170 40 300 110" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 8" fill="none"/>
      <g transform="translate(210,60) rotate(35)">
        <path d="M0 10 L44 0 L52 6 L14 20 L10 34 L2 34 L4 20 Z" fill="#ffffff"/>
        <path d="M8 22 L-6 30 L-2 34 L10 30 Z" fill="#ffffff" opacity=".7"/>
      </g>
      <g transform="translate(70,90)">
        <circle cx="30" cy="14" r="13" fill="#ffd8ad"/>
        <path d="M12 30 Q30 18 48 30 L48 100 L12 100 Z" fill="#2f8f6f"/>
        <rect x="10" y="55" width="18" height="45" rx="6" fill="#ff8a3d"/>
        <rect x="14" y="60" width="10" height="4" rx="1" fill="#ffffff" opacity=".7"/>
        <path d="M46 45 L66 40 L68 70 L48 78 Z" fill="#4a30d4"/>
        <rect x="52" y="50" width="10" height="3" fill="#ffffff" opacity=".5"/>
      </g>
      <circle cx="270" cy="170" r="4" fill="#ffffff" opacity=".5"/>
      <circle cx="250" cy="190" r="3" fill="#ffffff" opacity=".4"/>
      <circle cx="290" cy="200" r="2.5" fill="#ffffff" opacity=".4"/>
    </svg>`;

  const PROMO_ILLUSTRATION = `
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="100" fill="#ffffff"/>
      <path d="M40 130 Q110 60 190 120" stroke="#ffffff" stroke-width="3" fill="none" stroke-dasharray="4 10"/>
      <g transform="translate(120,60) rotate(40)">
        <path d="M0 8 L36 0 L42 5 L12 16 L8 28 L2 28 L4 16 Z" fill="#ffffff"/>
      </g>
    </svg>`;

  const FOOTER_ILLUSTRATION = `
    <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 140 Q130 40 240 130" stroke="#ffffff" stroke-width="3" fill="none" stroke-dasharray="6 10"/>
      <g transform="translate(150,70) rotate(35)">
        <path d="M0 12 L54 0 L64 8 L18 24 L12 40 L2 40 L4 24 Z" fill="#ffffff"/>
      </g>
      <circle cx="60" cy="180" r="30" fill="#ffffff"/>
    </svg>`;

  // Стилизованные "фото"-сцены комнат — до появления реальных фотографий отелей.
  const ROOM_PALETTES = [
    { wallA: '#efe9ff', wallB: '#d9ceff', accent: '#5b40e8', linen: '#ffffff', linenShade: '#e4dcff' },
    { wallA: '#fff1e4', wallB: '#ffdcb8', accent: '#ff8a3d', linen: '#ffffff', linenShade: '#ffe6cc' },
    { wallA: '#e6f7f0', wallB: '#c7ecdc', accent: '#2f8f6f', linen: '#ffffff', linenShade: '#d7f2e6' },
    { wallA: '#eaf1ff', wallB: '#cfe0ff', accent: '#3b6fd4', linen: '#ffffff', linenShade: '#dce9ff' },
  ];

  function hostelIcon(seed) {
    const p = ROOM_PALETTES[seed % ROOM_PALETTES.length];
    const variant = seed % 2;
    return `
      <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wall${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${p.wallA}"/>
            <stop offset="100%" stop-color="${p.wallB}"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="240" height="140" fill="url(#wall${seed})"/>
        <!-- окно с видом -->
        <rect x="24" y="18" width="72" height="60" rx="4" fill="#ffffff" opacity=".55"/>
        <rect x="30" y="24" width="60" height="48" rx="2" fill="${p.accent}" opacity=".18"/>
        <line x1="60" y1="24" x2="60" y2="72" stroke="#ffffff" stroke-width="2" opacity=".6"/>
        <line x1="30" y1="48" x2="90" y2="48" stroke="#ffffff" stroke-width="2" opacity=".6"/>
        <circle cx="76" cy="36" r="6" fill="#ffd8ad" opacity=".9"/>
        ${variant === 0
          ? `<path d="M34 68 L48 52 L62 68 Z" fill="${p.accent}" opacity=".5"/>`
          : `<path d="M34 68 L44 58 L54 68 Z M56 68 L70 48 L84 68 Z" fill="${p.accent}" opacity=".5"/>`
        }
        <!-- кровать -->
        <rect x="128" y="70" width="92" height="42" rx="6" fill="${p.linenShade}"/>
        <rect x="128" y="70" width="92" height="16" rx="6" fill="${p.linen}"/>
        <rect x="138" y="58" width="26" height="20" rx="5" fill="${p.linen}"/>
        <rect x="108" y="66" width="14" height="46" rx="3" fill="${p.accent}"/>
        <!-- растение -->
        <rect x="204" y="98" width="14" height="14" rx="2" fill="${p.accent}" opacity=".8"/>
        <path d="M211 98 Q198 90 205 74 Q216 84 211 98 Z" fill="${p.accent}"/>
        <path d="M211 98 Q222 92 224 78 Q210 82 211 98 Z" fill="${p.accent}" opacity=".75"/>
        <!-- пол -->
        <rect x="0" y="120" width="240" height="20" fill="${p.accent}" opacity=".12"/>
      </svg>`;
  }

  if (heroArt) heroArt.innerHTML = HERO_ILLUSTRATION;
  const promoArtEl = document.querySelector('.promo-art');
  if (promoArtEl) promoArtEl.innerHTML = PROMO_ILLUSTRATION;
  const footerArtEl = document.querySelector('.footer-art');
  if (footerArtEl) footerArtEl.innerHTML = FOOTER_ILLUSTRATION;

  // ── i18n ────────────────────────────────────────────────────
  function cityName(c) {
    return currentLang === 'uz' ? c.cityUz : c.city;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const entry = TRANSLATIONS[key];
      if (entry && entry[lang]) el.textContent = entry[lang];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const entry = TRANSLATIONS[el.dataset.i18nPlaceholder];
      if (entry && entry[lang]) el.placeholder = entry[lang];
    });
    document.querySelectorAll('.lang-option').forEach(el => {
      el.classList.toggle('active', el.dataset.langOption === lang);
    });
    if (selectedFrom) inputFrom.value = `${cityName(selectedFrom)} (${selectedFrom.code})`;
    if (selectedTo) inputTo.value = `${cityName(selectedTo)} (${selectedTo.code})`;
    updatePassengersLabel();
    renderRoutes();
    renderHostels();
    renderInfo();
  }

  langSwitch.addEventListener('click', () => {
    applyLanguage(currentLang === 'ru' ? 'uz' : 'ru');
  });

  // ── City suggest ────────────────────────────────────────────
  function renderSuggest(container, query, exclude) {
    const q = query.trim().toLowerCase();
    const matches = CITIES.filter(c => {
      if (exclude && c.code === exclude) return false;
      if (!q) return true;
      return c.city.toLowerCase().includes(q) || c.cityUz.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) || c.airport.toLowerCase().includes(q);
    });

    if (!matches.length) { container.classList.remove('open'); container.innerHTML = ''; return; }

    const ru = matches.filter(c => c.country === 'RU');
    const uz = matches.filter(c => c.country === 'UZ');
    let html = '';
    if (ru.length) {
      html += `<div class="suggest-group-label">${currentLang === 'uz' ? 'Rossiya' : 'Россия'}</div>`;
      html += ru.map(cityItemHtml).join('');
    }
    if (uz.length) {
      html += `<div class="suggest-group-label">${currentLang === 'uz' ? 'O‘zbekiston' : 'Узбекистан'}</div>`;
      html += uz.map(cityItemHtml).join('');
    }
    container.innerHTML = html;
    container.classList.add('open');
  }

  function cityItemHtml(c) {
    return `<div class="suggest-item" data-code="${c.code}">
      <span class="flag">${c.flag}</span>
      <span>${cityName(c)} <span style="color:var(--text-muted)">— ${c.airport}</span></span>
      <span class="code">${c.code}</span>
    </div>`;
  }

  function bindSuggestField(input, container, onSelect, excludeGetter) {
    input.addEventListener('focus', () => {
      activeSuggestField = container;
      renderSuggest(container, input.value, excludeGetter());
    });
    input.addEventListener('input', () => {
      renderSuggest(container, input.value, excludeGetter());
    });
    container.addEventListener('click', e => {
      const item = e.target.closest('.suggest-item');
      if (!item) return;
      const city = CITIES.find(c => c.code === item.dataset.code);
      if (!city) return;
      input.value = `${cityName(city)} (${city.code})`;
      onSelect(city);
      container.classList.remove('open');
    });
  }

  bindSuggestField(inputFrom, suggestFrom, city => { selectedFrom = city; }, () => selectedTo && selectedTo.code);
  bindSuggestField(inputTo, suggestTo, city => { selectedTo = city; }, () => selectedFrom && selectedFrom.code);

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-field')) {
      suggestFrom.classList.remove('open');
      suggestTo.classList.remove('open');
    }
    if (!e.target.closest('.search-field-passengers')) {
      passengersPopover.classList.add('hidden');
    }
  });

  swapBtn.addEventListener('click', () => {
    const tmpCity = selectedFrom; selectedFrom = selectedTo; selectedTo = tmpCity;
    const tmpVal = inputFrom.value; inputFrom.value = inputTo.value; inputTo.value = tmpVal;
  });

  // ── Trip type ───────────────────────────────────────────────
  document.querySelectorAll('.trip-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tripType = btn.dataset.trip;
      document.querySelectorAll('.trip-type-btn').forEach(b => b.classList.toggle('active', b === btn));
      fieldDateBack.classList.toggle('hidden', tripType !== 'roundtrip');
    });
  });

  // ── Passengers (взрослые / дети / младенцы) ───────────────────
  const PAX_LIMITS = { adults: [1, 9], children: [0, 8], infants: [0, 9] };

  function pluralizePassengersRu(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'пассажир';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'пассажира';
    return 'пассажиров';
  }

  function updatePassengersLabel() {
    Object.keys(pax).forEach(key => {
      const el = passengersPopover.querySelector(`[data-pax-count="${key}"]`);
      if (el) el.textContent = pax[key];
    });
    // младенцы без места не считаем отдельными "пассажирами" в бейдже — как на реальных сайтах
    const total = pax.adults + pax.children;
    const word = currentLang === 'ru' ? pluralizePassengersRu(total) : TRANSLATIONS['passengers.label'][currentLang];
    passengersBtn.textContent = `${total} ${word}`;
  }

  passengersBtn.addEventListener('click', e => {
    e.stopPropagation();
    passengersPopover.classList.toggle('hidden');
  });

  passengersPopover.querySelectorAll('[data-pax-minus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.paxMinus;
      const [min] = PAX_LIMITS[key];
      if (pax[key] > min) {
        pax[key]--;
        if (key === 'adults' && pax.infants > pax.adults) pax.infants = pax.adults;
        updatePassengersLabel();
      }
    });
  });
  passengersPopover.querySelectorAll('[data-pax-plus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.paxPlus;
      const [, max] = PAX_LIMITS[key];
      // младенцев без места не может быть больше, чем взрослых, которые их держат на руках
      if (key === 'infants' && pax.infants >= pax.adults) return;
      if (pax[key] < max) { pax[key]++; updatePassengersLabel(); }
    });
  });

  // ── Default dates ───────────────────────────────────────────
  function defaultDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }
  inputDateOut.value = defaultDate(14);
  inputDateBack.value = defaultDate(28);
  inputDateOut.min = defaultDate(0);
  inputDateBack.min = defaultDate(0);

  // ── Search submit ───────────────────────────────────────────
  // В прототипе нет реального бэкенда поиска — вместо перехода на потенциально
  // несуществующую страницу показываем понятный отклик и ведём к похожим вариантам,
  // которые на странице уже есть (карточки направлений).
  function showSearchToast(text) {
    let toast = document.getElementById('searchToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'searchToast';
      toast.className = 'search-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedFrom || !selectedTo) {
      const missing = !selectedFrom ? inputFrom : inputTo;
      missing.style.borderColor = 'var(--negative)';
      missing.focus();
      return;
    }
    const msg = currentLang === 'uz'
      ? `${cityName(selectedFrom)} → ${cityName(selectedTo)}: avia.tutu.ru saytiga o'tamiz`
      : `${cityName(selectedFrom)} → ${cityName(selectedTo)}: переходим на avia.tutu.ru`;
    showSearchToast(msg);
    // Прототип не имеет собственного бэкенда поиска — ведём на боевой поиск авиабилетов tutu.ru.
    window.open('https://avia.tutu.ru/', '_blank', 'noopener');
  });

  // ── Render routes ───────────────────────────────────────────
  function sumText(priceRub) {
    const sum = Math.round(priceRub * UZS_RATE / 1000) * 1000;
    return `${TRANSLATIONS['route.approx'][currentLang]} ${sum.toLocaleString('ru-RU')} ${TRANSLATIONS['route.sum'][currentLang]}`;
  }

  function renderRoutes() {
    routesScroller.innerHTML = ROUTES.map(r => {
      const from = CITIES.find(c => c.code === r.from);
      const to = CITIES.find(c => c.code === r.to);
      const discount = Math.round((1 - r.price / r.oldPrice) * 100);
      const date = currentLang === 'uz' ? r.dateUz : r.date;
      return `<div class="route-card" data-from="${r.from}" data-to="${r.to}">
        <div class="route-flags">${from.flag} → ${to.flag}</div>
        <div class="route-cities">${cityName(from)} → ${cityName(to)}</div>
        <div class="route-date">${date}</div>
        <div class="route-airline">✈️ ${r.airline}</div>
        <div class="route-discount">−${discount}%</div>
        <div class="route-old-price">${r.oldPrice.toLocaleString('ru-RU')} ₽</div>
        <div class="route-price">${r.price.toLocaleString('ru-RU')} ₽</div>
        <div class="route-price-sum">${sumText(r.price)}</div>
        ${r.baggage ? `<div class="route-baggage">🧳 ${TRANSLATIONS['routes.baggage'][currentLang]}</div>` : ''}
        <div class="route-cta">${TRANSLATIONS['routes.cta'][currentLang]}</div>
      </div>`;
    }).join('');

    routesScroller.querySelectorAll('.route-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const from = CITIES.find(c => c.code === card.dataset.from);
        const to = CITIES.find(c => c.code === card.dataset.to);
        selectedFrom = from; selectedTo = to;
        inputFrom.value = `${cityName(from)} (${from.code})`;
        inputTo.value = `${cityName(to)} (${to.code})`;
        // Заполняем форму поиска на лендинге и сразу открываем боевой поиск авиабилетов.
        window.open('https://avia.tutu.ru/', '_blank', 'noopener');
      });
    });
  }

  // ── Render hostels ──────────────────────────────────────────
  function renderHostels() {
    const nightWord = TRANSLATIONS['hostels.night'][currentLang];
    const priceText = currentLang === 'uz'
      ? p => `${p} ₽ ${TRANSLATIONS['hostels.from'][currentLang]}`
      : p => `${TRANSLATIONS['hostels.from'][currentLang]} ${p} ₽`;
    const reviewsWord = TRANSLATIONS['hostels.reviews'][currentLang];
    const verifiedText = TRANSLATIONS['hostels.verified'][currentLang];
    hostelsGrid.innerHTML = HOSTELS.map((h, i) => `
      <a class="hostel-card" href="https://hotel.tutu.ru/" target="_blank" rel="noopener">
        <div class="hostel-art">${hostelIcon(i)}</div>
        <div class="hostel-body">
          <div class="hostel-city">${currentLang === 'uz' ? h.cityUz : h.city}</div>
          <div class="hostel-name">${h.name}</div>
          <div class="hostel-area">${currentLang === 'uz' ? h.areaUz : h.area}</div>
          <div class="hostel-rating-row">
            <span class="hostel-rating">★ ${h.rating}</span>
            <span class="hostel-reviews-count">(${h.reviews} ${reviewsWord})</span>
          </div>
          ${h.verified ? `<div class="hostel-verified">✓ ${verifiedText}</div>` : ''}
          <div class="hostel-footer">
            <span class="hostel-price">${priceText(h.price)} / ${nightWord}</span>
            <span class="hostel-price-sum">${sumText(h.price)}</span>
          </div>
        </div>
      </a>`).join('');
  }

  // ── Render useful info ───────────────────────────────────────
  function renderInfo() {
    infoGrid.innerHTML = USEFUL_INFO.map(item => `
      <div class="info-card">
        <div class="info-icon">${item.icon}</div>
        <div class="info-title">${currentLang === 'uz' ? item.titleUz : item.title}</div>
        <div class="info-text">${currentLang === 'uz' ? item.textUz : item.text}</div>
      </div>`).join('');
  }

  // ── Promo copy ──────────────────────────────────────────────
  promoCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(PROMO_CODE).catch(() => {});
    promoCopyBtn.textContent = TRANSLATIONS['promo.copied'][currentLang];
    setTimeout(() => { promoCopyBtn.textContent = TRANSLATIONS['promo.copy'][currentLang]; }, 1800);
  });
  promoCode.textContent = PROMO_CODE;

  // ── Boot ──────────────────────────────────────────────────────
  renderRoutes();
  renderHostels();
  renderInfo();
  updatePassengersLabel();
})();
