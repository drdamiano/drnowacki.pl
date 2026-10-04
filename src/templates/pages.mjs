import { html, fullName, formatDatePL, extLink } from './html.mjs';
import { layout } from './layout.mjs';

// ---------------------------------------------------------------------------
//  /dziekujemy — po wysłaniu formularza
// ---------------------------------------------------------------------------
export function renderThanks(ctx) {
  const { form, thanks } = ctx.config;
  const body = html`<section class="section page page--center" aria-labelledby="t-title">
  <div class="container narrow">
    <p class="eyebrow">Zgłoszenie wysłane</p>
    <h1 id="t-title" class="page__title">Dziękujemy</h1>
    <p class="page__lead">Twoja prośba o telefon do nas dotarła.</p>

    <div class="next-step">
      <h2 class="next-step__title">Co dalej</h2>
      <p>${form.callbackNote ?? 'Oddzwonimy wkrótce.'}${form.callbackPhone
        ? html` Zadzwonimy z numeru <strong class="nowrap">${form.callbackPhone}</strong> — warto go zapisać, żeby rozpoznać połączenie.`
        : ''}</p>
      ${thanks.nextStep ? html`<p>${thanks.nextStep}</p>` : ''}
    </div>

    <div class="next-step">
      <h2 class="next-step__title">Nie chcesz czekać?</h2>
      <p>Wolne terminy możesz sprawdzić od razu i zarezerwować wizytę online.</p>
      <div class="actions">
        <a class="btn btn--primary" href="/#rezerwacja">Umów wizytę online</a>
        <a class="btn btn--outline" href="/">Strona główna</a>
      </div>
    </div>
  </div>
</section>`;

  return layout(ctx, {
    path: '/dziekujemy',
    title: `Dziękujemy — ${ctx.config.person.honorific} ${fullName(ctx.config.person)}`,
    description: 'Zgłoszenie zostało wysłane.',
    noindex: true,
    minimalHeader: true,
    body,
  });
}

// ---------------------------------------------------------------------------
//  /404
// ---------------------------------------------------------------------------
export function renderNotFound(ctx) {
  const body = html`<section class="section page page--center" aria-labelledby="nf-title">
  <div class="container narrow">
    <p class="eyebrow">Błąd 404</p>
    <h1 id="nf-title" class="page__title">Nie ma takiej strony</h1>
    <p class="page__lead">Adres mógł się zmienić albo zawiera literówkę.</p>
    <div class="actions">
      <a class="btn btn--primary" href="/">Strona główna</a>
      <a class="btn btn--outline" href="/#rezerwacja">Umów wizytę online</a>
    </div>
  </div>
</section>`;

  return layout(ctx, {
    path: '/404',
    title: `Nie znaleziono strony — ${ctx.config.person.honorific} ${fullName(ctx.config.person)}`,
    description: 'Nie znaleziono strony.',
    noindex: true,
    minimalHeader: true,
    body,
  });
}

// ---------------------------------------------------------------------------
//  /polityka-prywatnosci — SZKIELET do uzupełnienia (TODO) i weryfikacji prawnej
// ---------------------------------------------------------------------------
const todo = (text) => html`<mark class="todo">[TODO: ${text}]</mark>`;

export function renderPrivacy(ctx) {
  const { admin, privacy, person } = ctx.config;
  const adminBlock = admin.name
    ? html`${admin.name}${admin.address ? html`, ${admin.address}` : ''}${admin.nip ? html`, NIP ${admin.nip}` : ''}`
    : todo('imię i nazwisko / firma administratora, adres, NIP');
  const contact = admin.email
    ? html`<a class="link" href="mailto:${admin.email}">${admin.email}</a>`
    : todo('adres e-mail do spraw danych osobowych');

  const body = html`<article class="section page prose" aria-labelledby="pp-title">
  <div class="container narrow">
    <p class="eyebrow">Informacje prawne</p>
    <h1 id="pp-title" class="page__title">Polityka prywatności</h1>
    <p class="muted small">Ostatnia aktualizacja: ${formatDatePL(privacy.updatedAt)} r.</p>

    <h2>1. Administrator danych</h2>
    <p>Administratorem danych osobowych przekazanych przez formularz na stronie drnowacki.pl jest: ${adminBlock}.</p>
    <p>Kontakt w sprawach danych osobowych: ${contact}.</p>

    <h2>2. Jakie dane zbieramy</h2>
    <p>Przez formularz „Oddzwonimy”:</p>
    <ul>
      <li>imię i numer telefonu (wymagane),</li>
      <li>adres e-mail (opcjonalnie),</li>
      <li>informację, jakim leczeniem się interesujesz (opcjonalnie) — może to być informacja o zdrowiu,</li>
      <li>informacje o źródle wejścia na stronę (parametry UTM linku, adres strony odsyłającej, adres strony wejścia),</li>
      <li>dane techniczne zapisywane przy wysłaniu formularza przez dostawcę hostingu: adres IP i informacje o przeglądarce.</li>
    </ul>

    <h2>3. Cel i podstawa prawna</h2>
    <p>Dane przetwarzamy wyłącznie po to, aby skontaktować się z Tobą w sprawie wizyty, na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO), a w zakresie informacji o planowanym leczeniu — Twojej wyraźnej zgody (art. 9 ust. 2 lit. a RODO). ${todo('zweryfikuj podstawy prawne z prawnikiem / IOD')}</p>

    <h2>4. Dobrowolność</h2>
    <p>Podanie danych jest dobrowolne, ale bez imienia, numeru telefonu i zgody nie możemy oddzwonić. Możesz też umówić wizytę online bez wypełniania formularza.</p>

    <h2>5. Odbiorcy danych</h2>
    <p>Dane mogą być przekazywane podmiotom, które świadczą dla nas usługi techniczne:</p>
    <ul>
      <li>Netlify, Inc. — hosting strony i obsługa formularza, ${todo('potwierdź podstawę transferu do USA, np. EU-US Data Privacy Framework / standardowe klauzule umowne, i zawarcie umowy powierzenia (DPA)')},</li>
      <li>Notion Labs, Inc. — narzędzie, w którym prowadzimy listę zgłoszeń, ${todo('jw. — podstawa transferu i DPA')},</li>
      <li>${todo('dostawca poczty e-mail, na którą przychodzą powiadomienia o zgłoszeniach')},</li>
      <li>${todo('ewentualnie placówka, w której umawiana jest wizyta (np. LUX MED) — jeśli dane są jej przekazywane')}.</li>
    </ul>

    <h2>6. Jak długo przechowujemy dane</h2>
    <p>${privacy.retention ?? todo('okres przechowywania, np. „do 12 miesięcy od zgłoszenia lub do wycofania zgody”')}</p>

    <h2>7. Twoje prawa</h2>
    <p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia. Zgodę możesz wycofać w każdej chwili — nie wpływa to na zgodność z prawem przetwarzania przed jej wycofaniem. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</p>

    <h2>8. Pliki cookies i usługi zewnętrzne</h2>
    <p>Strona drnowacki.pl nie używa plików cookies ani narzędzi analitycznych i reklamowych.</p>
    <p>Kalendarz wolnych terminów dostarcza serwis ZnanyLekarz (Docplanner). Ładuje się dopiero po kliknięciu „Pokaż wolne terminy” i od tej chwili działa na zasadach polityki prywatności tego serwisu, w tym może używać własnych plików cookies. Linki do ZnanyLekarz, Map Google i Instagrama prowadzą do serwisów zewnętrznych, które mają własne polityki prywatności.</p>

    <h2>9. Zmiany</h2>
    <p>O zmianach tej polityki informujemy, aktualizując datę na górze strony.</p>

    <p class="muted small">${person.honorific} ${fullName(person)} · <a class="link" href="/">drnowacki.pl</a></p>
  </div>
</article>`;

  return layout(ctx, {
    path: '/polityka-prywatnosci',
    title: `Polityka prywatności — ${person.honorific} ${fullName(person)}`,
    description: 'Informacje o przetwarzaniu danych osobowych przekazanych przez formularz na stronie drnowacki.pl.',
    body,
  });
}
