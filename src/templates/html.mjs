// Minimalny „silnik” szablonów: tagged template z automatycznym escapowaniem.
//   html`<p>${tekst}</p>`  — wartości są escapowane
//   raw(kod)               — wstawia bez escapowania (np. kod widżetu z configu)
//   tablice są łączone, null/undefined/false pomijane

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new Raw(value ?? '');

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function render(value) {
  if (value == null || value === false) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new Raw(out);
}

// ---------------------------------------------------------------------------
//  Formatowanie
// ---------------------------------------------------------------------------

export const formatDatePL = (iso) =>
  new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );

export const formatRating = (n) =>
  Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fullName = (p) => `${p.firstName} ${p.lastName}`;

export const mapUrl = (loc) =>
  loc.mapUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [loc.name, loc.street, loc.postalCode, loc.city].filter(Boolean).join(', '),
  )}`;

export const visibleLocations = (config) => config.locations.filter((l) => l.show !== false);

export const hasReviewNumbers = (r) => r.count != null && r.average != null;

// Link otwierany w nowej karcie (z informacją dla czytników ekranu).
export const extLink = (href, label, { className = 'link', hint = 'otwiera się w nowej karcie' } = {}) =>
  html`<a class="${className}" href="${href}" target="_blank" rel="noopener">${label}<span class="sr-only"> (${hint})</span></a>`;
