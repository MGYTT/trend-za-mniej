# Wdrożenie dokumentów prawnych i transparentności — Trend za Mniej

Stan zmian: 30.10.2026. To lista czynności dla operatora serwisu, **nie certyfikat zgodności prawnej**.

## Operator — osoba fizyczna, bez wymyślonej firmy

W konfiguracji wdrożenia Vercel ustaw zmienne **serwerowe**:
- `LEGAL_OPERATOR_NAME` — prawdziwe imię i nazwisko osoby świadczącej usługę.
- `LEGAL_OPERATOR_ADDRESS` — prawdziwe miejsce zamieszkania i adres identyfikujący usługodawcę, zgodnie z art. 5 ustawy o świadczeniu usług drogą elektroniczną.

Te zmienne będą wyświetlane na podstronach **Kontakt**, **Regulamin**, **Polityka prywatności**. **Nie umieszczaj adresu domowego w repozytorium ani w plikach .env w Git.** Bez skonfigurowania obu danych podstrony pokazują ostrzeżenie. To nie oznacza spełnienia obowiązku. Rozważ niezależną konsultację sposobu realizacji obowiązku adresowego z uwagi na prywatność.

Adres kontaktowy został znaleziony w kodzie: `trendzamniej@gmail.com`. Zweryfikuj, że skrzynka istnieje, jest kontrolowana przez operatora i odbiera wiadomości. Skonfiguruj wszystkie zmienne przed wdrożeniem oraz ponownie wdroż aplikację. Nie dopisujemy NIP-u, numeru KRS ani zmyślonej firmy. Pamiętaj, że brak wpisu w CEIDG nie znosi obowiązków osoby fizycznej świadczącej usługi elektroniczne.

## Przegląd promocji SHEIN

- Baner powitalny 60% jest domyślnie wyłączony i dodatkowo wymaga serwerowej zmiennej `SHEIN_WELCOME_VERIFIED=true`. Przed ustawieniem flagi sprawdź i zachowaj warunki kampanii, źródło, datę przeglądu, ograniczenia dla nowych użytkowników oraz datę końcową `valid_until` w panelu administracyjnym. Nie włączaj flagi bez dokumentacji. Nie jest to automatyczna weryfikacja kuponu.
- Reklamowane kampanie z tabeli `shein_campaigns` wymagają `last_reviewed_at` nie starszego niż 14 dni i nieprzekroczonego `valid_until` (jeśli istnieje). Zachowaj dowody sprawdzenia warunków i uzupełniaj `last_reviewed_at` tylko po realnej weryfikacji, nie automatycznie.
- Zrezygnowano z automatycznie wyliczanego procentu rabatu i przekreślonych cen produktów: pole `oldPrice` nie potwierdza ceny najniższej z 30 dni. Jeśli ma wrócić reklama obniżek, wdroż i udokumentuj prawidłowe dane referencyjne oraz sposób ich komunikacji.
- Zweryfikuj również oferty z katalogu zewnętrznych sklepów (tabela ofert sklepowych), ceny od/do, hasła o ilościach produktów i sezonowości.

## Prywatność, skrypty i licencje

- Potwierdź w konfiguracji Vercel/Supabase rzeczywiste regiony, transfery poza EOG, rolę podmiotów oraz zasady retencji i umowy powierzenia. Zaktualizuj politykę prywatności z konkretnymi informacjami.
- Przeprowadź audyt cookies, localStorage, Vercel Web Analytics, Supabase Auth, skryptów zewnętrznych i ewentualnych pikseli reklamowych w nowej sesji przeglądarki. Jeśli niekonieczne technologie wymagają zgody — wdroż poprawny mechanizm **przed** ich uruchamianiem, z równorzędną odmową i możliwością wycofania. Nie wstawiaj pozornego banera.
- Weryfikuj licencję na zdjęcia i opisy (w tym prawa wynikające z umów afiliacyjnych); znak towarowy nie daje automatycznie prawa do kopiowania wszystkich materiałów.
- Zaktualizuj informacje o retencji, jeśli stosowane okresy w bazie okażą się inne niż wskazane w polityce.
- Sprawdź również oznaczenia treści komercyjnych na TikToku i innych kontach oraz w kampaniach poza serwisem.

## Status uzyskiwania prowizji bez zarejestrowanej działalności

Przychód z afiliacji może oznaczać zorganizowaną działalność zarobkową, mimo braku firmy. Sprawdź, czy spełniasz warunki działalności nierejestrowanej albo czy istnieje obowiązek rejestracji. W 2026 r. limit kwartalny działalności nierejestrowanej wynosi **10 813,50 zł przychodu należnego**, przy spełnieniu pozostałych warunków. Rozliczanie podatku, zagraniczne prowizje i ewentualny VAT/KSeF wymagają odrębnej weryfikacji. Brak NIP-u w stopce nie rozstrzyga obowiązków podatkowych.

## Kontrola przed publikacją

1. Uzupełnij dwie zmienne tożsamości operatora i potwierdź realny e-mail.
2. Sprawdź ręcznie stronę główną i wszystkie miejsca z linkami afiliacyjnymi (desktop i telefon), w tym stały przycisk produktu.
3. Potwierdź zgodność opisów cen i promocji z aktualnymi danymi sprzedawcy.
4. Zweryfikuj narzędzia cookies, pliki i transfery danych.
5. Uruchom `npm run test:legal`, `npm run lint`, `npm run build`.
6. Zaplanuj przegląd dokumentów i promocji po każdej istotnej zmianie technicznej.
7. Skonsultuj gotowe dokumenty z prawnikiem zajmującym się e-commerce/RODO.

Materiały źródłowe: https://uokik.gov.pl/influencer-marketing ; https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/ ; https://eli.gov.pl/api/acts/DU/2024/1513/text.html ; https://eur-lex.europa.eu/eli/reg/2016/679/oj/pol .
