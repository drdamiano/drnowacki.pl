# TODO — do uzupełnienia przed publikacją

Aktualną listę z numerami linii wypisuje `npm run todo`. Wszystko poniżej poza sekcją D zmieniasz w [`site.config.mjs`](site.config.mjs).
Dopóki pole ma wartość `null`, dany element **nie pojawia się na stronie** (nic nie jest zmyślane).

## A. Blokujące — bez tego nie publikuj

| # | Gdzie | Co |
|---|---|---|
| 1 | `admin.name`, `admin.address`, `admin.email` (+ opcjonalnie `admin.nip`) | Administrator danych (RODO): stopka i polityka prywatności |
| 2 | `privacy.retention` | Jak długo przechowujecie zgłoszenia |
| 3 | `src/templates/pages.mjs` → `renderPrivacy` | Pozostałe `[TODO]` w polityce prywatności: weryfikacja podstaw prawnych, transfer do USA i DPA (Netlify, Notion), dostawca poczty, ewentualne przekazanie danych placówce. **Te znaczniki są widoczne na stronie.** |
| 4 | `form.callbackNote` | Potwierdź „Oddzwonimy w ciągu 1 dnia roboczego.” i dopisz, **kto** dzwoni |
| 5 | `form.callbackPhone` | Numer, z którego oddzwaniacie (pokazywany na /dziekujemy, żeby pacjent odebrał) |
| 6 | `reviews.count`, `reviews.average`, `reviews.updatedAt` | Liczba opinii, średnia i data sprawdzenia z profilu ZnanyLekarz |
| 7 | `booking.widgetHtml` | Kod widżetu z panelu ZnanyLekarz (bez niego przycisk prowadzi do profilu) |

## B. Treści do napisania lub potwierdzenia

| # | Gdzie | Co |
|---|---|---|
| 8 | `person.approach` | Jedno zdanie o podejściu (pierwszy ekran). Informacyjnie: bez „najlepszy”, bez obietnic efektu |
| 9 | `firstVisit[0].text` | Konsultacja: przejrzyj, możesz dopisać czas trwania i koszt |
| 10 | `firstVisit[1].text` | Diagnostyka: jaka dokumentacja (RTG, skan, zdjęcia) |
| 11 | `firstVisit[2].text` | Decyzja: potwierdź |
| 12 | `services[0].systems` | Systemy nakładek, z którymi pracujesz |
| 13 | `services[*].text` | Przejrzyj 4 krótkie opisy zakresu (aparaty stałe: możesz dopisać rodzaje) |
| 14 | `form.intro`, `thanks.nextStep` | Potwierdź opis tego, co dzieje się po zgłoszeniu |
| 15 | `locations[0..1].postalCode` | Kody pocztowe: Saska 25C i Wadowicka 7 |
| 16 | `person.pwz` | (opcjonalnie) numer PWZ do stopki |

## C. Pliki (wrzuć do `/assets`, opis w [assets/README.md](assets/README.md))

| # | Plik | Co |
|---|---|---|
| 17 | ~~`assets/portret.jpg`~~ | ✔ Zrobione (6.10.2026). Kadr zmienisz w `images.portrait.crop` |
| 18 | `assets/logo.svg` + `brand.logo` | Logo. Do tego czasu logotyp tekstowy „ND · DAMIAN NOWACKI · ORTODONCJA” |
| 19 | `assets/favicon.svg` | (opcjonalnie) własny favicon. Domyślnie monogram ND |
| 20 | `assets/og.jpg` | (opcjonalnie) obrazek do udostępniania 1200×630. Domyślnie neutralny z monogramem |
| 21 | `locations[].image` | (opcjonalnie) zdjęcia placówek |

## D. Później

| # | Gdzie | Co |
|---|---|---|
| 22 | `pricing.items[].price`, `pricing.note`, `pricing.visible` | Cennik: ceny + `visible: true`, gdy zdecydujesz się go pokazać |
| 23 | `locations[2]` | Własna klinika (od grudnia 2026): nazwa, adres, kod, `note`, potem `show: true` |
| 24 | Notion | Opcjonalnie kolumna „Źródło” w „LEADY IG”. Zacznie się wypełniać sama (`instagram / bio`) |

## E. Wdrożenie (szczegóły w README)

- [ ] Repo na GitHubie + podpięcie w Netlify
- [ ] Forms → Enable form detection + ponowny deploy
- [ ] Powiadomienie e-mail o zgłoszeniach (Forms → Submission notifications)
- [ ] Integracja Notion, udostępnienie bazy „LEADY IG”, `NOTION_TOKEN` w Netlify + ponowny deploy
- [ ] Domena drnowacki.pl + www, HTTPS
- [ ] Link w bio: `https://drnowacki.pl/?utm_source=instagram&utm_medium=bio`
- [ ] Testy z [TESTY.md](TESTY.md)
- [ ] Eksport zgłoszeń z Tally, usunięcie formularza Tally i wizytówki bio.site
