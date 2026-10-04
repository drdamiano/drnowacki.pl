// Zamiana zgłoszenia z Netlify Forms na właściwości strony w Notion.
// Czyste funkcje (bez sieci) — testowane w tests/notion-lead.test.mjs.

import { normalizePLPhone, formatPLPhone } from '../src/js/phone.mjs';

const clean = (v) => String(v ?? '').trim();

// Netlify payload → płaski obiekt z danymi leada.
export function leadFromSubmission(payload, config) {
  const d = payload?.data ?? {};
  const rawPhone = clean(d.telefon);
  const digits = normalizePLPhone(rawPhone);
  const interestLabel = clean(d.leczenie);
  const interest = config.form.interests.find((o) => o.label === interestLabel);

  const utm = {
    utm_source: clean(d.utm_source),
    utm_medium: clean(d.utm_medium),
    utm_campaign: clean(d.utm_campaign),
    utm_content: clean(d.utm_content),
  };
  // `referrer_url` to nasze pole (strona, z której ktoś wszedł na drnowacki.pl).
  // Netlify dodaje własne `referrer` = adres strony z formularzem — to nie to samo.
  const referrer = clean(d.referrer_url);
  const landing_url = clean(d.landing_url);

  return {
    name: clean(d.imie),
    phoneDigits: digits,
    phoneFormatted: digits ? formatPLPhone(digits) : rawPhone,
    email: clean(d.email),
    interest: interest ? interest.notion : null,
    ...utm,
    referrer,
    landing_url,
    source: describeSource(utm, referrer),
    submitted_at: clean(payload?.created_at) || new Date().toISOString(),
  };
}

// „instagram / bio”, „l.instagram.com” albo „bezpośrednio”
export function describeSource({ utm_source, utm_medium }, referrer) {
  if (utm_source) return utm_medium ? `${utm_source} / ${utm_medium}` : utm_source;
  if (referrer) {
    try {
      return new URL(referrer).hostname.replace(/^www\./, '');
    } catch {
      return referrer;
    }
  }
  return 'bezpośrednio';
}

const norm = (s) => String(s).normalize('NFC').trim().toLowerCase();

function findProperty(schema, name) {
  if (schema[name]) return { name, ...schema[name] };
  const key = Object.keys(schema).find((k) => norm(k) === norm(name));
  return key ? { name: key, ...schema[key] } : null;
}

const text = (s, max = 2000) => [{ type: 'text', text: { content: String(s).slice(0, max) } }];

// Wartość → format właściwości Notion zależnie od jej typu.
// Zwraca undefined, gdy typ nieobsługiwany albo wartość pusta.
function toNotionValue(type, value) {
  if (value == null || value === '') return undefined;
  const s = String(value);
  switch (type) {
    case 'title':
      return { title: text(s) };
    case 'rich_text':
      return { rich_text: text(s) };
    case 'number': {
      const n = Number(s.replace(/\D/g, ''));
      return s.replace(/\D/g, '') && Number.isFinite(n) ? { number: n } : undefined;
    }
    case 'phone_number':
      return { phone_number: s };
    case 'email':
      return { email: s };
    case 'url':
      return /^https?:\/\//.test(s) ? { url: s.slice(0, 2000) } : undefined;
    case 'select':
      // Notion nie pozwala na przecinki w nazwach opcji.
      return { select: { name: s.replace(/,/g, ' ').slice(0, 100) } };
    case 'multi_select':
      return { multi_select: [{ name: s.replace(/,/g, ' ').slice(0, 100) }] };
    case 'date':
      return { date: { start: s } };
    default:
      return undefined;
  }
}

// schema = data_source.properties z Notion API.
export function buildProperties(schema, lead, config) {
  const { properties: P, optional = {}, protected: locked = [] } = config.notion;
  const isLocked = (name) => locked.some((l) => norm(l) === norm(name));
  const out = {};
  const used = new Set();

  const set = (propName, value, valueForType) => {
    const def = findProperty(schema, propName);
    if (!def || isLocked(def.name) || used.has(def.name)) return;
    const v = toNotionValue(def.type, valueForType ? valueForType(def.type) : value);
    if (v !== undefined) {
      out[def.name] = v;
      used.add(def.name);
    }
  };

  // Tytuł zawsze — Notion wymaga tytułu strony.
  set(P.name, lead.name || 'Bez imienia');
  // Telefon: number → same cyfry (9), phone_number / tekst → „+48 XXX XXX XXX”.
  set(P.phone, null, (type) =>
    type === 'number' ? lead.phoneDigits || lead.phoneFormatted : lead.phoneFormatted,
  );
  set(P.email, lead.email);
  set(P.interest, lead.interest);

  for (const [propName, key] of Object.entries(optional)) {
    set(propName, lead[key]);
  }
  return out;
}
