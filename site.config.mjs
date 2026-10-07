// =============================================================================
//  KONFIGURACJA STRONY drnowacki.pl
// -----------------------------------------------------------------------------
//  Wszystko, co może się zmieniać, jest w tym jednym pliku: teksty, placówki,
//  opinie, cennik, widżet ZnanyLekarz, dane administratora, mapowanie Notion.
//
//  Zasady:
//  • Po zmianie: zapisz → commit → push. Netlify sam przebuduje stronę.
//  • `null` = brak danych → dany element po prostu nie pojawi się na stronie.
//  • Linie oznaczone „TODO” trzeba uzupełnić lub potwierdzić przed publikacją.
//    Listę wszystkich TODO wypisuje: npm run todo
//  • Teksty mogą przekonywać, ale nie mogą zmyślać: żadnych wymyślonych liczb,
//    terminów „na wyczerpaniu” ani obietnic efektu, których nie da się dotrzymać.
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
      'Kompleksowe leczenie ortodontyczne w Krakowie dla dorosłych, nastolatków i dzieci. Estetyka uśmiechu i przygotowanie zgryzu do licówek, bondingu i implantów. Sprawdź wolne terminy online.',
    themeColor: '#FAF8F5',
  },

  // ---------------------------------------------------------------------------
  //  Lekarz i pierwszy ekran
  // ---------------------------------------------------------------------------
  person: {
    honorific: 'lek. dent. inż.',
    firstName: 'Damian',
    lastName: 'Nowacki',
    jobTitle: 'lekarz dentysta', // używane w danych strukturalnych (JSON-LD)
    subtitle: 'Leczenie ortodontyczne',
    city: 'Kraków',
    // Hook — duże zdanie pod nazwiskiem. Pojawia się słowo po słowie. null = brak.
    // Inne propozycje:
    //   'Zmiana, którą zobaczą wszyscy. Leczenie, którego nie zauważy nikt.'
    //   'Twój uśmiech. Zaprojektowany z inżynierską precyzją.'
    hook: 'Precyzja inżyniera. Uważność lekarza.', // TODO: potwierdź
    // Krótkie zdanie pod hookiem (mniejszą czcionką). null = brak.
    approach: 'Kompleksowe leczenie ortodontyczne, które wydobywa naturalne piękno Twojego uśmiechu — w każdym wieku.', // TODO: potwierdź
    // Numer prawa wykonywania zawodu — jeśli chcesz go pokazać w stopce.
    pwz: null, // TODO (opcjonalnie): numer PWZ, np. '1234567'
  },

  // Przyciski w pierwszym ekranie i na pasku na telefonie
  cta: {
    primary: 'Sprawdź wolne terminy', // prowadzi do rezerwacji online
    secondary: 'Wolę, żeby ktoś zadzwonił', // prowadzi do formularza
    note: 'Rezerwacja online działa całą dobę.', // drobny tekst pod przyciskami; null = brak
  },

  // ---------------------------------------------------------------------------
  //  Logo i zdjęcia (pliki wrzucasz do katalogu /assets)
  // ---------------------------------------------------------------------------
  brand: {
    monogram: 'ND',
    wordmark: 'Damian Nowacki',
    tagline: 'Ortodoncja',
    // Monogram ND (wektor wycięty z assets/LOGO.jpg). Kolor nadaje strona,
    // więc działa na jasnym i ciemnym tle. null = tekstowe „ND”.
    mark: 'assets/logo-nd.svg',
    // Pełne logo jako obrazek zamiast monogramu i napisu (zwykle niepotrzebne).
    logo: null,
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
  //  Ciemna sekcja pod pierwszym ekranem — tekst rozjaśnia się słowo po słowie
  //  podczas przewijania. null = sekcja się nie pokaże.
  // ---------------------------------------------------------------------------
  manifesto: {
    eyebrow: 'Tylko między nami',
    // Wcześniejsza wersja:
    //   'Większość osób nie zauważy, że jesteś w trakcie leczenia. Zauważą dopiero efekt — i zapytają, co się zmieniło. Ty będziesz wiedzieć.'
    text: 'Nikt nie musi wiedzieć, nad czym pracujesz. Zauważą dopiero efekt — i zapytają, co się zmieniło. Ty będziesz wiedzieć.',
  },

  // ---------------------------------------------------------------------------
  //  Pasek pod pierwszym ekranem — hasła przesuwające się razem z przewijaniem.
  //  Pusta lista = pasek się nie pokaże.
  // ---------------------------------------------------------------------------
  ticker: ['Estetyka uśmiechu', 'Zgryz', 'Dorośli', 'Nastolatki', 'Dzieci', 'Przed odbudową estetyczną'],

  // ---------------------------------------------------------------------------
  //  Dla kogo — trzy grupy. `share: true` dodaje przycisk „Wyślij rodzicom”
  //  (udostępnia stronę z oznaczeniem źródła utm_source=polecenie).
  // ---------------------------------------------------------------------------
  audiences: {
    eyebrow: 'Dla kogo',
    title: 'Uśmiech nie ma metryki',
    items: [
      {
        title: 'Dorośli',
        text: 'Odkładasz to od lat? Leczenie w dorosłym wieku to dziś codzienność. Plan dopasowujemy do Twojego zgryzu, pracy i stylu życia — tak, żeby efekt był naturalny, a leczenie nie wywracało codzienności.',
      },
      {
        title: 'Nastolatki',
        text: 'Chcesz uśmiechu, z którym dobrze czujesz się na zdjęciach i na co dzień? Pokaż tę stronę rodzicom — pierwszą rozmowę zrobimy razem.',
        share: true,
      },
      {
        title: 'Rodzice',
        text: 'Zanim cokolwiek zdecydujecie, dostajecie jasny plan: co, jak długo i ile to kosztuje. Rozmawiam z dzieckiem i z Tobą — spokojnie i konkretnie.', // TODO: potwierdź
      },
    ],
    // Treść wiadomości przy „Wyślij rodzicom” (nastolatek wysyła ją rodzicowi)
    shareLabel: 'Wyślij rodzicom',
    shareText: 'Chcę porozmawiać o leczeniu ortodontycznym. Zobacz tę stronę:',
  },

  // ---------------------------------------------------------------------------
  //  Przed odbudową estetyczną (licówki, bonding, korony, implanty). null = brak.
  // ---------------------------------------------------------------------------
  restoration: {
    eyebrow: 'Przed odbudową estetyczną',
    title: 'Piękna odbudowa zaczyna się od zgryzu',
    lead: 'Myślisz o licówkach, bondingu albo koronach? Sprawdź, czy nie warto najpierw wyrównać zgryzu.',
    text: 'Gdy zęby stoją na swoim miejscu, odbudowa wygląda naturalniej, często wymaga mniej szlifowania i dłużej służy. Leczenie ortodontyczne bywa pierwszym krokiem do uśmiechu, który planujesz.', // TODO: potwierdź
    cta: 'Sprawdź swój zgryz',
  },

  // ---------------------------------------------------------------------------
  //  Opinie — bez liczb, tylko zaproszenie do przeczytania opinii w ZnanyLekarz
  // ---------------------------------------------------------------------------
  reviews: {
    sourceName: 'ZnanyLekarz',
    title: 'Nie musisz wierzyć mi na słowo',
    text: 'Pacjenci opisują swoje leczenie własnymi słowami. Przeczytaj, zanim cokolwiek zdecydujesz.',
    linkLabel: 'Przeczytaj opinie pacjentów',
    url: 'https://www.znanylekarz.pl/damian-nowacki/stomatolog/krakow',
  },

  // ---------------------------------------------------------------------------
  //  Rezerwacja online (ZnanyLekarz)
  // ---------------------------------------------------------------------------
  booking: {
    title: 'Wybierz termin. Resztę zostaw mnie.',
    text: 'Kalendarz pokazuje aktualne wolne terminy. Rezerwacja zajmuje chwilę i działa o każdej porze — także w nocy.',
    profileUrl: 'https://www.znanylekarz.pl/damian-nowacki/stomatolog/krakow',
    // Oficjalny kod widżetu z panelu ZnanyLekarz (Ustawienia → Widżety).
    // Wklej go w całości między backticki. Ładuje się dopiero po kliknięciu
    // „Pokaż wolne terminy”. Puste = przycisk prowadzi do profilu ZnanyLekarz.
    widgetHtml: ``, // TODO: wklej kod widżetu ZnanyLekarz
  },

  // ---------------------------------------------------------------------------
  //  Formularz „Oddzwonimy” — dwa kroki: 1) jedno kliknięcie, 2) dane kontaktowe
  // ---------------------------------------------------------------------------
  form: {
    name: 'kontakt', // nazwa formularza w Netlify — nie zmieniaj po wdrożeniu
    title: 'Wolisz najpierw porozmawiać?',
    intro: 'Dwa krótkie kroki. Oddzwonimy, odpowiemy na pytania i znajdziemy termin, który Ci pasuje.', // TODO: potwierdź
    step1: 'Od czego zaczynamy?',
    step2: 'Gdzie mamy zadzwonić?',
    // Jedno zdanie nad przyciskiem: kto i kiedy oddzwoni.
    callbackNote: 'Oddzwonimy w ciągu 1 dnia roboczego.', // TODO: potwierdź termin i dopisz, kto dzwoni (np. „Oddzwoni lek. dent. inż. Damian Nowacki lub asystentka…”)
    // Numer, z którego oddzwaniacie — pokazywany na stronie podziękowania,
    // żeby pacjent rozpoznał połączenie. null = nie pokazuj.
    callbackPhone: null, // TODO: np. '+48 600 000 000'
    consentText:
      'Wyrażam zgodę na przetwarzanie moich danych osobowych, w tym informacji o planowanym leczeniu, w celu kontaktu w sprawie wizyty.',
    // Opcje „Od czego zaczynamy?”. `label` widzi pacjent (i trafia do Netlify),
    // `notion` to DOKŁADNA nazwa opcji w kolumnie „Preferencja Leczenia”.
    // Jeśli takiej opcji nie ma w Notion, zapisze się `notion.interestFallback`.
    interests: [
      { label: 'Nie wiem jeszcze — chcę poznać możliwości', notion: 'Zdaję się na opinię Doktora' },
      { label: 'Leczenie nastolatka lub dziecka', notion: 'Dzieci' },
      { label: 'Aparat stały', notion: 'Tradycyjny aparat stały' },
      { label: 'Nakładki', notion: 'Niewidoczne nakładki' },
    ],
  },

  // Strona podziękowania (/dziekujemy)
  thanks: {
    nextStep: 'Podczas rozmowy odpowiemy na pytania i ustalimy dogodny termin konsultacji.', // TODO: potwierdź
  },

  // ---------------------------------------------------------------------------
  //  Pierwsza wizyta — 3 kroki (linia postępu wypełnia się przy przewijaniu)
  // ---------------------------------------------------------------------------
  firstVisitTitle: 'Od pierwszej rozmowy do decyzji',
  firstVisit: [
    {
      title: 'Rozmowa',
      text: 'Mówisz, co Ci przeszkadza. Ja słucham i oglądam zgryz. Bez oceniania i bez pośpiechu.', // TODO: przejrzyj; możesz dopisać czas trwania i koszt konsultacji
    },
    {
      title: 'Plan',
      text: 'Dostajesz konkretny plan leczenia: metodę, przybliżony czas i koszt. Czarno na białym.', // TODO: dopisz, jaka dokumentacja (np. zdjęcia RTG, skan wewnątrzustny, fotografie)
    },
    {
      title: 'Decyzja',
      text: 'Decydujesz Ty — w swoim tempie, kiedy wszystko jest jasne.', // TODO: potwierdź
    },
  ],

  // ---------------------------------------------------------------------------
  //  Zakres leczenia
  // ---------------------------------------------------------------------------
  services: [
    {
      title: 'Ortodoncja dorosłych',
      text: 'Stłoczenia, przerwy, krzywe zęby czy nieprawidłowy zgryz. Leczenie, które poprawia estetykę uśmiechu i to, jak zęby ze sobą współpracują.', // TODO: przejrzyj
    },
    {
      title: 'Nastolatki',
      text: 'Okres wzrostu to dobry moment na leczenie — łatwiej wpłynąć na rozwój zgryzu. Plan omawiamy razem z rodzicem.', // TODO: przejrzyj
    },
    {
      title: 'Dzieci',
      text: 'Wczesna ocena zgryzu pozwala wychwycić wady, zanim się utrwalą. Czasem wystarczy obserwacja, czasem krótkie leczenie.', // TODO: przejrzyj
    },
    {
      title: 'Przed odbudową estetyczną i implantami',
      text: 'Ustawienie zębów przed licówkami, bondingiem, koronami czy implantami — żeby odbudowa wyglądała naturalnie i była mniej inwazyjna.', // TODO: przejrzyj
    },
    {
      title: 'Aparaty stałe i nakładki',
      text: 'Metodę dobieram do zgryzu i Twojego stylu życia — nie odwrotnie.', // TODO: przejrzyj
      systems: [], // TODO: systemy nakładek, z którymi pracujesz, np. ['Invisalign', 'Spark']
    },
  ],

  // ---------------------------------------------------------------------------
  //  Pytania i obawy — rozwijane odpowiedzi. Usuń wpis, żeby go ukryć.
  // ---------------------------------------------------------------------------
  faqTitle: 'Pytania, które słyszę najczęściej',
  faq: [
    {
      q: 'Odkładam to od lat. Czy to jeszcze ma sens?',
      a: 'Tak. Zęby można przesuwać w każdym wieku, jeśli dziąsła i kości są zdrowe. Wiele osób zaczyna leczenie dopiero jako dorośli.',
    },
    {
      q: 'Planuję licówki lub bonding. Po co mi ortodoncja?',
      a: 'Gdy zęby stoją we właściwym miejscu, a zgryz jest wyrównany, licówki i bonding wyglądają naturalniej i dłużej służą. Często można też zachować więcej własnej tkanki zęba. Warto to sprawdzić przed rozpoczęciem odbudowy.', // TODO: potwierdź
    },
    {
      q: 'Aparat stały czy nakładki?',
      a: 'To zależy od zgryzu, nie od mody. Obie metody mają swoje miejsce — wybieramy tę, która w Twoim przypadku zadziała pewniej.',
    },
    {
      q: 'Kiedy zacząć leczenie u dziecka lub nastolatka?',
      a: 'Pierwszą kontrolę zgryzu warto zrobić około 7. roku życia. Szczególnie ważna jest też obserwacja między 9. a 12. rokiem życia — wtedy najczęściej przypada okres intensywnego wzrostu, który można wykorzystać w leczeniu.',
    },
    {
      q: 'Jestem rodzicem. Jak to wygląda z mojej strony?',
      a: 'Na konsultacji rozmawiamy razem — z dzieckiem i z Tobą. Dostajecie jasny plan: metodę, czas i koszt. Decyzję podejmujecie wspólnie, bez presji.', // TODO: potwierdź
    },
    {
      q: 'Czy to boli?',
      a: 'Przez pierwsze dni po założeniu aparatu lub kolejnej nakładki zęby mogą być wrażliwe na nacisk. To normalne i szybko mija.',
    },
    {
      q: 'Ile trwa leczenie i ile kosztuje?',
      a: 'To zależy od zgryzu i metody: od kilku miesięcy przy drobnych korektach do około dwóch lat przy złożonych wadach. Konkretny czas i koszt dostajesz w planie leczenia — zanim podejmiesz decyzję.', // TODO: potwierdź zakres; możesz dopisać cenę konsultacji
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
  //  Kolejność = kolejność na stronie. `featured: true` = główne miejsce:
  //  własna sekcja wysoko na stronie, wyróżniona karta i pierwsze miejsce
  //  w pierwszym ekranie. `show: false` ukrywa wpis bez kasowania.
  // ---------------------------------------------------------------------------
  locations: [
    {
      show: true,
      featured: true,
      name: 'ORTHOHOUSE',
      descriptor: 'Centrum Ortodoncji i Kompleksowej Stomatologii',
      street: 'ul. Kobierzyńska 145/LU5',
      postalCode: '30-382',
      city: 'Kraków',
      note: 'Przyjęcia od grudnia 2026', // usuń po otwarciu
      // Tekst w sekcji ORTHOHOUSE
      text: 'Miejsce zbudowane wokół leczenia ortodontycznego. Z czasem na rozmowę, starannie zaplanowanym leczeniem i dbałością o estetykę uśmiechu na każdym etapie — od pierwszej konsultacji do efektu końcowego.', // TODO: potwierdź / dopisz, co wyróżnia klinikę
      mapUrl: null, // null = link do Map Google wygenerowany z adresu
      image: null, // opcjonalnie zdjęcie wnętrza, np. 'assets/orthohouse.jpg'
    },
    {
      show: true,
      name: 'LUX MED',
      street: 'ul. Saska 25C',
      postalCode: null, // TODO: kod pocztowy
      city: 'Kraków',
      note: null,
      mapUrl: null,
      image: null,
    },
    {
      show: true,
      name: 'LUX MED',
      street: 'ul. Wadowicka 7',
      postalCode: null, // TODO: kod pocztowy
      city: 'Kraków',
      note: null,
      mapUrl: null,
      image: null,
    },
  ],

  // ---------------------------------------------------------------------------
  //  Administrator danych (RODO) — stopka i polityka prywatności
  // ---------------------------------------------------------------------------
  admin: {
    name: 'lek. dent. inż. Damian Nowacki',
    address: null, // adres do korespondencji (opcjonalnie)
    nip: '5461384679',
    email: 'kontakt@drnowacki.pl',
  },

  privacy: {
    updatedAt: '2026-10-07', // data ostatniej zmiany polityki prywatności
    retention:
      'Dane ze zgłoszenia przechowujemy przez czas potrzebny do kontaktu w sprawie wizyty, nie dłużej niż 24 miesiące od wysłania zgłoszenia — albo krócej, jeśli wcześniej wycofasz zgodę. Informację o udzielonej zgodzie (jej treść i datę) możemy przechowywać dłużej, do upływu terminu przedawnienia ewentualnych roszczeń, aby móc wykazać, że zgoda została udzielona (art. 6 ust. 1 lit. f RODO). Jeśli dojdzie do wizyty, dane w dokumentacji medycznej placówki są przechowywane na zasadach wynikających z przepisów o prawach pacjenta.',
    // Podmioty przetwarzające dane na zlecenie administratora (usługi techniczne)
    processors: [
      { name: 'Netlify, Inc.', role: 'hosting strony i obsługa formularza' },
      { name: 'Google Ireland Limited (Gmail)', role: 'poczta e-mail, na którą przychodzą powiadomienia o zgłoszeniach' },
      { name: null, role: 'dostawca narzędzia w chmurze, w którym prowadzimy listę zgłoszeń' },
    ],
    // Placówki, którym dane mogą być przekazane w celu umówienia wizyty
    facilities: [
      { name: 'ORTHOHOUSE — Centrum Ortodoncji i Kompleksowej Stomatologii', address: 'ul. Kobierzyńska 145/LU5, 30-382 Kraków', nip: null },
      { name: 'LUX MED', address: 'ul. Saska 25C, Kraków', nip: '5272523080' },
    ],
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
    // Gdy opcji z form.interests nie ma w kolumnie „Preferencja Leczenia”,
    // zapisuje się ta (pełny wybór pacjenta i tak jest w Netlify i w e-mailu).
    interestFallback: 'Zdaję się na opinię Doktora',
  },
};
