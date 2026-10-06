// =============================================================================
//  KONFIGURACJA STRONY drnowacki.pl
// -----------------------------------------------------------------------------
//  Wszystko, co może się zmieniać, jest w tym jednym pliku: teksty, placówki,
//  opinie, cennik, widżet ZnanyLekarz, dane administratora, mapowanie Notion.
//
//  Zasady:
//  • Po zmianie: zapisz → commit → push. Netlify sam przebuduje stronę.
//  • `null` = brak danych → dany element po prostu nie pojawi się na stronie
//    (nic nie jest zmyślane).
//  • Linie oznaczone „TODO” trzeba uzupełnić lub potwierdzić przed publikacją.
//    Listę wszystkich TODO wypisuje: npm run todo
//  • Treść ma charakter informacyjny (art. 14 ustawy o działalności leczniczej):
//    bez promocji, rabatów, „najlepszy”, gwarancji efektu, zdjęć przed/po.
//    Tytuły: „lek. dent. inż.”, „leczenie ortodontyczne” (nie „ortodonta”, nie „dr”).
// =============================================================================

export default {
  // ---------------------------------------------------------------------------
  //  Strona i SEO
  // ---------------------------------------------------------------------------
  site: {
    url: 'https://drnowacki.pl',
    title: 'lek. dent. inż. Damian Nowacki — leczenie ortodontyczne, Kraków',
    description:
      'Leczenie ortodontyczne w Krakowie: nakładki ortodontyczne, aparaty stałe, leczenie dzieci. Opinie pacjentów, wolne terminy online i informacje o pierwszej wizycie.',
    themeColor: '#FAF8F5',
  },

  // ---------------------------------------------------------------------------
  //  Lekarz
  // ---------------------------------------------------------------------------
  person: {
    honorific: 'lek. dent. inż.',
    firstName: 'Damian',
    lastName: 'Nowacki',
    jobTitle: 'lekarz dentysta', // używane w danych strukturalnych (JSON-LD)
    subtitle: 'Leczenie ortodontyczne',
    city: 'Kraków',
    // Jedno zdanie o podejściu, wyświetlane w pierwszym ekranie pod nazwiskiem.
    approach: null, // TODO: jedno zdanie o podejściu do leczenia (informacyjnie, bez „najlepszy”, bez obietnic efektu)
    // Numer prawa wykonywania zawodu — jeśli chcesz go pokazać w stopce.
    pwz: null, // TODO (opcjonalnie): numer PWZ, np. '1234567'
  },

  // ---------------------------------------------------------------------------
  //  Logo i zdjęcia (pliki wrzucasz do katalogu /assets)
  // ---------------------------------------------------------------------------
  brand: {
    monogram: 'ND',
    wordmark: 'Damian Nowacki',
    tagline: 'Ortodoncja',
    // Gdy wgrasz logo, wpisz ścieżkę, np. 'assets/logo.svg' (SVG lub PNG).
    // Do tego czasu w nagłówku jest logotyp tekstowy „ND · DAMIAN NOWACKI · ORTODONCJA”.
    logo: null, // TODO: 'assets/logo.svg'
  },

  images: {
    // Portret w pierwszym ekranie. Wrzuć JPG/PNG/WebP — build sam zrobi AVIF + WebP
    // w kilku rozmiarach. Dopóki pliku nie ma, wyświetla się neutralny placeholder.
    portrait: {
      src: 'assets/portret.jpg',
      alt: 'lek. dent. inż. Damian Nowacki',
      aspect: [4, 5], // proporcje kadru (szerokość, wysokość)
      // Wycinek z oryginalnego zdjęcia (w pikselach oryginału 1335×2000).
      // Plik zostaje nietknięty — żeby zmienić kadr, zmień liczby. null = cały kadr.
      crop: { left: 110, top: 220, width: 1040, height: 1300 },
    },
    // Własny obrazek do udostępniania linku (Open Graph), 1200×630 px.
    // Jeśli pliku nie ma, używany jest neutralny obrazek z monogramem ND.
    og: 'assets/og.jpg',
  },

  // ---------------------------------------------------------------------------
  //  Opinie (ZnanyLekarz) — tylko liczby, bez kopiowania treści opinii
  // ---------------------------------------------------------------------------
  reviews: {
    sourceName: 'ZnanyLekarz',
    count: null, // TODO: liczba opinii z profilu ZnanyLekarz, np. 87
    average: null, // TODO: średnia ocena, np. 4.9
    updatedAt: null, // TODO: data sprawdzenia liczb, format 'RRRR-MM-DD', np. '2026-10-04'
    url: 'https://www.znanylekarz.pl/damian-nowacki/stomatolog/krakow',
  },

  // ---------------------------------------------------------------------------
  //  Rezerwacja online (ZnanyLekarz)
  // ---------------------------------------------------------------------------
  booking: {
    profileUrl: 'https://www.znanylekarz.pl/damian-nowacki/stomatolog/krakow',
    // Oficjalny kod widżetu z panelu ZnanyLekarz (Ustawienia → Widżety).
    // Wklej go w całości między backticki. Ładuje się dopiero po kliknięciu
    // „Pokaż wolne terminy”. Puste = przycisk prowadzi do profilu ZnanyLekarz.
    widgetHtml: ``, // TODO: wklej kod widżetu ZnanyLekarz
  },

  // ---------------------------------------------------------------------------
  //  Formularz „Oddzwonimy”
  // ---------------------------------------------------------------------------
  form: {
    name: 'kontakt', // nazwa formularza w Netlify — nie zmieniaj po wdrożeniu
    intro: 'Zostaw imię i numer telefonu. Oddzwonimy, odpowiemy na pytania i ustalimy termin wizyty.', // TODO: potwierdź
    // Jedno zdanie nad przyciskiem: kto i kiedy oddzwoni.
    callbackNote: 'Oddzwonimy w ciągu 1 dnia roboczego.', // TODO: potwierdź termin i dopisz, kto dzwoni (np. „Oddzwoni lek. dent. inż. Damian Nowacki lub asystentka…”)
    // Numer, z którego oddzwaniacie — pokazywany na stronie podziękowania,
    // żeby pacjent rozpoznał połączenie. null = nie pokazuj.
    callbackPhone: null, // TODO: np. '+48 600 000 000'
    consentText:
      'Wyrażam zgodę na przetwarzanie moich danych osobowych, w tym informacji o planowanym leczeniu, w celu kontaktu w sprawie wizyty.',
    // Opcje „Co Cię interesuje?”. `label` widzi pacjent (i trafia do Netlify),
    // `notion` to DOKŁADNA nazwa opcji w kolumnie „Preferencja Leczenia”.
    interests: [
      { label: 'Niewidoczne nakładki', notion: 'Niewidoczne nakładki' },
      { label: 'Tradycyjny aparat stały', notion: 'Tradycyjny aparat stały' },
      { label: 'Leczenie dziecka', notion: 'Dzieci' },
      { label: 'Nie wiem — zdaję się na lekarza', notion: 'Zdaję się na opinię Doktora' },
    ],
  },

  // Strona podziękowania (/dziekujemy)
  thanks: {
    nextStep: 'Podczas rozmowy odpowiemy na pytania i ustalimy dogodny termin konsultacji.', // TODO: potwierdź
  },

  // ---------------------------------------------------------------------------
  //  Jak wygląda pierwsza wizyta — 3 kroki
  // ---------------------------------------------------------------------------
  firstVisit: [
    {
      title: 'Konsultacja',
      text: 'Rozmawiamy o tym, co chcesz zmienić, i oglądam zgryz. Dowiesz się, czy leczenie jest wskazane i jakie są możliwe sposoby.', // TODO: przejrzyj; możesz dopisać czas trwania i koszt
    },
    {
      title: 'Diagnostyka i plan leczenia',
      text: 'Na podstawie dokumentacji przygotowuję plan leczenia: proponowaną metodę, przybliżony czas trwania i koszt.', // TODO: dopisz, jaka dokumentacja (np. zdjęcia RTG, skan wewnątrzustny, fotografie)
    },
    {
      title: 'Decyzja',
      text: 'Decyzję o rozpoczęciu leczenia podejmujesz po zapoznaniu się z planem — nie musisz decydować podczas pierwszej wizyty.', // TODO: potwierdź
    },
  ],

  // ---------------------------------------------------------------------------
  //  Zakres leczenia
  // ---------------------------------------------------------------------------
  services: [
    {
      title: 'Nakładki ortodontyczne',
      text: 'Przezroczyste, zdejmowane nakładki wymieniane zgodnie z planem leczenia. Zdejmuje się je do jedzenia i mycia zębów.', // TODO: przejrzyj
      systems: [], // TODO: systemy nakładek, z którymi pracujesz, np. ['Invisalign', 'Spark']
    },
    {
      title: 'Aparaty stałe',
      text: 'Zamki przyklejane do zębów i łuk, który stopniowo przesuwa zęby. Leczenie wymaga regularnych wizyt kontrolnych.', // TODO: przejrzyj; możesz dopisać rodzaje (metalowe, estetyczne)
    },
    {
      title: 'Leczenie dzieci',
      text: 'Ocena rozwoju zgryzu u dzieci i leczenie dopasowane do wieku oraz etapu wymiany zębów.', // TODO: przejrzyj
    },
    {
      title: 'Przed leczeniem protetycznym i implantologicznym',
      text: 'Ustawienie zębów i przygotowanie miejsca przed koronami, mostami lub implantami, w porozumieniu z lekarzem prowadzącym dalsze leczenie.', // TODO: przejrzyj
    },
  ],

  // ---------------------------------------------------------------------------
  //  Cennik — sekcja gotowa, domyślnie ukryta
  // ---------------------------------------------------------------------------
  pricing: {
    visible: false, // true = pokaż sekcję na stronie
    note: 'Koszt całego leczenia zależy od planu ustalonego po diagnostyce.', // TODO: potwierdź
    items: [
      // price: tekst, np. '250 zł' albo 'od 6000 zł'. null = pozycja się nie pokaże.
      { name: 'Konsultacja', price: null }, // TODO
      { name: 'Diagnostyka i plan leczenia', price: null }, // TODO
      { name: 'Nakładki ortodontyczne', price: null }, // TODO
      { name: 'Aparat stały (jeden łuk)', price: null }, // TODO
      { name: 'Wizyta kontrolna', price: null }, // TODO
    ],
  },

  // ---------------------------------------------------------------------------
  //  Gdzie przyjmuję
  //  Nowa placówka = nowy wpis. `show: false` ukrywa wpis bez kasowania.
  // ---------------------------------------------------------------------------
  locations: [
    {
      show: true,
      name: 'LUX MED Stomatologia',
      street: 'ul. Saska 25C',
      postalCode: null, // TODO: kod pocztowy
      city: 'Kraków',
      note: null, // np. 'Wejście od…', 'Parking dla pacjentów'
      mapUrl: null, // null = link do Map Google wygenerowany z adresu
      image: null, // opcjonalnie zdjęcie placówki, np. 'assets/saska.jpg'
    },
    {
      show: true,
      name: 'LUX MED Stomatologia',
      street: 'ul. Wadowicka 7',
      postalCode: null, // TODO: kod pocztowy
      city: 'Kraków',
      note: null,
      mapUrl: null,
      image: null,
    },
    {
      // Własna klinika — od grudnia 2026. Uzupełnij dane i zmień show na true.
      show: false,
      name: 'Nazwa kliniki', // TODO: nazwa własnej kliniki
      street: 'ul. …', // TODO: adres
      postalCode: null, // TODO
      city: 'Kraków',
      note: 'Od grudnia 2026', // TODO: zmień lub usuń po otwarciu
      mapUrl: null,
      image: null,
    },
  ],

  // ---------------------------------------------------------------------------
  //  Administrator danych (RODO) — stopka i polityka prywatności
  // ---------------------------------------------------------------------------
  admin: {
    name: null, // TODO: np. 'Damian Nowacki, prowadzący działalność gospodarczą pod firmą …'
    address: null, // TODO: adres do korespondencji
    nip: null, // TODO (opcjonalnie): NIP
    email: null, // TODO: e-mail do spraw danych osobowych
  },

  privacy: {
    updatedAt: '2026-10-04', // data ostatniej zmiany polityki prywatności
    retention: null, // TODO: jak długo przechowujecie zgłoszenia, np. 'do 12 miesięcy od zgłoszenia lub do wycofania zgody'
  },

  social: {
    instagram: { handle: '@drnowacki', url: 'https://www.instagram.com/drnowacki/' },
  },

  // ---------------------------------------------------------------------------
  //  Notion — zapis zgłoszeń do bazy „LEADY IG”
  //  Włączany zmienną środowiskową NOTION_TOKEN w Netlify (bez niej: wyłączony).
  // ---------------------------------------------------------------------------
  notion: {
    // Data source bazy „LEADY IG”. Można nadpisać zmienną NOTION_DATA_SOURCE_ID.
    dataSourceId: '3279eb4e-bba0-8020-ba7b-000bdc154d33',
    databaseId: '3279eb4ebba080499cc0c86805d65812', // informacyjnie
    // Właściwości główne (muszą istnieć w bazie).
    properties: {
      name: 'Imię i Nazwisko', // title
      phone: 'Telefon', // number (same cyfry) lub phone_number (+48 XXX XXX XXX)
      email: 'Email', // email
      interest: 'Preferencja Leczenia', // select
    },
    // Właściwości dodatkowe — zapisywane TYLKO jeśli istnieją w bazie
    // (wielkość liter bez znaczenia). Lewa strona: nazwa kolumny w Notion,
    // prawa: co do niej trafia. Dostępne wartości: source (np. „instagram / bio”),
    // utm_source, utm_medium, utm_campaign, utm_content, referrer, landing_url,
    // submitted_at (data zgłoszenia).
    optional: {
      'Źródło': 'source',
      'Zrodlo': 'source',
      'UTM Source': 'utm_source',
      'utm_source': 'utm_source',
      'UTM Medium': 'utm_medium',
      'utm_medium': 'utm_medium',
      'UTM Campaign': 'utm_campaign',
      'utm_campaign': 'utm_campaign',
      'UTM Content': 'utm_content',
      'utm_content': 'utm_content',
      'Referrer': 'referrer',
      'Strona odsyłająca': 'referrer',
      'Landing': 'landing_url',
      'Strona wejścia': 'landing_url',
      'Data zgłoszenia': 'submitted_at',
    },
    // Tych właściwości funkcja nigdy nie zapisuje.
    protected: ['Status'],
  },
};
