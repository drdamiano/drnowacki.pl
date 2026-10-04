import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePLPhone, formatPLPhone } from '../src/js/phone.mjs';

test('akceptuje poprawne 9-cyfrowe numery w różnych zapisach', () => {
  const ok = [
    '600123456',
    '600 123 456',
    '600-123-456',
    ' 600 12 34 56 ',
    '+48 600 123 456',
    '+48600123456',
    '0048 600 123 456',
    '0048600123456',
    '48 600 123 456', // „48” bez plusa — 11 cyfr
    '12 345 67 89', // stacjonarny
    '600 123 456', // twarde spacje (autouzupełnianie iOS)
  ];
  for (const n of ok) assert.ok(normalizePLPhone(n), `powinien przejść: "${n}"`);
  assert.equal(normalizePLPhone('+48 600 123 456'), '600123456');
  assert.equal(normalizePLPhone('0048-600-123-456'), '600123456');
  assert.equal(normalizePLPhone('48600123456'), '600123456');
});

test('odrzuca 8-cyfrowy numer (przypadek utraconego leada)', () => {
  assert.equal(normalizePLPhone('60012345'), null);
  assert.equal(normalizePLPhone('600 123 45'), null);
  assert.equal(normalizePLPhone('+48 600 123 45'), null);
});

test('odrzuca inne błędne wartości', () => {
  const bad = ['', '   ', '6001234567', '+49 600 123 456', '600 123 45a', '(600) 123 456', '+48 +48 600 123 456', null, undefined];
  for (const n of bad) assert.equal(normalizePLPhone(n), null, `powinien odpaść: "${n}"`);
});

test('formatuje jako +48 XXX XXX XXX', () => {
  assert.equal(formatPLPhone('600123456'), '+48 600 123 456');
});

test('atrybut pattern w HTML (fallback bez JS) zgadza się z walidacją JS', async () => {
  const fs = await import('node:fs/promises');
  const src = await fs.readFile(new URL('../src/templates/index.mjs', import.meta.url), 'utf8');
  const pattern = src.match(/PHONE_PATTERN = String\.raw`([^`]+)`/)[1];
  const re = new RegExp(`^(?:${pattern})$`, 'v'); // przeglądarki kompilują pattern z flagą v
  for (const n of ['600123456', '+48 600 123 456', '0048600123456', '600-123-456', '48 600 123 456']) {
    assert.ok(re.test(n), `pattern powinien przyjąć "${n}"`);
  }
  for (const n of ['60012345', '6001234567', 'abc', '+49 600 123 456']) {
    assert.ok(!re.test(n), `pattern powinien odrzucić "${n}"`);
  }
});
