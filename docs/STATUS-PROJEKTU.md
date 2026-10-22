# Trend za Mniej — aktualny stan rozwoju

Aktualizacja: 22 października 2026 r.

## Jak działamy

- Repozytorium: https://github.com/MGYTT/trend-za-mniej
- Produkcja: `main`, commit `b08c343`, deployment Vercel READY.
- Rozwijane wydanie: `release/wydanie-02-analityka`.
- **Nie uruchamiamy GitHub Actions, nie włączamy workflowów.**
- Vercel Preview dla `release/*` jest wyłączony w konfiguracji repozytorium.
- Do czasu zakończenia kontroli nie wykonujemy merge do `main`, nowego deploymentu ani migracji produkcyjnej bazy.

## Co jest już na stronie (Wydanie 01)

1. Pięć opisanych, budżetowych stylizacji SHEIN z kartami produktów.
2. Filtry budżetu i okazji, informacje o koszcie całego zestawu bez dostawy.
3. Powiązania produktów i kategorii ze stylizacjami; nawigacja na telefonie.
4. Linki afiliacyjne przez `/go/[id]` i istniejący licznik kliknięć.
5. Linkowanie wewnętrzne, metadane SEO, dane strukturalne i przekierowania historycznych adresów.

## Co rozwijamy aktualnie (Wydanie 02)

1. **Źródło kliknięcia afiliacyjnego:** `outfit` + slug stylizacji, `product`, `unknown`.
2. **Panel `/admin/statystyki`:** raport 7/30 dni, ranking zestawów, procent kliknięć przypisanych do stylizacji i kontrola spójności sum z istniejącym licznikiem.
3. **Supabase:** przygotowana, ale niewykonana migracja `affiliate_clicks` oraz zabezpieczenia raportu RPC poprzez `SECURITY INVOKER` i istniejące RLS.
4. **Bezpieczeństwo SEO:** wykryte publiczne wywołanie uprzywilejowanej funkcji kolejki indeksowania `queue_search_index_path`. Minimalny skrypt ograniczający uprawnienia jest gotowy, ale niewykonany. Wymaga testu triggera w bazie testowej.
5. **Kontrola wydania:** testy logiki, testy SQL, test składni TypeScript/JSX i polecenie `npm run verify:release`.

## Co weryfikujemy przed publikacją

1. Ręcznie uruchomić `npm ci && npm run verify:release` w kompletnym środowisku lokalnym (bez GitHub Actions).
2. Sprawdzić migrację w bazie testowej oraz poprawność uprawnień `anon`, użytkownika i administratora.
3. Sprawdzić, czy ograniczenie uprawnień `queue_search_index_path` nie przeszkadza triggerom obsługującym zmiany produktów.
4. Zapewnić kopię bezpieczeństwa i możliwość przywracania produkcyjnej bazy.
5. Wykonać zaplanowane zmiany Supabase oraz skrypty kontrolne; następnie jednokrotnie scalić gotowy release do `main` i wdrożyć przez Vercel.
6. Po wdrożeniu sprawdzić przejścia do SHEIN, nowe statystyki, ochronę panelu administratora i widoczność SEO.

## Jak oceniamy wynik

- Liczba kliknięć do SHEIN z konkretnych stylizacji i z podstron produktów.
- Udział stylizacji w kliknięciach **o znanym źródle**. Nie jest to liczba zamówień ani prowizja.
- Czy suma kliknięć według źródeł odpowiada staremu licznikowi za taki sam okres.
- Stabilność i dostępność strony oraz efekty SEO w Search Console.

## Zasady transparentności

- Historyczne kliknięcia bez źródła są oznaczone jako `unknown`.
- Analiza źródła przez parametr URL jest orientacyjna i może być manipulowana; nie służy do rozliczania sprzedaży.
- Nie tworzymy nowego systemu identyfikacji użytkowników, cookies ani zapisywania IP.
- Nie deklarujemy pełnej gotowości do produkcji bez przejścia `npm run build` i testów SQL.
- Ostrzeżenie dotyczące kolejki SEO wciąż dotyczy **aktualnej produkcyjnej bazy**, dopóki przygotowana poprawka nie zostanie zastosowana.

## Najnowszy krok kontroli jakości

Zabezpieczono rozpoznawanie pochodzenia kliknięć przed wielokrotnymi i sprzecznymi parametrami URL. Testy odzwierciedlają wszystkie produkty z pięciu redakcyjnych stylizacji. Zmiana nie dotyka Supabase ani publicznych tras — dotyczy tylko nieopublikowanego Wydania 02.

## Blokady publikacji sprawdzone 22.10.2026

- Baza jest na Supabase Free, brak potwierdzonej kopii pozwalającej odtworzyć produkcję. Przygotowano `scripts/backup-supabase-before-release.ps1` i `docs/BACKUP-I-DEPLOY-02.md` z wariantem PostgreSQL Client Tools bez Dockera, ale kopia nie została wykonana.
- Lokalny pełny Next.js build nadal niedostępny (brak pobranych zależności i możliwości sklonowania repozytorium ze środowiska uruchomieniowego).
- W repozytorium dodano kontraktowe testy powiązań przycisków afiliacyjnych z trasą `/go` oraz migracją uprawnień.
- **Nie wdrażać do produkcji** dopóki nie potwierdzimy kopii, testu jej odtworzenia, migracji testowych i pełnego `npm run verify:release`.

## ESLint na Windows — 22.10.2026

Użytkownik uruchomił pełną kontrolę; zatrzymała się na 15 błędach ESLint (14 × React `set-state-in-effect`, 1 × nawigacja `<a>` w loginie) i 22 ostrzeżeniach. Link do strony głównej zastąpiono `next/link`; dla 9 starszych komponentów zamieniono jedynie rangę wskazanej reguły na ostrzeżenie. Dokładny wykaz wyjątków i plan trwałej refaktoryzacji: [LINT-REVIEW-02.md](./LINT-REVIEW-02.md). Ta zmiana nie oznacza, że efekty React zostały naprawione. Wymagane ponowne `npm run verify:release` na Windows.

## Potwierdzony build Windows — 22.10.2026

- `npm run verify:release` — **PASS**, w tym `npm run build` (Next.js 16.4.0, TypeScript i generowanie 32 stron statycznych).
- `npm audit --omit=dev` — **0 podatności zależności produkcyjnych**. Bez tego wniosku o pełnym bezpieczeństwie narzędzi deweloperskich.
- Supabase Free: kopia bazy i test odtwarzania **nadal niepotwierdzone**. Dodano PowerShell `scripts/backup-supabase-before-release.ps1`, wymagający tylko klienta PostgreSQL 17 (`pg_dump`, `pg_restore`), bez Dockera.
- Kolejka SEO nadal ma `EXECUTE` dla `anon`; poprawkę SQL wykonamy po testach i kopii.

## Bez Dockera — korekta procedury

Usunięto skrypt bash zależny od Docker/Supabase CLI; pozostawiono tylko PowerShell z natywnym klientem PostgreSQL dla schematu `public`. Kopia nie obejmuje Auth/Storage i wymaga osobnej próby odtworzenia. Projekt nie zmienia sposobu hostingu ani wdrażania.
