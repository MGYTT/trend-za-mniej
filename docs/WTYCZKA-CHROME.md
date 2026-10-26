# Trendzamniej — wtyczka do Chrome (MVP)

## Architektura
- \`shein_campaigns\` (istniejące, 24 kody typu \`campaign\`) + \`extension_offers\` (tabela kuponów powiązanych ze sklepami).
- Publiczne \`GET /api/extension/offers\` udostępnia tylko opublikowane, niewygasłe dane, **bez linków afiliacyjnych**.
- \`/kody-rabatowe\` to publiczny katalog, \`/admin/kody-rabatowe\` to edytor dostępny dla właściciela.
- \`extension/\` to samodzielne rozszerzenie Chrome Manifest V3. Po kliknięciu ikony odczytuje domenę bieżącej karty (uprawnienie \`activeTab\`) i dopasowuje oferty z API.

## Uruchomienie
1. Przejrzyj migrację w \`supabase/migrations/20261026_multistore_extension_offers.sql\` i wykonaj ją na docelowym projekcie Supabase (nie wprowadzaj przykładowych, fikcyjnych kuponów).
2. Wdróż Next.js na Vercel, sprawdź \`https://trendzamniej.pl/api/extension/offers\`.
3. Wejdź do \`/admin/kody-rabatowe\`; dodaj **sprawdzony** kod nowego sklepu, domenę i opis, potwierdź weryfikację i opublikuj.
4. W Chrome: \`chrome://extensions\` → Tryb dewelopera → Załaduj rozpakowane → wskaż katalog \`extension\`.
5. Kliknij ikonę rozszerzenia na stronie sklepu. Oferty z tego sklepu będą wyświetlane jako pierwsze.

## Weryfikacja
- \`npm run test:extension\`
- \`npm run build\`
- Sprawdź, że \`GET /api/extension/offers\` nie pokazuje szkiców, wygasłych kodów ani linków afiliacyjnych.
- Publikacja do Chrome Web Store wymaga osobnego sprawdzenia polityki prywatności, ikon sklepu, polityk afiliacyjnych i warunków promocji.

## Ograniczenia
- Nie podmieniamy linków/cookies, nie testujemy automatycznie kodów w koszyku, nie śledzimy użytkownika w tle.
- SHEIN zawiera kody kampanii, a nie automatycznie działające kupony do koszyka.
- Nie dodano ofert innych sklepów bez potwierdzonego źródła. Afiliacja z poszczególnych programów wymaga sprawdzenia ich regulaminów.
- Zmiana listy promocji odbywa się w Supabase i nie wymaga każdorazowo aktualizacji wtyczki ani deploymentu.

## Etap linków do ofert (wersja 0.3)
- Tabela \`extension_offers\` zawiera opcjonalny \`destination_url\` do konkretnej promocji na domenie sklepu.
- API administracyjne pobiera domeny bezpośrednio z tabeli sklepów, a serwer ponownie sprawdza adres.
- Rozszerzenie pokazuje wyłącznie jawne przyciski i nie aktywuje afiliacji bez akcji użytkownika.
- Bezpośredni partnerzy afiliacyjni korzystający z domen przekierowujących muszą mieć oddzielną integrację i odpowiednie zgody.
