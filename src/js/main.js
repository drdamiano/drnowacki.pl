// drnowacki.pl — jedyny skrypt strony (bez zależności, bez cookies).
// 1. Źródło wejścia (UTM, referrer) → sessionStorage → ukryte pola formularza
// 2. Walidacja formularza „Oddzwonimy” z komunikatami po polsku
// 3. Widżet ZnanyLekarz ładowany dopiero po kliknięciu
// 4. Pasek z przyciskami na telefonach

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

function initForm(form, attribution) {
  form.noValidate = true; // własne komunikaty zamiast dymków przeglądarki

  // Ukryte pola źródła wejścia
  Object.entries(attribution).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value || '';
  });

  const fields = ['imie', 'telefon', 'email', 'zgoda'].map((n) => form.elements.namedItem(n)).filter(Boolean);
  const submit = form.querySelector('[type="submit"]');
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
const attribution = getAttribution(); // na każdej stronie — zapamiętuje pierwsze wejście w sesji
const form = document.querySelector('[data-lead-form]');
if (form) initForm(form, attribution);
initBookingWidget();
initCtaBar();
