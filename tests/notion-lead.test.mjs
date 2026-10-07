import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.mjs';
import { leadFromSubmission, buildProperties, describeSource } from '../lib/notion-lead.mjs';

// Schemat jak w bazie „LEADY IG” (stan na 2026-10-04)
const schema = {
  'Imię i Nazwisko': { id: 'title', type: 'title' },
  Telefon: { id: 'a', type: 'number' },
  Email: { id: 'b', type: 'email' },
  'Preferencja Leczenia': {
    id: 'c',
    type: 'select',
    select: {
      options: ['Nie wiem', 'Dzieci', 'AS', 'Nakładki', 'Niewidoczne nakładki', 'Zdaję się na opinię Doktora', 'Tradycyjny aparat stały'].map(
        (name) => ({ name }),
      ),
    },
  },
  Status: { id: 'd', type: 'select' },
};

const payload = (data = {}) => ({
  id: 'sub_1',
  form_name: 'kontakt',
  created_at: '2026-10-04T10:00:00.000Z',
  data: {
    imie: 'Anna',
    telefon: '+48 600 123 456',
    email: 'anna@example.com',
    leczenie: 'Leczenie nastolatka lub dziecka',
    zgoda: 'tak',
    utm_source: 'instagram',
    utm_medium: 'bio',
    utm_campaign: '',
    utm_content: '',
    referrer_url: 'https://l.instagram.com/',
    landing_url: 'https://drnowacki.pl/?utm_source=instagram&utm_medium=bio',
    referrer: 'https://drnowacki.pl/', // pole dodawane przez Netlify
    ip: '127.0.0.1',
    ...data,
  },
});

test('mapuje zgłoszenie na istniejące właściwości bazy', () => {
  const props = buildProperties(schema, leadFromSubmission(payload(), config), config);
  assert.deepEqual(props['Imię i Nazwisko'], { title: [{ type: 'text', text: { content: 'Anna' } }] });
  assert.deepEqual(props.Telefon, { number: 600123456 }); // same cyfry, 9
  assert.deepEqual(props.Email, { email: 'anna@example.com' });
  assert.deepEqual(props['Preferencja Leczenia'], { select: { name: 'Dzieci' } });
  assert.equal(props.Status, undefined, 'Status nie może być ruszany');
  assert.deepEqual(Object.keys(props).sort(), ['Email', 'Imię i Nazwisko', 'Preferencja Leczenia', 'Telefon']);
});

test('dokładne nazwy opcji „Preferencja Leczenia”', () => {
  const expected = {
    'Nakładki': 'Niewidoczne nakładki',
    'Aparat stały': 'Tradycyjny aparat stały',
    'Leczenie nastolatka lub dziecka': 'Dzieci',
    'Nie wiem jeszcze — chcę poznać możliwości': 'Zdaję się na opinię Doktora',
  };
  for (const [label, notion] of Object.entries(expected)) {
    const props = buildProperties(schema, leadFromSubmission(payload({ leczenie: label }), config), config);
    assert.deepEqual(props['Preferencja Leczenia'], { select: { name: notion } }, label);
  }
});

test('opcja, której nie ma w Notion → opcja zastępcza (bez zmiany schematu)', () => {
  const cfg = {
    ...config,
    form: { ...config.form, interests: [...config.form.interests, { label: 'Nowa opcja', notion: 'Nowa opcja w Notion' }] },
  };
  const props = buildProperties(schema, leadFromSubmission(payload({ leczenie: 'Nowa opcja' }), cfg), cfg);
  assert.deepEqual(props['Preferencja Leczenia'], { select: { name: 'Zdaję się na opinię Doktora' } });
  // …a gdy właściciel doda opcję w Notion, zapisze się właściwa nazwa
  const s = structuredClone(schema);
  s['Preferencja Leczenia'].select.options.push({ name: 'Nowa opcja w Notion' });
  const props2 = buildProperties(s, leadFromSubmission(payload({ leczenie: 'Nowa opcja' }), cfg), cfg);
  assert.deepEqual(props2['Preferencja Leczenia'], { select: { name: 'Nowa opcja w Notion' } });
});

test('pola opcjonalne puste → nie są wysyłane', () => {
  const props = buildProperties(schema, leadFromSubmission(payload({ email: '', leczenie: '' }), config), config);
  assert.equal(props.Email, undefined);
  assert.equal(props['Preferencja Leczenia'], undefined);
});

test('Telefon typu phone_number → +48 XXX XXX XXX', () => {
  const s = { ...schema, Telefon: { type: 'phone_number' } };
  const props = buildProperties(s, leadFromSubmission(payload({ telefon: '600-123-456' }), config), config);
  assert.deepEqual(props.Telefon, { phone_number: '+48 600 123 456' });
});

test('UTM/źródło zapisywane tylko, jeśli kolumna istnieje', () => {
  const s = {
    ...schema,
    'Źródło': { type: 'select' },
    'utm_campaign': { type: 'rich_text' },
    Landing: { type: 'url' },
    'Data zgłoszenia': { type: 'date' },
  };
  const props = buildProperties(s, leadFromSubmission(payload({ utm_campaign: 'jesien' }), config), config);
  assert.deepEqual(props['Źródło'], { select: { name: 'instagram / bio' } });
  assert.deepEqual(props.utm_campaign, { rich_text: [{ type: 'text', text: { content: 'jesien' } }] });
  assert.deepEqual(props.Landing, { url: 'https://drnowacki.pl/?utm_source=instagram&utm_medium=bio' });
  assert.deepEqual(props['Data zgłoszenia'], { date: { start: '2026-10-04T10:00:00.000Z' } });
  assert.equal(props['UTM Medium'], undefined);
});

test('nazwy kolumn bez względu na wielkość liter, Status chroniony nawet przy mapowaniu', () => {
  const s = { ...schema, 'źródło': { type: 'rich_text' } };
  const cfg = { ...config, notion: { ...config.notion, optional: { ...config.notion.optional, Status: 'source' } } };
  const props = buildProperties(s, leadFromSubmission(payload(), cfg), cfg);
  assert.ok(props['źródło']);
  assert.equal(props.Status, undefined);
});

test('opis źródła', () => {
  assert.equal(describeSource({ utm_source: 'instagram', utm_medium: 'bio' }, ''), 'instagram / bio');
  assert.equal(describeSource({}, 'https://www.google.com/'), 'google.com');
  assert.equal(describeSource({}, ''), 'bezpośrednio');
});

test('funkcja Netlify bez NOTION_TOKEN kończy się bez błędu', async () => {
  delete process.env.NOTION_TOKEN;
  const { default: handler } = await import('../netlify/functions/submission-created.mjs');
  const res = await handler(new Request('http://x', { method: 'POST', body: JSON.stringify({ payload: payload() }) }));
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'skipped');
});
