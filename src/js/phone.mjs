// Polski numer telefonu: wspólna logika dla przeglądarki (walidacja formularza)
// i funkcji Netlify (zapis do Notion).

// Zwraca 9 cyfr albo null, jeśli numer jest niepoprawny.
// Usuwa spacje i myślniki oraz prefiks +48 / 0048 (a także samo „48”, gdy po nim
// zostaje dokładnie 9 cyfr — np. „48 600 123 456” wpisane bez plusa).
export function normalizePLPhone(input) {
  let s = String(input ?? '').replace(/[\s  \-‐-—]/g, '');
  if (s.startsWith('+48')) s = s.slice(3);
  else if (s.startsWith('0048')) s = s.slice(4);
  else if (s.length === 11 && s.startsWith('48')) s = s.slice(2);
  return /^\d{9}$/.test(s) ? s : null;
}

// 9 cyfr → „+48 XXX XXX XXX”
export function formatPLPhone(digits) {
  return `+48 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}
