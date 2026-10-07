# /assets — Twoje pliki

Wrzuć tutaj pliki; build sam zrobi z nich zoptymalizowane wersje (AVIF + WebP, kilka rozmiarów, z wymiarami).

| Plik | Do czego | Uwagi |
|---|---|---|
| `portret.jpg` | portret w pierwszym ekranie | pionowy, min. 1200 px szerokości; kadr 4:5 (zmiana: `images.portrait.aspect`) |
| `LOGO.jpg` | oryginał logo | źródło, z którego wycięto monogram |
| `logo-nd.svg` | monogram ND (wektor) | nagłówek, stopka, tło ciemnej sekcji; kolor nadaje strona (`brand.mark`) |
| `favicon.svg` | ikona w karcie przeglądarki i na ekranie telefonu | monogram z logo na ciemnym tle; build robi z niego PNG i .ico |
| `og.jpg` | obrazek przy udostępnianiu linku | 1200×630 px; bez pliku używany jest neutralny obrazek z monogramem |
| `*.jpg` placówek | zdjęcie w sekcji „Gdzie przyjmuję” | wpisz ścieżkę w `locations[].image` |

Może być też `.png` lub `.webp` zamiast `.jpg`. Bez zdjęć przed/po (art. 14 ustawy o działalności leczniczej).
