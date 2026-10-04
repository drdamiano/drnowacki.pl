# drnowacki.pl

Strona lek. dent. Damiana Nowackiego (leczenie ortodontyczne, Kraków). Zastępuje wizytówkę na bio.site i formularz Tally.

**Jedyny cel strony:** zamienić wejście w umówioną wizytę (rezerwacja online w ZnanyLekarz) albo w prośbę o telefon (krótki formularz „Oddzwonimy”).

- Statyczny HTML generowany prostym skryptem Node z **jednego pliku konfiguracyjnego** – [`site.config.mjs`](site.config.mjs).
- Bez frameworków, cookies, Google Analytics i pikseli, więc nie potrzeba banera cookies.
- Fonty hostowane lokalnie (Cormorant Garamond + Jost, woff2, podzbiór z polskimi znakami, ~68 kB łącznie).
- Formularz przez **Netlify Forms**, zgłoszenia opcjonalnie trafiają do bazy **Notion „LEADY IG”**.
- Lighthouse mobile (lokalnie, bez portretu): Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100.

---

## Spis treści

1. [Struktura](#1-struktura)
2. [Praca lokalna](#2-praca-lokalna)
3. [Zmiana treści](#3-zmiana-treści)
4. [Wdrożenie na Netlify](#4-wdrożenie-na-netlify)
5. [Formularz: wykrywanie i powiadomienia e-mail](#5-formularz-wykrywanie-i-powiadomienia-e-mail)
6. [Zapis zgłoszeń do Notion](#6-zapis-zgłoszeń-do-notion)
7. [Domena drnowacki.pl i HTTPS](#7-domena-drnowackipl-i-https)
8. [Link w bio na Instagramie](#8-link-w-bio-na-instagramie)
9. [Widżet ZnanyLekarz](#9-widżet-znanylekarz)
10. [Po uruchomieniu: wyłączenie bio.site i Tally](#10-po-uruchomieniu-wyłączenie-biosite-i-tally)
11. [Uwagi prawne](#11-uwagi-prawne)

Lista rzeczy do uzupełnienia: [TODO.md](TODO.md). Checklista testów: [TESTY.md](TESTY.md).

---

## 1. Struktura

```
site.config.mjs                  ← WSZYSTKIE treści i ustawienia (placówki, opinie, cennik, widżet, RODO, Notion)
assets/                          ← tu wrzucasz logo, portret, zdjęcia (zob. assets/README.md)
src/templates/                   ← szablony HTML (index, dziekujemy, polityka-prywatnosci, 404)
src/styles/main.css              ← style; kolory i fonty jako zmienne w :root na górze pliku
src/js/main.js                   ← jedyny skrypt: walidacja formularza, UTM, widżet na żądanie, pasek CTA
src/js/phone.mjs                 ← walidacja numeru (wspólna dla strony i funkcji Netlify)
src/fonts/                       ← fonty woff2 + licencje OFL
src/static/src/                  ← źródła faviconu i obrazka OG (monogram ND)
lib/notion-lead.mjs              ← mapowanie zgłoszenia na kolumny Notion
netlify/functions/submission-created.mjs  ← funkcja: zgłoszenie → Notion
scripts/build.mjs                ← build: config + szablony → dist/
netlify.toml                     ← konfiguracja Netlify (build, funkcje, nagłówki)
tests/                           ← testy (walidacja numeru, mapowanie Notion)
```

Build tworzy w `dist/`: `index.html`, `dziekujemy.html`, `polityka-prywatnosci.html`, `404.html`, `sitemap.xml`, `robots.txt`, favicony, obrazek OG i zoptymalizowane zdjęcia (AVIF + WebP).

## 2. Praca lokalna

Wymagany Node.js 20+ (Netlify używa 22).

```bash
npm install
```

```bash
npm run dev
```

Podgląd: http://localhost:8888. Lokalny serwer udaje Netlify: formularz przekierowuje na `/dziekujemy`, a wysłane pola wypisuje w terminalu. Niczego nie zapisuje i nie wysyła maili.

```bash
npm test
```

```bash
npm run todo
```

`npm run todo` wypisuje wszystkie TODO z `site.config.mjs`.

## 3. Zmiana treści

Wszystko, co się zmienia, jest w [`site.config.mjs`](site.config.mjs). Po zmianie: commit → push → Netlify sam przebuduje stronę (ok. 1 min).

- **`null` = brak danych**: element nie pojawi się na stronie. Nic nie jest zmyślane, np. bez liczby opinii sekcja „Opinie” pokazuje tylko link do profilu.
- **Opinie:** `reviews.count`, `reviews.average`, `reviews.updatedAt` – aktualizuj ręcznie co jakiś czas.
- **Cennik:** uzupełnij `pricing.items[].price` i ustaw `pricing.visible: true`.
- **Nowa placówka (np. własna klinika od grudnia 2026):** wpis jest już w `locations` z `show: false`. Uzupełnij dane i zmień na `show: true`. Placówka pojawi się w pierwszym ekranie, w sekcji „Gdzie przyjmuję” i w danych strukturalnych (JSON-LD).
- **Zdjęcia:** wrzuć do `assets/` (instrukcja w [assets/README.md](assets/README.md)). Build sam robi AVIF/WebP w kilku rozmiarach z `width`/`height`.
- **Kolory i fonty:** zmienne w `:root` na początku `src/styles/main.css`.

Build pilnuje zgodności z art. 14 ustawy o działalności leczniczej: przerwie się, jeśli w treści strony pojawi się „ortodonta”, „specjalista”, „dr ”, „najlepszy”, „gwarancja”, „promocja” lub „rabat”.

## 4. Wdrożenie na Netlify

1. **Repozytorium na GitHubie.** Utwórz puste prywatne repo (np. `drnowacki.pl`) na github.com, a potem w katalogu projektu:

   ```bash
   git add -A && git commit -m "Strona drnowacki.pl"
   ```

   ```bash
   git remote add origin git@github.com:TWOJ-LOGIN/drnowacki.pl.git
   ```

   ```bash
   git push -u origin main
   ```

2. **Netlify:** app.netlify.com → **Add new project → Import an existing project → GitHub** → wybierz repo.
   Ustawienia buildu wczytają się z `netlify.toml`: build command `npm run build`, publish directory `dist`, funkcje w `netlify/functions`. Nic nie zmieniaj → **Deploy**.
3. Po pierwszym deployu strona działa pod adresem `https://<nazwa>.netlify.app`. Sprawdź ją, zanim podepniesz domenę.

## 5. Formularz: wykrywanie i powiadomienia e-mail

1. **Forms → Enable form detection.** Netlify wykrywa formularze tylko podczas deployu, więc **po włączeniu zrób nowy deploy**: Deploys → Trigger deploy → Deploy project.
2. Po deployu w zakładce **Forms** powinien być widoczny formularz **`kontakt`**.
3. **Powiadomienia e-mail:** Forms → **Submission notifications** → Add notification → **Email notification** → formularz `kontakt` → Twój adres e-mail.
   Pole `email` z formularza ustawia „Odpowiedz do”, więc odpowiedź pacjentowi idzie od razu na jego adres (jeśli go podał).
4. **Spam:** zgłoszenia z wypełnionym ukrytym polem `bot-field` (honeypot) Netlify oznacza jako spam. Nie trafiają do powiadomień ani do Notion. Widać je w Forms → `kontakt` → Spam submissions.
5. Sprawdź w swoim planie Netlify miesięczny limit zgłoszeń formularzy (Forms → Usage).

Pola zgłoszenia: `imie`, `telefon` (zawsze w formacie `+48 XXX XXX XXX`), `email`, `leczenie`, `zgoda`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `referrer_url` (strona, z której ktoś przyszedł), `landing_url` (adres pierwszego wejścia). Netlify sam dopisuje jeszcze `referrer` (adres strony z formularzem), `ip` i `user_agent`. Dlatego nasze pole nazywa się `referrer_url`, a nie `referrer` – inaczej wartości by się nadpisywały.

## 6. Zapis zgłoszeń do Notion

Funkcja `netlify/functions/submission-created.mjs` uruchamia się po każdym zweryfikowanym (nie-spamowym) zgłoszeniu i dopisuje wiersz do bazy **„LEADY IG”**. **Bez zmiennej `NOTION_TOKEN` nic nie robi** i kończy się bez błędu.

1. **Integracja Notion:** https://www.notion.so/profile/integrations → **New integration** → typ *Internal*, workspace z bazą „LEADY IG”. W *Capabilities* zostaw **Read content** i **Insert content**. Skopiuj **Internal Integration Secret** (zaczyna się od `ntn_`).
2. **Udostępnij bazę integracji:** otwórz „LEADY IG” w Notion → menu **•••** (prawy górny róg) → **Connections** → dodaj swoją integrację. Bez tego API zwróci błąd `object_not_found`.
3. **Zmienne środowiskowe w Netlify:** Project configuration → **Environment variables** → Add a variable:
   - `NOTION_TOKEN` = sekret z punktu 1 (zakres: co najmniej *Functions*),
   - opcjonalnie `NOTION_DATA_SOURCE_ID`; domyślnie `3279eb4e-bba0-8020-ba7b-000bdc154d33` z configu.
4. **Zrób nowy deploy.** Funkcje widzą nowe zmienne dopiero po deployu.
5. **Logi:** Logs → Functions → `submission-created`. Udany zapis: `[notion] Zapisano zgłoszenie … (pola: …)`. Logi nie zawierają danych osobowych.

Jak działa mapowanie (sprawdzone na schemacie bazy z 4.10.2026):

| Formularz | Kolumna Notion | Zapis |
|---|---|---|
| Imię | **Imię i Nazwisko** (title) | tekst |
| Telefon | **Telefon** (number) | 9 cyfr bez +48, np. `600123456` (tak jak istniejące wpisy) |
| E-mail | **Email** (email) | jeśli podany |
| Co Cię interesuje? | **Preferencja Leczenia** (select) | Niewidoczne nakładki → „Niewidoczne nakładki”, Tradycyjny aparat stały → „Tradycyjny aparat stały”, Leczenie dziecka → „Dzieci”, Nie wiem → „Zdaję się na opinię Doktora” |
| — | **Status** | **nigdy nie jest ruszany** |

- Funkcja używa Notion API w wersji `2025-09-03`: rodzicem nowej strony jest **data source** (`parent: { type: "data_source_id", … }`), a schemat pobiera `dataSources.retrieve`. Tak każe aktualna dokumentacja Notion: przy API 2025-09-03 tworzenie stron w bazie wymaga `data_source_id`.
- Jeśli zmienisz typ kolumny **Telefon** na *Phone*, funkcja sama zacznie zapisywać `+48 XXX XXX XXX`.
- **Źródło/UTM:** schemat jest pobierany przy każdym zgłoszeniu. Wystarczy dodać w Notion kolumnę, np. **„Źródło”** (tekst albo select), a nowe zgłoszenia zaczną ją wypełniać, np. `instagram / bio`. Rozpoznawane nazwy kolumn (wielkość liter bez znaczenia) są w `site.config.mjs` → `notion.optional`: `Źródło`, `UTM Source`, `UTM Medium`, `UTM Campaign`, `UTM Content`, `Referrer`, `Strona wejścia`, `Data zgłoszenia`.

## 7. Domena drnowacki.pl i HTTPS

1. Netlify → **Domain management → Add a domain** → `drnowacki.pl` → potwierdź, a potem dodaj też `www.drnowacki.pl`. Jako domenę główną (primary) ustaw `drnowacki.pl`; `www` przekieruje na nią automatycznie.
2. DNS – jedna z dwóch opcji:
   - **Netlify DNS (najprościej):** Netlify poda 4 serwery nazw. Wpisz je u rejestratora domeny zamiast obecnych.
   - **DNS u obecnego dostawcy:** rekord **A** dla `@` → `75.2.60.5` (albo ALIAS/ANAME → `apex-loadbalancer.netlify.com`, jeśli dostawca to obsługuje) oraz **CNAME** `www` → `<nazwa>.netlify.app`. Usuń stare rekordy A/CNAME, które wskazują na bio.site.
3. **HTTPS:** po rozpropagowaniu DNS (zwykle od kilku minut do kilku godzin) Netlify sam wystawi certyfikat Let's Encrypt (Domain management → HTTPS). Gdyby nie wystawił: **Verify DNS configuration** → **Provision certificate**. HTTP przekierowuje na HTTPS automatycznie.
4. Sprawdź `https://drnowacki.pl`, `https://www.drnowacki.pl` i `http://drnowacki.pl`. Wszystkie trzy mają kończyć się na `https://drnowacki.pl/`.

## 8. Link w bio na Instagramie

```
https://drnowacki.pl/?utm_source=instagram&utm_medium=bio
```

Dzięki temu zgłoszenia z bio mają w Netlify (i w Notion, jeśli dodasz kolumnę „Źródło”) oznaczenie `instagram / bio`. Dla relacji lub postów możesz używać np. `utm_medium=stories` albo `utm_campaign=nazwa-akcji`. UTM zapamiętuje się na czas wizyty (sessionStorage, bez cookies), więc zostaje, nawet gdy ktoś przejdzie na politykę prywatności i wróci.

## 9. Widżet ZnanyLekarz

1. W panelu ZnanyLekarz znajdź kod widżetu kalendarza (zwykle: Ustawienia → Widżety / Narzędzia promocyjne) i skopiuj go w całości.
2. Wklej go w `site.config.mjs` → `booking.widgetHtml` między backticki: `` widgetHtml: `…kod…`, ``.
3. Push → po deployu na stronie jest przycisk **„Pokaż wolne terminy”**. Widżet (i cookies serwisu ZnanyLekarz) **ładuje się dopiero po kliknięciu**. Do tego czasu strona nie wysyła żadnych zapytań do ZnanyLekarz/Docplanner.
4. Bez kodu widżetu przycisk prowadzi do profilu: https://www.znanylekarz.pl/damian-nowacki/stomatolog/krakow

Mechanizm ładowania na żądanie jest sprawdzony lokalnie: przed kliknięciem nie ma żadnych zapytań, a po kliknięciu skrypt widżetu jest wstawiany i uruchamiany. **Samo wyświetlenie kalendarza trzeba sprawdzić na produkcji z prawdziwym kodem z panelu.**

## 10. Po uruchomieniu: wyłączenie bio.site i Tally

1. Zmień link w bio Instagrama (punkt 8).
2. Wyślij zgłoszenie testowe z telefonu, z przeglądarki w aplikacji Instagram (zob. [TESTY.md](TESTY.md)).
3. **Tally:** wyeksportuj dotychczasowe zgłoszenia (CSV), potem usuń formularz.
4. **bio.site:** usuń albo przekieruj wizytówkę.

## 11. Uwagi prawne

- **Polityka prywatności** to szkielet. Fragmenty `[TODO: …]` są wyróżnione na żółto i widoczne na stronie, dopóki ich nie uzupełnisz w `site.config.mjs` (`admin`, `privacy`) i w `src/templates/pages.mjs`. Treść warto zweryfikować z prawnikiem lub IOD.
- Pole „Co Cię interesuje?” może zawierać informację o zdrowiu (art. 9 RODO). Dlatego zgoda w formularzu obejmuje wprost „informacje o planowanym leczeniu”.
- Zgłoszenia są przechowywane w Netlify (USA) i, po włączeniu, w Notion (USA). Sprawdź/zaakceptuj umowy powierzenia (DPA) obu dostawców.
- Treści są informacyjne (art. 14 u.d.l.): bez cen promocyjnych, rabatów, „najlepszy”, gwarancji efektu i zdjęć przed/po. Liczba i średnia opinii z ZnanyLekarz są pokazywane z datą; treści opinii nie są kopiowane.
- Dane strukturalne (JSON-LD: `Person` + `Physician` z adresami placówek) celowo nie mają `medicalSpecialty` ani `aggregateRating`.

Fonty: Cormorant Garamond i Jost na licencji SIL Open Font License 1.1 (pliki licencji w `src/fonts/`).
