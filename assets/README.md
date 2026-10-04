# /assets — Twoje pliki

Wrzuć tutaj pliki; build sam zrobi z nich zoptymalizowane wersje (AVIF + WebP, kilka rozmiarów, z wymiarami).

| Plik | Do czego | Uwagi |
|---|---|---|
| `portret.jpg` | portret w pierwszym ekranie | pionowy, min. 1200 px szerokości; kadr 4:5 (zmiana: `images.portrait.aspect`) |
| `logo.svg` | logo w nagłówku | potem wpisz `brand.logo: 'assets/logo.svg'` w `site.config.mjs` |
| `favicon.svg` | ikona w karcie przeglądarki | kwadratowy SVG; bez pliku używany jest monogram ND |
| `og.jpg` | obrazek przy udostępnianiu linku | 1200×630 px; bez pliku używany jest neutralny obrazek z monogramem |
| `*.jpg` placówek | zdjęcie w sekcji „Gdzie przyjmuję” | wpisz ścieżkę w `locations[].image` |

Może być też `.png` lub `.webp` zamiast `.jpg`. Bez zdjęć przed/po (art. 14 ustawy o działalności leczniczej).
