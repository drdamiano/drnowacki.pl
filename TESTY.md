# Checklista testów

Przed testami „na żywo” uruchom testy automatyczne:

```bash
npm test
```

Sprawdzają walidację numeru (w tym odrzucenie 8 cyfr) i mapowanie zgłoszenia na kolumny Notion (dokładne nazwy opcji, nietykalny „Status”, zachowanie bez `NOTION_TOKEN`).

Zgłoszenia testowe oznaczaj imieniem **„TEST”**, żeby łatwo je potem usunąć z Netlify i Notion.

## 1. Zgłoszenie dociera do Netlify, na e-mail i do Notion

- [ ] Otwórz `https://drnowacki.pl/?utm_source=test&utm_medium=checklista`.
- [ ] Wypełnij formularz: imię `TEST`, telefon `600 123 456`, e-mail (opcjonalnie), „Leczenie dziecka”, zgoda → **Poproś o telefon**.
- [ ] Otwiera się `/dziekujemy` z informacją, kto i kiedy oddzwoni, oraz z przyciskiem **Umów wizytę online**.
- [ ] **Netlify:** Forms → `kontakt` → zgłoszenie widoczne. `telefon` = `+48 600 123 456`, `utm_source` = `test`, `utm_medium` = `checklista`, `landing_url` wypełnione.
- [ ] **E-mail:** powiadomienie przyszło na skrzynkę (sprawdź też spam).
- [ ] **Notion:** w „LEADY IG” jest nowy wiersz: Imię i Nazwisko = `TEST`, Telefon = `600123456`, Preferencja Leczenia = **Dzieci**, Status = pusty.
- [ ] **Logi funkcji:** Logs → Functions → `submission-created` → `[notion] Zapisano zgłoszenie …`.
- [ ] Powtórz z pozostałymi opcjami. W Notion: „Niewidoczne nakładki”, „Tradycyjny aparat stały”, „Zdaję się na opinię Doktora”.

## 2. Honeypot blokuje bota

Ukryte pole `bot-field` jest niewidoczne, więc test robi się z konsoli przeglądarki (komputer, Chrome → Widok → Programista → Konsola) na `https://drnowacki.pl`:

```js
const f = document.querySelector('form[name="kontakt"]');
f.querySelector('[name="bot-field"]').value = 'jestem botem';
f.imie.value = 'TEST BOT'; f.telefon.value = '600123456'; f.zgoda.checked = true;
HTMLFormElement.prototype.submit.call(f);
```

- [ ] Przeglądarka przechodzi na `/dziekujemy` (bot „myśli”, że się udało).
- [ ] W Netlify zgłoszenie **nie** jest w zwykłej liście `kontakt` (najwyżej w *Spam submissions*).
- [ ] **Nie** przyszedł e-mail i **nie** ma wiersza w Notion.

## 3. Walidacja odrzuca 8-cyfrowy numer

- [ ] Wpisz telefon `600 123 45` → **Poproś o telefon**: formularz się **nie** wysyła, pod polem jest komunikat „Numer telefonu musi mieć 9 cyfr…”, a kursor wraca do pola.
- [ ] Bez zaznaczonej zgody: komunikat „Zaznacz zgodę…”.
- [ ] Bez imienia: komunikat „Wpisz swoje imię.”
- [ ] Przyjmowane zapisy: `600123456`, `600-123-456`, `+48 600 123 456`, `0048 600 123 456`. Każdy trafia do Netlify jako `+48 600 123 456`.
- [ ] E-mail z błędem, np. `jan@`: komunikat. Puste pole e-mail: przechodzi.

## 4. Przeglądarka w aplikacji Instagram

Na telefonie (najlepiej iPhone **i** Android):

- [ ] Wklej link z bio w wiadomości do siebie albo ustaw go w bio i kliknij z profilu.
- [ ] Strona otwiera się w przeglądarce Instagrama: fonty szeryfowe w nagłówkach, polskie znaki poprawne.
- [ ] Brak poziomego przewijania, przyciski łatwe do trafienia palcem.
- [ ] Po przewinięciu pierwszego ekranu na dole pojawia się pasek **Umów wizytę online / Oddzwońcie**. Znika przy sekcji rezerwacji i formularzu. Nie zasłania stopki.
- [ ] **Pokaż wolne terminy:** kalendarz ZnanyLekarz ładuje się w sekcji (albo, bez widżetu, otwiera się profil). Da się wybrać termin.
- [ ] Formularz: klawiatura numeryczna przy telefonie, strona nie przybliża się przy wpisywaniu, autouzupełnianie numeru działa.
- [ ] Wysłanie zgłoszenia `TEST` z Instagrama: w Netlify `utm_source` = `instagram`, `utm_medium` = `bio`.
- [ ] Link „Polityka prywatności” przy zgodzie otwiera się bez utraty wpisanych danych.
- [ ] Link „Mapa i dojazd” otwiera Mapy Google.

## 5. Lighthouse mobile (cel ≥ 95)

Najlepiej po wgraniu portretu i na produkcji (`https://drnowacki.pl`):

- [ ] https://pagespeed.web.dev → adres strony → zakładka **Mobile**: Performance ≥ 95, Accessibility, Best Practices i SEO ≥ 95.
- [ ] Albo Chrome → DevTools → Lighthouse → Mode: Navigation, Device: Mobile.

Wynik lokalny (4.10.2026, bez portretu, serwer bez kompresji): **100 / 100 / 100 / 100**, LCP 1,5 s, CLS 0, TBT 0 ms.

## 6. Pozostałe

- [ ] Brak banera cookies i brak cookies: DevTools → Application → Cookies → `drnowacki.pl` jest puste (także po kliknięciu w widżet ZnanyLekarz nie ma cookies dla `drnowacki.pl`).
- [ ] Do kliknięcia „Pokaż wolne terminy” brak zapytań do `docplanner.com`/`znanylekarz.pl` (DevTools → Network).
- [ ] `https://drnowacki.pl/nie-ma-takiej-strony` → strona 404.
- [ ] `https://drnowacki.pl/sitemap.xml` i `/robots.txt` działają.
- [ ] Podgląd linku (wyślij `https://drnowacki.pl` w wiadomości): obrazek OG, tytuł i opis.
- [ ] Dane strukturalne: https://validator.schema.org → adres strony → brak błędów.
- [ ] Klawiatura: Tab przechodzi przez stronę w logicznej kolejności, fokus jest widoczny, pierwszy Tab pokazuje „Przejdź do treści”.
- [ ] Usuń zgłoszenia `TEST` z Netlify i Notion.
