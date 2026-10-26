# Trendzamniej: katalog sklepów i rozszerzenie zakupowe

## Gotowe w tym etapie
- Wyszukiwarka sklepów: \`/kody-rabatowe\` — ulubione przechowywane lokalnie w przeglądarce.
- Strony sklepów: \`/kody-rabatowe/[slug]\`, tylko opublikowane sklepy i powiązane oferty.
- Administrator: \`/admin/kody-rabatowe\` — publikacja sklepów, kuponów i kodów kampanii.
- API: \`/api/extension/offers\`, wersja 2 z katalogiem sklepów i ofert bez linków afiliacyjnych.
- Chrome Manifest V3: lokalne rozpoznanie domeny, licznik ofert na ikonie po załadowaniu strony, katalog i kopiowanie kodów w popupie. Wymaga uprawnienia \`tabs\` do odczytu adresów kart; **adresy kart nie są wysyłane do Trendzamniej**.

## Cashback — NIEAKTYWNY
W Supabase \`cashback_state\` może mieć tylko \`unavailable\` lub \`preparing\`.
Nie ma obecnie aktywacji cashbacku, panelu salda, zwrotów, integracji transakcji ani wypłat.
Prowizja dla wydawcy afiliacyjnego nie jest zwrotem dla klienta.

Aby uruchomić prawdziwy cashback:
1. Podpisać/zweryfikować regulaminy programów afiliacyjnych dla rozwiązań cashback i rozszerzeń.
2. Wdrożyć identyfikatory kliknięć/subID oraz potwierdzone importy transakcji lub webhooki z sieci.
3. Dodać prywatne konta użytkowników, bezpieczną księgę zdarzeń, stany transakcji (pending/approved/rejected), rozliczenia po akceptacji i rezerwy na zwroty.
4. Dodać wypłaty, warunki cashbacku, sprawdzenia podatkowe, RODO, zasady sporów, retencję danych i zgodę użytkownika.
5. Dopiero wtedy aktywować przycisk „Aktywuj cashback” i faktyczne stawki dla obsługiwanych sklepów.

## Automatyczne testowanie kodów
Nie jest uniwersalnie dostępne dla dowolnego sklepu. Każdy adapter sklepu wymaga sprawdzenia regulaminu,
prawidłowego kontekstu koszyka i zgody użytkownika. Nie wolno stosować kodów, linków ani plików cookie po cichu.
W MVP kod można skopiować i sprawdzić w sklepie samodzielnie.

## Wdrożenie
1. Zastosuj addytywną migrację \`supabase/migrations/20261026_store_directory_cashback_preview.sql\`.
2. Uruchom \`npm run test:extension\` i \`npm run build\`.
3. Po teście podglądowym Vercel scal zmiany do \`main\`; deployment produkcyjny uruchamia się przez Git.
4. Wejdź w panel kodów; dodaj sprawdzone sklepy, opublikuj, a potem przypisz do nich kupony.
5. Lokalnie Chrome: \`chrome://extensions\` → tryb programisty → załaduj katalog \`extension\`.
6. Przed Chrome Web Store przygotuj politykę prywatności, jawne ujawnienie afiliacji i wyjaśnienie uprawnienia \`tabs\`.
