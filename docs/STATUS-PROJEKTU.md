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

## Uproszczona procedura bez instalowania programów — 22.10.2026

Nowy przewodnik: [WYDANIE-02-PROSTO.md](./WYDANIE-02-PROSTO.md). Sprawdzono odczytem bazę: 100 produktów, 34 kliknięcia, 37 przekierowań, 110 wpisów aktywności, 603 rekordy kolejki SEO, po dwa rekordy administratorów i obecności; RLS we wszystkich siedmiu tabelach. Brak osieroconych kliknięć i przekierowań. Jedyny prosty krok użytkownika to eksport pełnych CSV z tabel `products` i `affiliate_clicks` w panelu Supabase; **nie jest to pełny backup** i nie usuwa potrzeby planu przywracania. Migracja nie wykonana. W SQL dodano `lock_timeout`, `statement_timeout` i kontrolę RLS/anon przed zmianami.

## Kontrola końcowa po zapisaniu CSV — 22.10.2026

Użytkownik potwierdził zapis eksportów `public.products` i `public.affiliate_clicks` jako CSV poza repozytorium. To **kopia wierszy dwóch tabel**, nie backup całej bazy. Nie znamy integralności ani możliwości odtworzenia plików i nie wolno uznawać zadania backupu/restore za zaliczone.

Odczyt Supabase (bez zapisywania lub zmiany schematu):

- `products`: 100 (97 aktywnych); `affiliate_clicks`: 34 (7 z ostatnich 7 dni, 34 z 30 dni);
- `product_slug_redirects`: 37; `product_activity`: 110; `search_index_queue`: 603; `admins`: 2; `admin_presence`: 2;
- RLS = true na wszystkich siedmiu tabelach; dla `affiliate_clicks` rola `anon` nie ma `SELECT` ani `INSERT`;
- 0 osieroconych kliknięć, 0 osieroconych przekierowań;
- preflight: 0/2 nowych kolumn `source_type`/`outfit_slug` (migracja niewykonana);
- read-only symulacja domyślnego źródła `unknown`: raport 7 dni = **7/7**, 30 dni = **34/34**;
- właścicielem `queue_search_index_path` i trigger-funkcji `queue_product_index_change` jest `postgres` (obie `SECURITY DEFINER`); bezpośrednie `EXECUTE` kolejki nadal dostępne dla `anon` — do zabezpieczenia;
- lokalny build Windows i `npm audit --omit=dev` już zaliczone wcześniej.

**Wniosek:** raport logicznie zgodny z istniejącymi danymi; kod i zmiana są addytywne. Migracja SQL, zmiana uprawnień i deployment pozostają NIEURUCHOMIONE do czasu zweryfikowania strategii przywracania. Nie włączamy płatnych usług ani GitHub Actions.

## Biznes i pomiar — przegląd 22.10.2026

Uzupełniono [BAZA-BIZNESOWA.md](./BAZA-BIZNESOWA.md) na podstawie aktualnych danych Supabase: 34 kliknięcia /go za 30 dni, 7 za 7 dni, 10 kliknięć z kategorii akcesoriów kosmetycznych (to mała próbka, nie dowód konwersji). Próba odczytu Vercel Web Analytics przez konektor zwróciła 403 (brak uprawnienia w tej sesji), więc nie dopisujemy zmyślonych odsłon. Plan przewiduje 14 dni pomiaru nowych kliknięć po wdrożeniu Wydania 02, z porównaniem tylko wtedy, gdy mamy spójne odsłony. Panel źródeł będzie wyświetlał pokrycie atrybucją i informację „Za wcześnie na ocenę” przy zerowej liczbie rozpoznanych źródeł. README zastąpiono instrukcją projektu.

## Kontrola kompletności stylizacji — 22.10.2026

Odczyt Supabase względem `lib/stylizacje.ts`: **5/5 zestawów kompletnych**, wszystkie przypisane produkty aktywne i w limitach zapisanych cen. Suma: Streetwear 99,00 zł / 100 zł, praca 111,75 zł / 150 zł, weekend 121,05 zł / 150 zł, casual 136,15 zł / 150 zł, trencz 188,63 zł / 200 zł. **Nie sprawdzano cen i dostępności u sprzedawcy.** Szczegóły w [BAZA-BIZNESOWA.md](./BAZA-BIZNESOWA.md).

## Ostatnia kontrola jakości ofert — 23.10.2026

W Supabase odczytem sprawdzono 97 aktywnych ofert: kompletne pola cen/linków/zdjęć/opisów, 0 nie-HTTPS linków SHEIN, ale **97 bez klucza identyfikacyjnego** (74 unresolved/23 pending) i 86 bez edycji rekordu w ostatnich 7 dniach. Wszystkie 11 produktów z 5 stylizacji aktywne, ale również bez potwierdzonego klucza. `updated_at` to edycja rekordu, nie audyt ceny. Dodano `docs/sql/jakosc-ofert-readonly.sql` oraz [JAKOSC-OFERT.md](./JAKOSC-OFERT.md). **Nic nie zapisywano w produkcji.**
