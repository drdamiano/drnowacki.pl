import { html, raw, fullName, extLink } from './html.mjs';

// Wspólny szkielet strony: <head>, nagłówek, stopka.
export function layout(ctx, page) {
  const { config, css, assets } = ctx;
  const { site } = config;
  const url = site.url + (page.path ?? '/');
  const title = page.title ?? site.title;
  const description = page.description ?? site.description;

  return html`<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
${page.noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="${site.themeColor}">
<meta name="format-detection" content="telephone=no">
<link rel="preload" href="/fonts/cormorant-garamond-pl-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jost-pl-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:site_name" content="${config.person.honorific} ${fullName(config.person)}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}${assets.og.src}">
<meta property="og:image:width" content="${assets.og.width}">
<meta property="og:image:height" content="${assets.og.height}">
<meta property="og:image:alt" content="${config.person.honorific} ${fullName(config.person)} · ${config.person.subtitle} · ${config.person.city}">
<meta name="twitter:card" content="summary_large_image">
<style>${raw(css)}</style>
${page.jsonLd ? html`<script type="application/ld+json">${raw(JSON.stringify(page.jsonLd).replaceAll('<', '\\u003c'))}</script>` : ''}
<script type="module" src="/js/main.js"></script>
</head>
<body${page.bodyClass ? html` class="${page.bodyClass}"` : ''}>
<a class="skip-link" href="#tresc">Przejdź do treści</a>
${header(ctx, page)}
<main id="tresc" tabindex="-1">
${page.body}
</main>
${footer(ctx)}
${page.after ?? ''}
</body>
</html>
`;
}

function brandMark(ctx) {
  const { brand } = ctx.config;
  const logo = ctx.assets.logo;
  if (logo) {
    return html`<img class="brand__logo" src="${logo.src}" width="${logo.width}" height="${logo.height}" alt="${brand.monogram} · ${brand.wordmark} · ${brand.tagline}">`;
  }
  return html`<span class="brand__mono">${brand.monogram}</span><span class="brand__sep" aria-hidden="true">·</span><span class="brand__name">${brand.wordmark}</span><span class="brand__tag"><span class="brand__sep" aria-hidden="true">·</span>${brand.tagline}</span>`;
}

function header(ctx, page) {
  const { config } = ctx;
  const home = page.path === '/';
  const p = home ? '' : '/'; // na podstronach linki prowadzą na stronę główną
  const items = [
    ['opinie', 'Opinie'],
    ['pierwsza-wizyta', 'Pierwsza wizyta'],
    ['zakres', 'Zakres'],
    config.pricing.visible ? ['cennik', 'Cennik'] : null,
    ['gdzie', 'Gdzie przyjmuję'],
  ].filter(Boolean);

  return html`<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/">${brandMark(ctx)}<span class="sr-only"> — strona główna</span></a>
    ${page.minimalHeader
      ? ''
      : html`<nav class="site-nav" aria-label="Sekcje strony">
      <ul>${items.map(([id, label]) => html`<li><a href="${p}#${id}">${label}</a></li>`)}</ul>
    </nav>
    <a class="btn btn--small btn--outline site-header__cta" href="${p}#rezerwacja">Umów wizytę</a>`}
  </div>
</header>`;
}

function footer(ctx) {
  const { config } = ctx;
  const { person, admin, social } = config;
  const adminLine = admin.name
    ? html`Administrator danych osobowych: ${admin.name}${admin.address ? `, ${admin.address}` : ''}${admin.nip ? `, NIP ${admin.nip}` : ''}.`
    : null;

  return html`<footer class="site-footer">
  <div class="container site-footer__inner">
    <p class="site-footer__brand">${config.brand.monogram} <span aria-hidden="true">·</span> ${fullName(person)}</p>
    <p>${person.honorific} ${fullName(person)} · ${person.subtitle} · ${person.city}${person.pwz ? html` · PWZ ${person.pwz}` : ''}</p>
    ${adminLine ? html`<p>${adminLine}</p>` : ''}
    <ul class="site-footer__links">
      <li><a href="/polityka-prywatnosci">Polityka prywatności</a></li>
      <li>${extLink(social.instagram.url, `Instagram ${social.instagram.handle}`, { className: '' })}</li>
    </ul>
    <p class="site-footer__copy">© ${new Date().getFullYear()} ${fullName(person)}</p>
  </div>
</footer>`;
}
