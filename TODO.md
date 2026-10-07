# TODO — do uzupełnienia przed publikacją

Aktualną listę z numerami linii wypisuje `npm run todo`. Wszystko poniżej poza sekcją D zmieniasz w [`site.config.mjs`](site.config.mjs).
Dopóki pole ma wartość `null`, dany element **nie pojawia się na stronie** (nic nie jest zmyślane).

## A. Blokujące — bez tego nie publikuj

| # | Gdzie | Co |
|---|---|---|
| 1 | ~~`admin`~~ | ✔ Zrobione (7.10.2026): lek. dent. inż. Damian Nowacki, NIP 5461384679, kontakt@drnowacki.pl |
| 2 | ~~`privacy.retention`~~ | ✔ Zrobione: do 24 miesięcy od zgłoszenia lub do wycofania zgody; dowód zgody do przedawnienia roszczeń |
| 3 | ~~polityka prywatności~~ | ✔ Zrobione: odbiorcy (Netlify, Gmail, narzędzie do listy zgłoszeń), placówki (ORTHOHOUSE, LUX MED Saska), bez znaczników TODO. Upewnij się, że skrzynka kontakt@drnowacki.pl działa |
| 4 | `form.callbackNote` | Potwierdź „Oddzwonimy w ciągu 1 dnia roboczego.” i dopisz, **kto** dzwoni |
| 5 | `form.callbackPhone` | Numer, z którego oddzwaniacie (pokazywany na /dziekujemy, żeby pacjent odebrał) |
| 6 | ~~liczba i średnia opinii~~ | Usunięte na życzenie (6.10.2026). Zostało zaproszenie do przeczytania opinii w ZnanyLekarz |
| 7 | `booking.widgetHtml` | Kod widżetu z panelu ZnanyLekarz (bez niego przycisk prowadzi do profilu) |

## B. Treści do napisania lub potwierdzenia

| # | Gdzie | Co |
|---|---|---|
| 8a | `person.hook`, `person.approach`, `audiences`, `restoration`, `faq`, `firstVisit`, `services` | Nowe, perswazyjne teksty (6.10.2026). Przeczytaj i potwierdź. Szczególnie odpowiedzi w `faq` o czasie leczenia i koszcie (oznaczone TODO) |
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
| 18 | ~~logo~~ | ✔ Zrobione (6.10.2026): monogram ND wycięty z `assets/LOGO.jpg` jako wektor `assets/logo-nd.svg` (nagłówek, stopka, tło ciemnej sekcji), favicon `assets/favicon.svg`, obrazek OG |
| 19 | ~~`assets/favicon.svg`~~ | ✔ Zrobione: monogram z logo na ciemnym tle |
| 20 | `assets/og.jpg` | (opcjonalnie) obrazek do udostępniania 1200×630. Domyślnie neutralny z monogramem |
| 21 | `locations[].image` | (opcjonalnie) zdjęcia placówek |

## D. Później

| # | Gdzie | Co |
|---|---|---|
| 22 | `pricing.items[].price`, `pricing.note`, `pricing.visible` | Cennik: ceny + `visible: true`, gdy zdecydujesz się go pokazać |
| 23 | ~~własna klinika~~ | ✔ Zrobione (7.10.2026): ORTHOHOUSE — Centrum Ortodoncji i Kompleksowej Stomatologii, widoczne już teraz jako główne miejsce. Po otwarciu usuń `note` w `locations[0]` (przycisk zmieni się z „Zapytaj o pierwsze terminy” na rezerwację online). Opcjonalnie: zdjęcie wnętrza w `locations[0].image` |
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
