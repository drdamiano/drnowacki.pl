// drnowacki.pl — jedyny skrypt strony (bez zależności, bez cookies).
// 1. Źródło wejścia (UTM, referrer) → sessionStorage → ukryte pola formularza
// 2. Formularz „Oddzwonimy”: dwa kroki, walidacja z komunikatami po polsku
// 3. Widżet ZnanyLekarz ładowany dopiero po kliknięciu
// 4. Pasek z przyciskami na telefonach
// 5. Ruch: sekcje pojawiają się przy przewijaniu, słowa się rozjaśniają,
//    linia postępu kroków, pasek z hasłami i paralaksa portretu
// 6. „Wyślij rodzicom” — udostępnianie strony (z oznaczeniem źródła)

import { normalizePLPhone, formatPLPhone } from './phone.mjs';

// ---------------------------------------------------------------------------
// 1. Atrybucja
// ---------------------------------------------------------------------------
const STORE_KEY = 'dn_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const CLICK_IDS = ['fbclid', 'gclid', 'igshid', 'msclkid', 'ttclid'];

function readStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
  } catch {
    return null;
  }
}

function writeStore(data) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    /* tryb prywatny / zablokowany storage — dane i tak trafią do pól */
  }
}

function externalReferrer() {
  try {
    const ref = document.referrer && new URL(document.referrer);
    return ref && ref.host !== location.host ? ref.href : '';
  } catch {
    return '';
  }
}

function cleanLandingUrl() {
  const url = new URL(location.href);
  CLICK_IDS.forEach((k) => url.searchParams.delete(k));
  url.hash = '';
  return url.href.slice(0, 500);
}

function getAttribution() {
  const params = new URLSearchParams(location.search);
  const hasUtm = UTM_KEYS.some((k) => params.get(k));
  let data = readStore();

  // Pierwsze wejście w tej sesji albo nowy link z UTM → zapisz od nowa.
  if (!data || hasUtm) {
    data = { referrer_url: externalReferrer() || data?.referrer_url || '', landing_url: cleanLandingUrl() };
    UTM_KEYS.forEach((k) => (data[k] = (params.get(k) || '').slice(0, 100)));
    writeStore(data);
  }
  return data;
}

// ---------------------------------------------------------------------------
// 2. Formularz
// ---------------------------------------------------------------------------
const MESSAGES = {
  imie: 'Wpisz swoje imię.',
  telefonEmpty: 'Wpisz numer telefonu.',
  telefon: 'Numer telefonu musi mieć 9 cyfr, np. 600 123 456. Sprawdź, czy żadnej nie brakuje.',
  email: 'Sprawdź adres e-mail — wygląda na niepełny (np. jan@example.com). Możesz też zostawić to pole puste.',
  zgoda: 'Zaznacz zgodę — bez niej nie możemy oddzwonić.',
};

function setError(input, message) {
  const err = document.getElementById(`${input.id}-err`);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    if (err) {
      err.textContent = message;
      err.hidden = false;
    }
  } else {
    input.removeAttribute('aria-invalid');
    if (err) {
      err.textContent = '';
      err.hidden = true;
    }
  }
}

function validateField(input) {
  const v = input.value.trim();
  switch (input.name) {
    case 'imie':
      return v ? '' : MESSAGES.imie;
    case 'telefon':
      if (!v) return MESSAGES.telefonEmpty;
      return normalizePLPhone(v) ? '' : MESSAGES.telefon;
    case 'email':
      return !v || input.validity.valid ? '' : MESSAGES.email;
    case 'zgoda':
      return input.checked ? '' : MESSAGES.zgoda;
    default:
      return '';
  }
}

// Dwa kroki: 1) jedno kliknięcie (co Cię interesuje), 2) dane kontaktowe.
// Kliknięcie palcem/myszą w opcję od razu przechodzi dalej; z klawiatury — przycisk „Dalej”.
function initSteps(form) {
  const steps = [...form.querySelectorAll('[data-step]')];
  if (steps.length !== 2) return () => 2;
  const progress = form.querySelector('[data-form-progress]');
  const label = form.querySelector('[data-step-label]');
  const next = form.querySelector('[data-next]');
  const back = form.querySelector('[data-back]');
  const radios = [...steps[0].querySelectorAll('input[type="radio"]')];
  let current = 1;
  let timer;

  const show = (n, focus) => {
    current = n;
    steps.forEach((s, i) => s.classList.toggle('is-current', i === n - 1));
    label.textContent = `Krok ${n} z 2`;
    progress.style.setProperty('--step-p', String(n / 2));
    if (focus) steps[n - 1].querySelector('.form__step-title').focus();
  };
  const updateNext = () => {
    next.textContent = radios.some((r) => r.checked) ? 'Dalej' : 'Pomiń';
  };

  form.classList.add('is-stepped');
  [progress, back, form.querySelector('[data-step-actions]')].forEach((el) => el && (el.hidden = false));

  radios.forEach((r) => r.addEventListener('change', updateNext));
  steps[0].querySelectorAll('.choice').forEach((choice) =>
    choice.addEventListener('pointerup', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (choice.querySelector('input').checked) show(2, true);
      }, 350);
    }),
  );
  next.addEventListener('click', () => show(2, true));
  back.addEventListener('click', () => show(1, true));

  updateNext();
  show(1, false);
  return () => current;
}

function initForm(form, attribution) {
  form.noValidate = true; // własne komunikaty zamiast dymków przeglądarki

  // Ukryte pola źródła wejścia
  Object.entries(attribution).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value || '';
  });

  const fields = ['imie', 'telefon', 'email', 'zgoda'].map((n) => form.elements.namedItem(n)).filter(Boolean);
  const submit = form.querySelector('[type="submit"]');
  const currentStep = initSteps(form);
  let attempted = false;

  fields.forEach((input) => {
    const evt = input.type === 'checkbox' ? 'change' : 'blur';
    input.addEventListener(evt, () => {
      // Komunikat przy opuszczeniu pola — tylko gdy coś wpisano albo po próbie wysłania.
      if (attempted || input.value.trim() || input.type === 'checkbox') setError(input, validateField(input));
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true' && !validateField(input)) setError(input, '');
    });
  });

  form.addEventListener('submit', (e) => {
    // Enter w kroku 1 nie wysyła formularza — przechodzi do kroku 2
    if (currentStep() === 1) {
      e.preventDefault();
      form.querySelector('[data-next]')?.click();
      return;
    }
    attempted = true;
    let firstInvalid = null;
    fields.forEach((input) => {
      const msg = validateField(input);
      setError(input, msg);
      if (msg && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      return;
    }

    // Zapis numeru w jednolitym formacie: +48 XXX XXX XXX
    const phone = form.elements.namedItem('telefon');
    phone.value = formatPLPhone(normalizePLPhone(phone.value));

    if (submit.getAttribute('aria-disabled') === 'true') {
      e.preventDefault(); // blokada podwójnego wysłania
      return;
    }
    submit.setAttribute('aria-disabled', 'true');
    submit.dataset.label = submit.textContent;
    submit.textContent = 'Wysyłanie…';
  });

  // Powrót przyciskiem „wstecz” (bfcache) — odblokuj przycisk.
  window.addEventListener('pageshow', () => {
    if (submit.dataset.label) {
      submit.textContent = submit.dataset.label;
      submit.removeAttribute('aria-disabled');
    }
  });
}

// ---------------------------------------------------------------------------
// 3. Widżet ZnanyLekarz — ładowany na żądanie
// ---------------------------------------------------------------------------
function initBookingWidget() {
  const trigger = document.querySelector('[data-zl-load]');
  const template = document.getElementById('zl-widget-code');
  const target = document.getElementById('zl-widget');
  if (!trigger || !template || !target) return;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (target.dataset.loaded) {
      target.focus();
      return;
    }
    target.dataset.loaded = 'true';
    target.append(template.content.cloneNode(true));

    // Skrypty ze sklonowanego <template> nie uruchamiają się same — odtwarzamy je.
    target.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      [...old.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      s.text = old.text;
      old.replaceWith(s);
    });

    target.hidden = false;
    trigger.closest('.booking__action')?.setAttribute('hidden', '');
    document.querySelector('[data-zl-fallback]')?.removeAttribute('hidden');
    target.focus();
  });
}

// ---------------------------------------------------------------------------
// 4. Pasek CTA (telefony): widoczny po przewinięciu pierwszego ekranu,
//    ukryty, gdy na ekranie jest rezerwacja albo formularz.
// ---------------------------------------------------------------------------
function initCtaBar() {
  const bar = document.querySelector('[data-cta-bar]');
  const hero = document.querySelector('[data-hero-actions]');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  const watched = [hero, document.getElementById('rezerwacja'), document.getElementById('oddzwonimy')].filter(Boolean);
  const visible = new Map(watched.map((el) => [el, true]));
  let heroSeen = false;

  const update = () => {
    const anyVisible = [...visible.values()].some(Boolean);
    const show = heroSeen && !anyVisible;
    bar.classList.toggle('is-visible', show);
    bar.inert = !show;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible.set(entry.target, entry.isIntersecting);
      if (entry.target === hero) heroSeen = true;
    });
    update();
  });
  watched.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// 5. Ruch przy przewijaniu (klasę js-reveal ustawia skrypt w <head>;
//    przy „ogranicz ruch” jej nie ma i wszystko jest od razu widoczne)
// ---------------------------------------------------------------------------
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

function initReveal() {
  window.__reveal = true;
  const root = document.documentElement;
  if (!root.classList.contains('js-reveal')) return;
  if (!('IntersectionObserver' in window)) {
    root.classList.remove('js-reveal');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

// Efekty powiązane z przewijaniem — jedna pętla requestAnimationFrame.
function initScrollEffects() {
  if (!document.documentElement.classList.contains('js-reveal')) return;

  const scrub = document.querySelector('[data-scrub]');
  const words = scrub ? [...scrub.querySelectorAll('.sw')] : [];
  const steps = document.querySelector('[data-progress]');
  const stepItems = steps ? [...steps.querySelectorAll('.step')] : [];
  const ticker = document.querySelector('[data-ticker]');
  const portrait = document.querySelector('[data-parallax] img');
  const drift = document.querySelector('[data-drift]');
  let lit = -1;
  let queued = false;

  const update = () => {
    queued = false;
    const vh = window.innerHeight;

    // Ciemna sekcja: kolejne słowa rozjaśniają się, gdy tekst przesuwa się przez ekran
    if (words.length) {
      const r = scrub.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.4));
      const n = Math.round(p * words.length);
      if (n !== lit) {
        lit = n;
        words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
      }
    }

    // Kroki pierwszej wizyty: linia postępu i aktywne punkty
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = clamp((vh * 0.75 - r.top) / r.height);
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach((s, i) => s.classList.toggle('is-active', p >= (i + 0.25) / stepItems.length));
    }

    // Pasek z zakresem: przesuwa się tylko razem z przewijaniem
    if (ticker) {
      const half = ticker.scrollWidth / 2;
      if (half) ticker.style.transform = `translate3d(${(-(window.scrollY * 0.35) % half).toFixed(1)}px,0,0)`;
    }

    // Monogram w tle ciemnej sekcji: powoli „płynie” wbrew przewijaniu
    if (drift) {
      const r = drift.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        drift.style.translate = `0 ${((clamp((vh - r.top) / (vh + r.height)) - 0.5) * -90).toFixed(1)}px`;
      }
    }

    // Portret: delikatna paralaksa w obrębie kadru
    if (portrait) {
      const r = portrait.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        portrait.style.translate = `0 ${(clamp(-r.top / r.height, -1, 1) * 22).toFixed(1)}px`;
      }
    }
  };

  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

// ---------------------------------------------------------------------------
// 6. „Wyślij rodzicom”: systemowe udostępnianie (WhatsApp, Messenger, SMS…),
//    a gdy go nie ma — skopiowanie linku. Link ma utm_source=polecenie.
// ---------------------------------------------------------------------------
function initShare() {
  document.querySelectorAll('[data-share]').forEach((btn) => {
    const status = btn.parentElement.querySelector('[data-share-status]');
    const say = (msg) => status && (status.textContent = msg);
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      const url = new URL(btn.dataset.shareUrl, location.origin).href;
      const text = btn.dataset.shareText;
      if (navigator.share) {
        try {
          await navigator.share({ text, url });
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // ktoś zamknął okno udostępniania
        }
      }
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        say('Link skopiowany — wklej go rodzicom w wiadomości.');
      } catch {
        say(`Skopiuj i wyślij: ${url}`);
      }
    });
  });
}

// ---------------------------------------------------------------------------
initReveal();
initShare();
initScrollEffects();
const attribution = getAttribution(); // na każdej stronie — zapamiętuje pierwsze wejście w sesji
const form = document.querySelector('[data-lead-form]');
if (form) initForm(form, attribution);
initBookingWidget();
initCtaBar();
