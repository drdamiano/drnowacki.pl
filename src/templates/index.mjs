import {
  html,
  raw,
  fullName,
  formatDatePL,
  formatRating,
  mapUrl,
  visibleLocations,
  hasReviewNumbers,
  extLink,
} from './html.mjs';
import { layout } from './layout.mjs';

export function renderIndex(ctx) {
  const body = [
    hero(ctx),
    reviews(ctx),
    firstVisit(ctx),
    services(ctx),
    ctx.config.pricing.visible ? pricing(ctx) : '',
    booking(ctx),
    callbackForm(ctx),
    locations(ctx),
  ];

  return layout(ctx, {
    path: '/',
    body,
    jsonLd: jsonLd(ctx),
    bodyClass: 'has-cta-bar',
    after: ctaBar(),
  });
}

// ---------------------------------------------------------------------------
//  1. Hero
// ---------------------------------------------------------------------------
function hero(ctx) {
  const { person, reviews: r } = ctx.config;
  const byName = groupLocations(visibleLocations(ctx.config));

  return html`<section class="hero" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__text">
      <h1 id="hero-title" class="hero__title"><span class="hero__honorific">${person.honorific}</span> <span class="hero__name">${fullName(person)}</span></h1>
      <p class="hero__subtitle">${person.subtitle} <span aria-hidden="true">·</span> ${person.city}</p>
      ${person.approach ? html`<p class="hero__lead">${person.approach}</p>` : ''}
      <div class="hero__actions" data-hero-actions>
        <a class="btn btn--primary" href="#rezerwacja">Umów wizytę online</a>
        <a class="btn btn--outline" href="#oddzwonimy">Wolę, żeby ktoś zadzwonił</a>
      </div>
      <ul class="hero__facts">
        ${hasReviewNumbers(r)
          ? html`<li><a href="#opinie"><strong>${formatRating(r.average)}</strong> / 5 — średnia z ${r.count} opinii w serwisie ${r.sourceName}</a></li>`
          : ''}
        ${byName.map(
          ([name, locs]) =>
            html`<li><a href="#gdzie">${name}: ${locs.map((l, i) => html`${i ? ' · ' : ''}<span class="nowrap">${l.street}</span>`)}</a></li>`,
        )}
      </ul>
    </div>
    <div class="hero__media">${portrait(ctx)}</div>
  </div>
</section>`;
}

function portrait(ctx) {
  const img = ctx.assets.portrait;
  const alt = ctx.config.images.portrait.alt;
  const [w, h] = ctx.config.images.portrait.aspect;
  if (!img) {
    // Neutralny placeholder do czasu wgrania assets/portret.jpg
    return html`<div class="portrait portrait--placeholder" style="aspect-ratio:${w}/${h}" role="img" aria-label="${alt}">
      <span aria-hidden="true">${ctx.config.brand.monogram}</span>
    </div>`;
  }
  // Portret jest w pierwszym ekranie (LCP) — ładowany od razu, z wysokim priorytetem.
  return html`<picture class="portrait">
    ${img.sources.map((s) => html`<source type="${s.type}" srcset="${s.srcset}" sizes="${img.sizes}">`)}
    <img src="${img.src}" width="${img.width}" height="${img.height}" alt="${alt}" fetchpriority="high" decoding="async">
  </picture>`;
}

function groupLocations(locs) {
  const map = new Map();
  for (const l of locs) map.set(l.name, [...(map.get(l.name) ?? []), l]);
  return [...map.entries()];
}

// ---------------------------------------------------------------------------
//  2. Opinie
// ---------------------------------------------------------------------------
function reviews(ctx) {
  const r = ctx.config.reviews;
  const link = extLink(r.url, 'Zobacz wszystkie opinie', {
    className: 'link link--arrow',
    hint: `${r.sourceName}, otwiera się w nowej karcie`,
  });

  const content = hasReviewNumbers(r)
    ? html`<div class="reviews">
        <p class="reviews__score"><span class="reviews__avg">${formatRating(r.average)}</span><span class="reviews__max">/ 5</span></p>
        <div class="reviews__meta">
          <p>Średnia ocen z <strong>${r.count} opinii</strong> pacjentów w serwisie ${r.sourceName}.</p>
          ${r.updatedAt ? html`<p class="muted small">Stan na ${formatDatePL(r.updatedAt)} r.</p>` : ''}
          <p>${link}</p>
        </div>
      </div>`
    : html`<div class="reviews">
        <div class="reviews__meta">
          <p>Opinie pacjentów są publikowane w serwisie ${r.sourceName}.</p>
          <p>${link}</p>
        </div>
      </div>`;

  return html`<section id="opinie" class="section" aria-labelledby="opinie-title">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">${r.sourceName}</p>
      <h2 id="opinie-title" class="section__title">Opinie pacjentów</h2>
    </header>
    ${content}
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  3. Pierwsza wizyta
// ---------------------------------------------------------------------------
function firstVisit(ctx) {
  return html`<section id="pierwsza-wizyta" class="section" aria-labelledby="wizyta-title">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Krok po kroku</p>
      <h2 id="wizyta-title" class="section__title">Jak wygląda pierwsza wizyta</h2>
    </header>
    <ol class="steps">
      ${ctx.config.firstVisit.map(
        (s, i) => html`<li class="step">
        <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="step__title">${s.title}</h3>
        <p>${s.text}</p>
      </li>`,
      )}
    </ol>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  4. Zakres
// ---------------------------------------------------------------------------
function services(ctx) {
  return html`<section id="zakres" class="section" aria-labelledby="zakres-title">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Zakres</p>
      <h2 id="zakres-title" class="section__title">Zakres leczenia</h2>
    </header>
    <ul class="services">
      ${ctx.config.services.map(
        (s) => html`<li class="service">
        <h3 class="service__title">${s.title}</h3>
        <p>${s.text}</p>
        ${s.systems?.length ? html`<p class="service__systems">Systemy: ${s.systems.join(', ')}</p>` : ''}
      </li>`,
      )}
    </ul>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  5. Cennik (pricing.visible w configu)
// ---------------------------------------------------------------------------
function pricing(ctx) {
  const { items, note } = ctx.config.pricing;
  const rows = items.filter((i) => i.price != null);
  return html`<section id="cennik" class="section" aria-labelledby="cennik-title">
  <div class="container narrow">
    <header class="section__head">
      <p class="eyebrow">Koszty</p>
      <h2 id="cennik-title" class="section__title">Cennik</h2>
    </header>
    <dl class="prices">
      ${rows.map((i) => html`<div class="prices__row"><dt>${i.name}</dt><dd>${i.price}</dd></div>`)}
    </dl>
    ${note ? html`<p class="muted small">${note}</p>` : ''}
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  6. Rezerwacja online — widżet ładowany dopiero po kliknięciu
// ---------------------------------------------------------------------------
function booking(ctx) {
  const { profileUrl, widgetHtml } = ctx.config.booking;
  const hasWidget = Boolean(widgetHtml && widgetHtml.trim());

  return html`<section id="rezerwacja" class="section section--alt" aria-labelledby="rezerwacja-title">
  <div class="container narrow booking">
    <header class="section__head">
      <p class="eyebrow">Rezerwacja online</p>
      <h2 id="rezerwacja-title" class="section__title">Umów wizytę online</h2>
    </header>
    <p>Kalendarz pokazuje aktualne wolne terminy. Wizytę możesz zarezerwować o&nbsp;każdej porze — także wieczorem i&nbsp;w&nbsp;weekend.</p>
    <div class="booking__action">
      <a class="btn btn--primary" href="${profileUrl}" target="_blank" rel="noopener"${hasWidget ? raw(' data-zl-load aria-controls="zl-widget"') : ''}>Pokaż wolne terminy${hasWidget ? '' : html`<span class="sr-only"> (ZnanyLekarz, otwiera się w nowej karcie)</span>`}</a>
      <p class="booking__note">${hasWidget
        ? 'Kalendarz dostarcza serwis ZnanyLekarz. Załaduje się dopiero po kliknięciu i może używać plików cookies tego serwisu.'
        : 'Kalendarz otworzy się na profilu w serwisie ZnanyLekarz.'}</p>
    </div>
    ${hasWidget
      ? html`<div id="zl-widget" class="booking__widget" tabindex="-1" hidden></div>
    <p class="booking__fallback" data-zl-fallback hidden>Kalendarz się nie wyświetla? ${extLink(profileUrl, 'Otwórz profil w serwisie ZnanyLekarz')}</p>
    <template id="zl-widget-code">${raw(widgetHtml)}</template>`
      : ''}
    <p class="booking__alt">Wolisz rozmowę? <a class="link" href="#oddzwonimy">Zostaw numer — oddzwonimy</a></p>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  7. Formularz „Oddzwonimy” (Netlify Forms)
// ---------------------------------------------------------------------------
// Bez JS działa walidacja przeglądarki (pattern). Z JS: komunikaty po polsku
// i zapis numeru jako „+48 XXX XXX XXX”.
const PHONE_PATTERN = String.raw`\s*(\+48|0048|48)?[\s\-]*(\d[\s\-]*){9}`;

function callbackForm(ctx) {
  const { form } = ctx.config;
  return html`<section id="oddzwonimy" class="section" aria-labelledby="oddzwonimy-title">
  <div class="container narrow">
    <header class="section__head">
      <p class="eyebrow">Oddzwonimy</p>
      <h2 id="oddzwonimy-title" class="section__title">Wolisz, żeby ktoś zadzwonił?</h2>
    </header>
    ${form.intro ? html`<p>${form.intro}</p>` : ''}
    <form class="form" name="${form.name}" method="POST" action="/dziekujemy" data-netlify="true" netlify-honeypot="bot-field" data-lead-form>
      <input type="hidden" name="form-name" value="${form.name}">
      <div class="hp" aria-hidden="true">
        <label>Nie wypełniaj tego pola: <input name="bot-field" tabindex="-1" autocomplete="off"></label>
      </div>

      <div class="field">
        <label class="field__label" for="f-imie">Imię</label>
        <input class="field__input" id="f-imie" name="imie" type="text" autocomplete="given-name" maxlength="80" required aria-describedby="f-imie-err">
        <p class="field__error" id="f-imie-err" hidden></p>
      </div>

      <div class="field">
        <label class="field__label" for="f-telefon">Telefon</label>
        <p class="field__hint" id="f-telefon-hint">9 cyfr, np. 600 123 456</p>
        <input class="field__input" id="f-telefon" name="telefon" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required pattern="${PHONE_PATTERN}" aria-describedby="f-telefon-hint f-telefon-err">
        <p class="field__error" id="f-telefon-err" hidden></p>
      </div>

      <div class="field">
        <label class="field__label" for="f-email">E-mail <span class="field__optional">(opcjonalnie)</span></label>
        <input class="field__input" id="f-email" name="email" type="email" autocomplete="email" maxlength="120" aria-describedby="f-email-err">
        <p class="field__error" id="f-email-err" hidden></p>
      </div>

      <fieldset class="field choices">
        <legend class="field__label">Co Cię interesuje? <span class="field__optional">(opcjonalnie)</span></legend>
        <div class="choices__grid">
          ${form.interests.map(
            (o) => html`<label class="choice"><input type="radio" name="leczenie" value="${o.label}"><span>${o.label}</span></label>`,
          )}
        </div>
      </fieldset>

      <div class="field consent">
        <div class="consent__row">
          <input id="f-zgoda" name="zgoda" type="checkbox" value="tak" required aria-describedby="f-zgoda-more f-zgoda-err">
          <label for="f-zgoda">${form.consentText}</label>
        </div>
        <p class="consent__more" id="f-zgoda-more">Zgodę możesz wycofać w każdej chwili. ${extLink('/polityka-prywatnosci', 'Polityka prywatności')}</p>
        <p class="field__error" id="f-zgoda-err" hidden></p>
      </div>

      <input type="hidden" name="utm_source">
      <input type="hidden" name="utm_medium">
      <input type="hidden" name="utm_campaign">
      <input type="hidden" name="utm_content">
      <input type="hidden" name="referrer_url">
      <input type="hidden" name="landing_url">

      ${form.callbackNote ? html`<p class="form__note">${form.callbackNote}</p>` : ''}
      <button class="btn btn--primary btn--block" type="submit">Poproś o telefon</button>
    </form>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  8. Gdzie przyjmuję
// ---------------------------------------------------------------------------
function locations(ctx) {
  const locs = visibleLocations(ctx.config);
  return html`<section id="gdzie" class="section" aria-labelledby="gdzie-title">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Placówki</p>
      <h2 id="gdzie-title" class="section__title">Gdzie przyjmuję</h2>
    </header>
    <ul class="locations">
      ${locs.map((l) => {
        const img = ctx.assets.locations[ctx.config.locations.indexOf(l)];
        return html`<li class="location">
        ${img
          ? html`<picture class="location__img">
          ${img.sources.map((s) => html`<source type="${s.type}" srcset="${s.srcset}" sizes="${img.sizes}">`)}
          <img src="${img.src}" width="${img.width}" height="${img.height}" alt="${l.name}, ${l.street}" loading="lazy" decoding="async">
        </picture>`
          : ''}
        <h3 class="location__name">${l.name}</h3>
        <address class="location__address">${l.street}<br>${[l.postalCode, l.city].filter(Boolean).join(' ')}</address>
        ${l.note ? html`<p class="location__note">${l.note}</p>` : ''}
        <p>${extLink(mapUrl(l), 'Mapa i dojazd', { className: 'link link--arrow', hint: 'Mapy Google, otwiera się w nowej karcie' })}</p>
      </li>`;
      })}
    </ul>
  </div>
</section>`;
}

// Pasek z przyciskami na telefonach — pojawia się po przewinięciu pierwszego ekranu.
function ctaBar() {
  return html`<div class="cta-bar" data-cta-bar inert>
  <a class="btn btn--primary" href="#rezerwacja">Umów wizytę online</a>
  <a class="btn btn--outline" href="#oddzwonimy">Oddzwońcie</a>
</div>`;
}

// ---------------------------------------------------------------------------
//  JSON-LD (bez medicalSpecialty — brak sugestii specjalizacji)
// ---------------------------------------------------------------------------
function jsonLd(ctx) {
  const { site, person, booking, social, form } = ctx.config;
  const locs = visibleLocations(ctx.config);
  const name = `${person.honorific} ${fullName(person)}`;
  const address = (l) => ({
    '@type': 'PostalAddress',
    streetAddress: l.street,
    ...(l.postalCode ? { postalCode: l.postalCode } : {}),
    addressLocality: l.city,
    addressCountry: 'PL',
  });
  const image = ctx.assets.portrait ? site.url + ctx.assets.portrait.src : site.url + ctx.assets.og.src;
  const sameAs = [booking.profileUrl, social.instagram.url];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: `${site.url}/`,
        name,
        inLanguage: 'pl-PL',
      },
      {
        '@type': 'Person',
        '@id': `${site.url}/#osoba`,
        name: fullName(person),
        honorificPrefix: person.honorific,
        jobTitle: person.jobTitle,
        url: `${site.url}/`,
        image,
        sameAs,
        worksFor: { '@id': `${site.url}/#praktyka` },
      },
      {
        '@type': 'Physician',
        '@id': `${site.url}/#praktyka`,
        name: `${name} — ${person.subtitle.toLowerCase()}`,
        description: `${person.subtitle} · ${person.city}`,
        url: `${site.url}/`,
        image,
        ...(form.callbackPhone ? { telephone: form.callbackPhone } : {}),
        address: locs.map(address),
        location: locs.map((l) => ({ '@type': 'Place', name: l.name, address: address(l), hasMap: mapUrl(l) })),
        areaServed: { '@type': 'City', name: person.city },
        sameAs,
      },
    ],
  };
}
