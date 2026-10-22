> **Prosta ścieżka dla właściciela serwisu:** [Wydanie 02 — bez instalowania programów](./WYDANIE-02-PROSTO.md). Poniższa instrukcja jest wariantem zaawansowanym, nie wymagamy jej przy codziennych pracach.

# Wydanie 02 — kopia przed migracją Supabase, bez Dockera

**W projekcie Trend za Mniej nie używamy Dockera.** Strona nadal jest wdrażana przez GitHub i Vercel, a baza pozostaje w Supabase. Ten dokument dotyczy wyłącznie jednorazowego zabezpieczenia danych przed migracją.

## Co jest już sprawdzone?

- 22.10.2026: `npm run verify:release` na Windows — PASS (Next.js i TypeScript).
- `npm audit --omit=dev` — 0 podatności zależności produkcyjnych.
- Supabase projekt na planie Free: **nie ma potwierdzonej automatycznej codziennej kopii**.
- Nie wykonano jeszcze migracji i nie wdrożono Wydania 02.

## Kopia na Windows bez Dockera

**PostgreSQL 18.6 pobrany przez użytkownika jest odpowiedni do utworzenia zrzutu bazy PostgreSQL 17**: oficjalne `pg_dump` obsługuje serwery starszej wersji. Narzędzie w wersji 18 nie gwarantuje jednak odtworzenia na starszym serwerze 17 bez dostosowań — dlatego test odzyskiwania jest obowiązkowy. Instalator uruchamiamy wyłącznie z opcją **Command Line Tools**, bez PostgreSQL Server, pgAdmin oraz Stack Builder.

Do wykonania kopii kluczowych danych aplikacji wystarczą lokalne narzędzia klienta **PostgreSQL 17 lub 18** — `pg_dump` oraz `pg_restore`, bez instalowania serwera PostgreSQL ani kontenerów. Można zainstalować same narzędzia Command Line Tools z [oficjalnej strony PostgreSQL](https://www.postgresql.org/download/windows/).

1. Otwórz PowerShell w katalogu projektu i pobierz zmiany: `git pull --ff-only`.
2. Sprawdź dostępność narzędzi: `pg_dump --version` i `pg_restore --version`. Skrypt potrafi też znaleźć standardową instalację `C:\Program Files\PostgreSQL\18\bin` lub `C:\Program Files\PostgreSQL\17\bin`.
3. W [Supabase Dashboard](https://supabase.com/dashboard/project/cpbyhabvmstevjyyrgpw) kliknij **Connect** i wybierz **Session pooler**. Zanotuj tylko hostname oraz nazwę użytkownika PostgreSQL; port musi wynosić **5432**, bazą jest `postgres`.
4. Uruchom:
   ```powershell
   powershell -NoProfile -File .\scripts\backup-supabase-before-release.ps1
   ```
5. Skrypt poprosi o host, użytkownika oraz hasło (w ukrytym polu). **Nie wysyłaj hasła ani connection stringa do ChatGPT ani do GitHuba.**
6. W nowym folderze `Documents/TrendZaMniej-PublicBackup-<data>` powstaną `public.backup`, `archive-contents.txt`, `public.backup.sha256`. Katalog znajduje się poza repozytorium, skrypt nie nadpisuje istniejącej kopii.
7. Skrypt wymaga poprawnie odczytanego archiwum i potwierdzenia, że zawiera dane tabel `public.products` i `public.affiliate_clicks`. Sprawdzenie listy to **nie jest test odtworzenia**; przed zmianami bazy wymagamy odtworzenia w oddzielnym środowisku.

### Ważne ograniczenie

`pg_dump --schema=public` kopiuje strukturę i dane schematu `public`, w którym mamy produkty, kliknięcia, definicje funkcji oraz polityki RLS. **Nie jest to pełna kopia Supabase**: nie obejmuje tabel uwierzytelniania (`auth`), metadanych `storage`, samych plików Storage API ani wszystkich obiektów i ról zarządzanych przez Supabase. Przywrócenie `public` może wymagać istniejących zależności `auth` i rozszerzeń.

Dla operacji poza schematem `public` należy osobno zapewnić strategię kopii i odzyskiwania. Nie wykonuj `pg_restore` na produkcji bez planu i weryfikacji. Nasze planowane migracje Wydania 02 obejmują jedynie obiekty w `public`.

Oficjalne wskazówki: [PostgreSQL pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [PostgreSQL pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html), [Supabase — Database Backups](https://supabase.com/docs/guides/platform/backups).

## Kolejność pozostałych kroków

1. Utworzyć kopię i sprawdzić możliwość jej odtworzenia w bezpiecznej bazie testowej.
2. Sprawdzić tam migrację statystyk i zabezpieczenie `queue_search_index_path`, w tym działanie triggerów i RLS.
3. Wykonać na produkcji zatwierdzone migracje i zapytania kontrolne.
4. Wykonać **jeden merge do `main` i jeden deployment Vercel**, bez GitHub Actions.
5. Sprawdzić strony stylizacji, produktów, przejścia do SHEIN, panel statystyk oraz raport uprawnień.

Jeśli pełny backup albo test odtwarzania się nie uda, **nie wykonywać migracji produkcyjnej**. Poprzedni deployment Vercel zostaje nienaruszony.
