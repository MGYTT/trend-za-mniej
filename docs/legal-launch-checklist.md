# Wdrożenie dokumentów prawnych i transparentności — Trend za Mniej

Stan zmian: 30.10.2026. To lista czynności dla operatora serwisu, **nie certyfikat zgodności prawnej**.

## Kontakt wyłącznie przez e-mail — decyzja operatora

Na publicznych podstronach **Kontakt**, **Regulamin** i **Polityka prywatności** pokazujemy tylko `trendzamniej@gmail.com`, bez imienia, nazwiska i adresu prywatnego. Skrzynkę należy potwierdzić jako działającą.

**Znana luka zgodności:** Art. 5 ust. 2 ustawy o świadczeniu usług drogą elektroniczną co do zasady nakazuje osobie fizycznej świadczącej zarobkową usługę internetową udostępnić także imię, nazwisko, miejsce zamieszkania i adres. Serwis z linkami afiliacyjnymi, które mogą przynosić prowizję, może podlegać temu obowiązkowi mimo braku sklepu czy działalności zarejestrowanej. **Sam e-mail nie spełnia w pełni tego wymogu.** Zmiana została dokonana zgodnie z wyraźną decyzją operatora i nie usuwa ryzyka prawnego. Nie wprowadzamy fikcyjnej firmy, NIP-u ani adresu.

Przed uznaniem strony za zgodną z prawem uzyskaj niezależną poradę prawną w zakresie art. 5 i identyfikacji administratora danych na gruncie art. 13 RODO. Szczegóły ustawy: https://eli.gov.pl/api/acts/DU/2024/1513/text.html.

## Przegląd promocji SHEIN

- Baner powitalny 60% jest domyślnie wyłączony i dodatkowo wymaga serwerowej zmiennej `SHEIN_WELCOME_VERIFIED=true`. Przed ustawieniem flagi sprawdź i zachowaj warunki kampanii, źródło, datę przeglądu, ograniczenia dla nowych użytkowników oraz datę końcową `valid_until` w panelu administracyjnym. Nie włączaj flagi bez dokumentacji. Nie jest to automatyczna weryfikacja kuponu.
- Opublikowane kampanie SHEIN z tabeli `shein_campaigns`, które nie są przeterminowane, pozostają widoczne nawet bez daty `last_reviewed_at`. Jeśli ostatnie potwierdzenie jest starsze niż 14 dni lub go brakuje, karta pokazuje wyraźne ostrzeżenie o niepotwierdzonej aktualności. To celowe: nie ukrywamy całego katalogu z powodu pustego pola. Nie prezentuj takich kodów jako gwarantowanych rabatów. Zachowaj dowody sprawdzenia warunków i aktualizuj `last_reviewed_at` tylko po realnej weryfikacji.
- Zrezygnowano z automatycznie wyliczanego procentu rabatu i przekreślonych cen produktów: pole `oldPrice` nie potwierdza ceny najniższej z 30 dni. Jeśli ma wrócić reklama obniżek, wdroż i udokumentuj prawidłowe dane referencyjne oraz sposób ich komunikacji.
- Oferty z katalogu zewnętrznych sklepów także wymagają `last_verified_at` z ostatnich 14 dni. Zweryfikuj ceny od/do, hasła o ilościach produktów i sezonowości.

## Prywatność, skrypty i licencje

- Potwierdź w konfiguracji Vercel/Supabase rzeczywiste regiony, transfery poza EOG, rolę podmiotów oraz zasady retencji i umowy powierzenia. Zaktualizuj politykę prywatności z konkretnymi informacjami.
- Przeprowadź audyt cookies, localStorage, Vercel Web Analytics, Supabase Auth, skryptów zewnętrznych i ewentualnych pikseli reklamowych w nowej sesji przeglądarki. Jeśli niekonieczne technologie wymagają zgody — wdroż poprawny mechanizm **przed** ich uruchamianiem, z równorzędną odmową i możliwością wycofania. Nie wstawiaj pozornego banera.
- Weryfikuj licencję na zdjęcia i opisy (w tym prawa wynikające z umów afiliacyjnych); znak towarowy nie daje automatycznie prawa do kopiowania wszystkich materiałów.
- Zaktualizuj informacje o retencji, jeśli stosowane okresy w bazie okażą się inne niż wskazane w polityce.
- Sprawdź również oznaczenia treści komercyjnych na TikToku i innych kontach oraz w kampaniach poza serwisem.

## Status uzyskiwania prowizji bez zarejestrowanej działalności

Przychód z afiliacji może oznaczać zorganizowaną działalność zarobkową, mimo braku firmy. Sprawdź, czy spełniasz warunki działalności nierejestrowanej albo czy istnieje obowiązek rejestracji. W 2026 r. limit kwartalny działalności nierejestrowanej wynosi **10 813,50 zł przychodu należnego**, przy spełnieniu pozostałych warunków. Rozliczanie podatku, zagraniczne prowizje i ewentualny VAT/KSeF wymagają odrębnej weryfikacji. Brak NIP-u w stopce nie rozstrzyga obowiązków podatkowych.

## Kontrola przed publikacją

1. Potwierdź realny e-mail i rozstrzygnij z prawnikiem nierozwiązany obowiązek podania danych operatora — e-mail bez danych identyfikacyjnych nie zapewnia pełnej zgodności.
2. Sprawdź ręcznie stronę główną i wszystkie miejsca z linkami afiliacyjnymi (desktop i telefon), w tym stały przycisk produktu.
3. Potwierdź zgodność opisów cen i promocji z aktualnymi danymi sprzedawcy.
4. Zweryfikuj narzędzia cookies, pliki i transfery danych.
5. Uruchom `npm run test:legal`, `npm run lint`, `npm run build`.
6. Zaplanuj przegląd dokumentów i promocji po każdej istotnej zmianie technicznej.
7. Skonsultuj gotowe dokumenty z prawnikiem zajmującym się e-commerce/RODO.

Materiały źródłowe: https://uokik.gov.pl/influencer-marketing ; https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/ ; https://eli.gov.pl/api/acts/DU/2024/1513/text.html ; https://eur-lex.europa.eu/eli/reg/2016/679/oj/pol .
