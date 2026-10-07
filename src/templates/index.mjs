import { html, raw, fullName, mapUrl, visibleLocations, extLink, splitWords } from './html.mjs';
import { layout, markEl } from './layout.mjs';

export function renderIndex(ctx) {
  const { config } = ctx;
  const body = [
    hero(ctx),
    config.ticker?.length ? ticker(ctx) : '',
    config.manifesto ? manifesto(ctx) : '',
    featuredLocation(config) ? clinic(ctx) : '',
    config.audiences ? audiences(ctx) : '',
    config.restoration ? restoration(ctx) : '',
    reviews(ctx),
    firstVisit(ctx),
    services(ctx),
    config.faq?.length ? faq(ctx) : '',
    config.pricing.visible ? pricing(ctx) : '',
    booking(ctx),
    callbackForm(ctx),
    locations(ctx),
  ];

  return layout(ctx, {
    path: '/',
    body,
    jsonLd: jsonLd(ctx),
    bodyClass: 'has-cta-bar',
    after: ctaBar(ctx),
  });
}

// Słowa w maskach — każde wyłania się od dołu (tekst w HTML zostaje nietknięty)
const maskedWords = (text) =>
  splitWords(text)
    .map((w, i) => html`<span class="mask"><span class="mask__inner" style="--w:${i}">${w}</span></span>`)
    .reduce((acc, w, i) => (i ? [...acc, ' ', w] : [w]), []);

// ---------------------------------------------------------------------------
//  1. Pierwszy ekran
// ---------------------------------------------------------------------------
function hero(ctx) {
  const { person, cta } = ctx.config;
  const main = featuredLocation(ctx.config);
  const byName = groupLocations(visibleLocations(ctx.config).filter((l) => l !== main));

  return html`<section class="hero" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__text">
      <h1 id="hero-title" class="hero__title"><span class="hero__honorific">${person.honorific}</span> <span class="hero__name">${maskedWords(fullName(person))}</span></h1>
      <p class="hero__subtitle">${person.subtitle} <span aria-hidden="true">·</span> ${person.city}</p>
      ${person.hook ? html`<p class="hero__hook">${maskedWords(person.hook)}</p>` : ''}
      ${person.approach ? html`<p class="hero__lead">${person.approach}</p>` : ''}
      <div class="hero__actions" data-hero-actions>
        <a class="btn btn--primary" href="#rezerwacja">${cta.primary}</a>
        <a class="btn btn--outline" href="#oddzwonimy">${cta.secondary}</a>
      </div>
      ${cta.note ? html`<p class="hero__note">${cta.note}</p>` : ''}
      <ul class="hero__facts">
        ${main
          ? html`<li class="hero__fact--main"><a href="#orthohouse"><strong>${main.name}</strong> · <span class="nowrap">${main.street}</span>${main.note ? html` — ${lowerFirst(main.note)}` : ''}</a></li>`
          : ''}
        ${byName.map(
          ([name, locs]) =>
            html`<li><a href="#gdzie">${name}: ${locs.map((l, i) => html`${i ? ' · ' : ''}<span class="nowrap">${l.street}</span>`)}</a></li>`,
        )}
      </ul>
    </div>
    <div class="hero__media" data-parallax>${portrait(ctx)}</div>
  </div>
  <a class="scroll-cue" href="#${ctx.config.manifesto ? 'manifest' : 'opinie'}"><span class="sr-only">Przewiń dalej</span><span class="scroll-cue__line" aria-hidden="true"></span></a>
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
  // „Kurtyna” to nakładka (::after); sam obraz maluje się od razu.
  return html`<picture class="portrait">
    ${img.sources.map((s) => html`<source type="${s.type}" srcset="${s.srcset}" sizes="${img.sizes}">`)}
    <img src="${img.src}" width="${img.width}" height="${img.height}" alt="${alt}" fetchpriority="high" decoding="async">
  </picture>`;
}

const featuredLocation = (config) => visibleLocations(config).find((l) => l.featured);
const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);

function groupLocations(locs) {
  const map = new Map();
  for (const l of locs) map.set(l.name, [...(map.get(l.name) ?? []), l]);
  return [...map.entries()];
}

// ---------------------------------------------------------------------------
//  Pasek z hasłami — przesuwa się razem z przewijaniem (dekoracja)
// ---------------------------------------------------------------------------
function ticker(ctx) {
  const items = ctx.config.ticker;
  const half = [...items, ...items]; // połowa paska; druga połowa to kopia → płynna pętla
  return html`<div class="ticker" aria-hidden="true">
  <div class="ticker__track" data-ticker>
    ${[...half, ...half].map((t) => html`<span class="ticker__item">${t}</span>`)}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
//  Ciemna sekcja — tekst rozjaśnia się słowo po słowie przy przewijaniu
// ---------------------------------------------------------------------------
function manifesto(ctx) {
  const { eyebrow, text } = ctx.config.manifesto;
  const words = splitWords(text)
    .map((w) => html`<span class="sw">${w}</span>`)
    .reduce((acc, w, i) => (i ? [...acc, ' ', w] : [w]), []);
  return html`<section id="manifest" class="section section--ink manifest" aria-labelledby="manifest-title">
  ${markEl(ctx, 'manifest__mark', 'data-drift')}
  <div class="container narrow">
    <h2 id="manifest-title" class="eyebrow">${eyebrow}</h2>
    <p class="manifest__text" data-scrub>${words}</p>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Główne miejsce przyjęć (ORTHOHOUSE) — wysoko na stronie
// ---------------------------------------------------------------------------
function clinic(ctx) {
  const l = featuredLocation(ctx.config);
  const img = ctx.assets.locations[ctx.config.locations.indexOf(l)];
  // Przed otwarciem (jest notka) przycisk prowadzi do formularza, potem do rezerwacji
  const cta = l.note
    ? html`<a class="btn btn--primary" href="#oddzwonimy">Zapytaj o pierwsze terminy</a>`
    : html`<a class="btn btn--primary" href="#rezerwacja">${ctx.config.cta.primary}</a>`;
  return html`<section id="orthohouse" class="section clinic" aria-labelledby="clinic-title">
  <div class="container clinic__grid">
    <header class="clinic__head" data-reveal>
      <p class="eyebrow">Moje główne miejsce przyjęć</p>
      <h2 id="clinic-title" class="clinic__name">${l.name}</h2>
      ${l.descriptor ? html`<p class="clinic__descriptor">${l.descriptor}</p>` : ''}
      ${l.note ? html`<p class="badge">${l.note}</p>` : ''}
    </header>
    <div class="clinic__body">
      ${l.text ? html`<p class="clinic__text" data-reveal style="--reveal-i:1">${l.text}</p>` : ''}
      <div class="clinic__meta" data-reveal style="--reveal-i:2">
        <address class="clinic__address">${l.street}<br>${[l.postalCode, l.city].filter(Boolean).join(' ')}</address>
        <div class="clinic__actions">
          ${cta}
          ${extLink(mapUrl(l), 'Mapa i dojazd', { className: 'link link--arrow', hint: 'Mapy Google, otwiera się w nowej karcie' })}
        </div>
      </div>
    </div>
    ${img
      ? html`<picture class="clinic__img" data-reveal>
      ${img.sources.map((s) => html`<source type="${s.type}" srcset="${s.srcset}" sizes="${img.sizes}">`)}
      <img src="${img.src}" width="${img.width}" height="${img.height}" alt="${l.name} — wnętrze" loading="lazy" decoding="async">
    </picture>`
      : ''}
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Dla kogo — dorośli, nastolatki, rodzice
// ---------------------------------------------------------------------------
function audiences(ctx) {
  const a = ctx.config.audiences;
  const shareUrl = '/?utm_source=polecenie&utm_medium=nastolatek';
  return html`<section id="dla-kogo" class="section" aria-labelledby="dla-kogo-title">
  <div class="container">
    <header class="section__head" data-reveal>
      <p class="eyebrow">${a.eyebrow}</p>
      <h2 id="dla-kogo-title" class="section__title">${a.title}</h2>
    </header>
    <ul class="audiences">
      ${a.items.map(
        (item, i) => html`<li class="audience" data-reveal style="--reveal-i:${i}">
        <h3 class="audience__title">${item.title}</h3>
        <p>${item.text}</p>
        ${item.share
          ? html`<button class="btn btn--small btn--outline audience__share" type="button" data-share data-share-url="${shareUrl}" data-share-text="${a.shareText}" hidden>${a.shareLabel}</button>
        <p class="audience__status" data-share-status role="status"></p>`
          : ''}
      </li>`,
      )}
    </ul>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Przed odbudową estetyczną — ortodoncja jako fundament licówek i bondingu
// ---------------------------------------------------------------------------
function restoration(ctx) {
  const r = ctx.config.restoration;
  return html`<section id="odbudowa" class="section section--alt restoration" aria-labelledby="odbudowa-title">
  <div class="container restoration__grid">
    <header class="restoration__head" data-reveal>
      <p class="eyebrow">${r.eyebrow}</p>
      <h2 id="odbudowa-title" class="section__title">${r.title}</h2>
    </header>
    <div class="restoration__body" data-reveal style="--reveal-i:1">
      <p class="restoration__lead">${r.lead}</p>
      <p>${r.text}</p>
      <a class="btn btn--primary" href="#rezerwacja">${r.cta}</a>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Opinie — zaproszenie do przeczytania, bez liczb
// ---------------------------------------------------------------------------
function reviews(ctx) {
  const r = ctx.config.reviews;
  return html`<section id="opinie" class="section" aria-labelledby="opinie-title">
  <div class="container">
    <div class="reviews">
      <header class="reviews__head" data-reveal>
        <p class="eyebrow">Opinie</p>
        <h2 id="opinie-title" class="section__title">${r.title}</h2>
      </header>
      <div class="reviews__meta" data-reveal style="--reveal-i:1">
        <p>${r.text}</p>
        <p>${extLink(r.url, r.linkLabel, { className: 'link link--arrow', hint: `${r.sourceName}, otwiera się w nowej karcie` })}</p>
      </div>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Pierwsza wizyta — linia postępu wypełnia się przy przewijaniu
// ---------------------------------------------------------------------------
function firstVisit(ctx) {
  return html`<section id="pierwsza-wizyta" class="section" aria-labelledby="wizyta-title">
  <div class="container">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Pierwsza wizyta</p>
      <h2 id="wizyta-title" class="section__title">${ctx.config.firstVisitTitle}</h2>
    </header>
    <ol class="steps" data-progress>
      ${ctx.config.firstVisit.map(
        (s, i) => html`<li class="step" data-reveal style="--reveal-i:${i}">
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
//  Zakres
// ---------------------------------------------------------------------------
function services(ctx) {
  return html`<section id="zakres" class="section" aria-labelledby="zakres-title">
  <div class="container">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Zakres</p>
      <h2 id="zakres-title" class="section__title">Zakres leczenia</h2>
    </header>
    <ul class="services">
      ${ctx.config.services.map(
        (s, i) => html`<li class="service" data-reveal style="--reveal-i:${i % 2}">
        <span class="service__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
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
//  Pytania i obawy
// ---------------------------------------------------------------------------
function faq(ctx) {
  return html`<section id="pytania" class="section" aria-labelledby="pytania-title">
  <div class="container narrow">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Pytania</p>
      <h2 id="pytania-title" class="section__title">${ctx.config.faqTitle}</h2>
    </header>
    <div class="faq">
      ${ctx.config.faq.map(
        (f, i) => html`<details class="faq__item" data-reveal style="--reveal-i:${Math.min(i, 3)}">
        <summary class="faq__q"><span>${f.q}</span><span class="faq__icon" aria-hidden="true"></span></summary>
        <div class="faq__a"><p>${f.a}</p></div>
      </details>`,
      )}
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Cennik (pricing.visible w configu)
// ---------------------------------------------------------------------------
function pricing(ctx) {
  const { items, note } = ctx.config.pricing;
  const rows = items.filter((i) => i.price != null);
  return html`<section id="cennik" class="section" aria-labelledby="cennik-title">
  <div class="container narrow">
    <header class="section__head" data-reveal>
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
//  Rezerwacja online — widżet ładowany dopiero po kliknięciu
// ---------------------------------------------------------------------------
function booking(ctx) {
  const { profileUrl, widgetHtml, title, text } = ctx.config.booking;
  const hasWidget = Boolean(widgetHtml && widgetHtml.trim());

  return html`<section id="rezerwacja" class="section section--alt" aria-labelledby="rezerwacja-title">
  <div class="container narrow booking">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Rezerwacja online</p>
      <h2 id="rezerwacja-title" class="section__title">${title}</h2>
    </header>
    <p>${text}</p>
    <div class="booking__action" data-reveal>
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
//  Formularz „Oddzwonimy” (Netlify Forms) — dwa kroki
// ---------------------------------------------------------------------------
// Bez JS oba kroki są widoczne naraz i działa walidacja przeglądarki (pattern).
// Z JS: krok 1 (jedno kliknięcie) → krok 2 (dane), komunikaty po polsku,
// zapis numeru jako „+48 XXX XXX XXX”.
const PHONE_PATTERN = String.raw`\s*(\+48|0048|48)?[\s\-]*(\d[\s\-]*){9}`;

function callbackForm(ctx) {
  const { form } = ctx.config;
  return html`<section id="oddzwonimy" class="section" aria-labelledby="oddzwonimy-title">
  <div class="container narrow">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Oddzwonimy</p>
      <h2 id="oddzwonimy-title" class="section__title">${form.title}</h2>
    </header>
    ${form.intro ? html`<p>${form.intro}</p>` : ''}
    <form class="form" name="${form.name}" method="POST" action="/dziekujemy" data-netlify="true" netlify-honeypot="bot-field" data-lead-form>
      <input type="hidden" name="form-name" value="${form.name}">
      <div class="hp" aria-hidden="true">
        <label>Nie wypełniaj tego pola: <input name="bot-field" tabindex="-1" autocomplete="off"></label>
      </div>
      <input type="hidden" name="utm_source">
      <input type="hidden" name="utm_medium">
      <input type="hidden" name="utm_campaign">
      <input type="hidden" name="utm_content">
      <input type="hidden" name="referrer_url">
      <input type="hidden" name="landing_url">

      <div class="form__progress" data-form-progress hidden>
        <span data-step-label>Krok 1 z 2</span>
        <span class="form__bar" aria-hidden="true"><span></span></span>
      </div>

      <div class="form__step" data-step="1" role="group" aria-labelledby="f-step1">
        <h3 class="form__step-title" id="f-step1" tabindex="-1">${form.step1} <span class="field__optional">(opcjonalnie)</span></h3>
        <div class="choices__grid">
          ${form.interests.map(
            (o) => html`<label class="choice"><input type="radio" name="leczenie" value="${o.label}"><span>${o.label}</span></label>`,
          )}
        </div>
        <div class="form__step-actions" data-step-actions hidden>
          <button class="btn btn--primary" type="button" data-next>Dalej</button>
        </div>
      </div>

      <div class="form__step" data-step="2">
        <h3 class="form__step-title" tabindex="-1">${form.step2}</h3>

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

        <div class="field consent">
          <div class="consent__row">
            <input id="f-zgoda" name="zgoda" type="checkbox" value="tak" required aria-describedby="f-zgoda-more f-zgoda-err">
            <label for="f-zgoda">${form.consentText}</label>
          </div>
          <p class="consent__more" id="f-zgoda-more">Zgodę możesz wycofać w każdej chwili. ${extLink('/polityka-prywatnosci', 'Polityka prywatności')}</p>
          <p class="field__error" id="f-zgoda-err" hidden></p>
        </div>

        ${form.callbackNote ? html`<p class="form__note">${form.callbackNote}</p>` : ''}
        <button class="btn btn--primary btn--block" type="submit">Poproś o telefon</button>
        <button class="form__back" type="button" data-back hidden>← Zmień wybór</button>
      </div>
    </form>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
//  Gdzie przyjmuję
// ---------------------------------------------------------------------------
function locations(ctx) {
  const all = visibleLocations(ctx.config);
  const main = featuredLocation(ctx.config);
  const others = all.filter((l) => l !== main);
  const card = (l, i, extra = '') => {
    const img = ctx.assets.locations[ctx.config.locations.indexOf(l)];
    return html`<li class="location${extra}" data-reveal style="--reveal-i:${i}">
        ${img && !l.featured
          ? html`<picture class="location__img">
          ${img.sources.map((s) => html`<source type="${s.type}" srcset="${s.srcset}" sizes="${img.sizes}">`)}
          <img src="${img.src}" width="${img.width}" height="${img.height}" alt="${l.name}, ${l.street}" loading="lazy" decoding="async">
        </picture>`
          : ''}
        <h3 class="location__name">${l.name}</h3>
        ${l.descriptor ? html`<p class="location__descriptor">${l.descriptor}</p>` : ''}
        <address class="location__address">${l.street}<br>${[l.postalCode, l.city].filter(Boolean).join(' ')}</address>
        ${l.note ? html`<p class="location__note">${l.note}</p>` : ''}
        <p>${extLink(mapUrl(l), 'Mapa i dojazd', { className: 'link link--arrow', hint: 'Mapy Google, otwiera się w nowej karcie' })}</p>
      </li>`;
  };
  return html`<section id="gdzie" class="section" aria-labelledby="gdzie-title">
  <div class="container">
    <header class="section__head" data-reveal>
      <p class="eyebrow">Placówki</p>
      <h2 id="gdzie-title" class="section__title">Gdzie przyjmuję</h2>
    </header>
    ${main ? html`<ul class="locations locations--main">${card(main, 0, ' location--main')}</ul>` : ''}
    ${others.length
      ? html`${main ? html`<p class="locations__also" data-reveal>Przyjmuję także w</p>` : ''}
    <ul class="locations">${others.map((l, i) => card(l, i))}</ul>`
      : ''}
  </div>
</section>`;
}

// Pasek z przyciskami na telefonach — pojawia się po przewinięciu pierwszego ekranu.
function ctaBar() {
  return html`<div class="cta-bar" data-cta-bar inert>
  <a class="btn btn--primary" href="#rezerwacja">Sprawdź terminy</a>
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
        location: locs.map((l) => ({
          '@type': 'Place',
          name: l.descriptor ? `${l.name} — ${l.descriptor}` : l.name,
          address: address(l),
          hasMap: mapUrl(l),
        })),
        areaServed: { '@type': 'City', name: person.city },
        sameAs,
      },
    ],
  };
}
