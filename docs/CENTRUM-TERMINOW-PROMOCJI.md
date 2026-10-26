# Centrum terminów promocji

Strona właściciela: /admin/terminy-promocji (dostępna w menu administracyjnym).

## Statusy
- Aktywne — opublikowane, z terminem odleglejszym niż 3 dni albo bez daty.
- Wygasają wkrótce — opublikowane, kończą się dziś lub w ciągu następnych 3 dni.
- Wygasłe — data ważności już minęła (niezależnie od stanu publikacji).
- Szkice / wyłączone — brak publikacji, ale termin jeszcze nie minął.

Data końcowa jest włącznie z ostatnim dniem według strefy Europe/Warsaw.
Obecny Supabase pg_cron co 5 minut automatycznie oznacza wygasłe oferty jako published=false.
Nowy panel nie tworzy osobnych zadań CRON ani nie wymaga migracji.

## Weryfikacja i przedłużanie
1. Właściciel sprawdza kod, link i warunki u sprzedawcy.
2. Zaznacza potwierdzenie na karcie oferty.
3. Dla ofert aktywnych można zapisać datę weryfikacji bez zmiany widoczności.
4. Dla wygasających/wygasłych wybiera późniejszą datę i przedłuża.
5. Przedłużenie NIE przywraca publikacji wygasłych ofert wyłączonych przez CRON.
   W takim przypadku osobno opublikuj ofertę w edytorze SHEIN lub pozostałych sklepów.

API: PATCH /api/admin/offer-lifecycle. Wymagane zalogowanie, rola owner, weryfikacja same-origin,
potwierdzenie manualnego sprawdzenia, kontrola aktualności updated_at oraz prawidłowa data.
Brak klucza service_role w kodzie, uprawnienia Supabase RLS pozostają aktywne.

## Testy
node --experimental-strip-types --test tests/offer-lifecycle.test.mjs
npm run lint
npm run build

Panel nie publikuje automatycznie rabatów, nie weryfikuje kodów samodzielnie
i nie wysyła powiadomień e-mail. Ostrzeżenia o kończącym się terminie są widoczne w panelu.
