# Kopia bezpieczeństwa i plan wdrożenia Wydania 02

Projekt Supabase `cpbyhabvmstevjyyrgpw` ma plan **Free**. Według dokumentacji Supabase automatyczne codzienne kopie są zapewniane w planach Pro/Team/Enterprise, a na Free zaleca się własny `supabase db dump`.

## Wymagana kopia (przed wykonaniem SQL)

1. Na zaufanym komputerze z Dockerem i Supabase CLI przygotuj folder **poza repozytorium**.
2. Wejdź w [Supabase Dashboard → Connect](https://supabase.com/dashboard/project/cpbyhabvmstevjyyrgpw) i pobierz własny łańcuch połączenia z bazą. **Nie udostępniaj hasła ani connection string w GitHubie, czacie lub dokumentacji.**
3. Zapisz tymczasowo connection string w zmiennej środowiskowej `SUPABASE_DB_URL` (bez umieszczania go w plikach repozytorium).
4. Uruchom `bash scripts/backup-supabase-before-release.sh /bezpieczny/nowy-folder`.
5. Kopia zawiera `roles.sql`, `schema.sql`, `data.sql` i `SHA256SUMS`. Przechowuj ją poza repozytorium, najlepiej także na osobnym dysku. Nie przepisuj jej do publicznego systemu kontroli wersji.
6. Zweryfikuj, że da się **odtworzyć** ją w bazie testowej. Samo utworzenie plików bez sprawdzenia odtwarzania nie jest dowodem odtwarzalności. Backup logiczny nie obejmuje plików Storage API.
7. Upewnij się, że w produkcji nie trwa inna migracja lub wdrożenie.

Instrukcja źródłowa: [Supabase — Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

## Kolejność publikacji — po pozytywnych testach

1. Ręcznie: `npm ci && npm run verify:release` w kompletnym repozytorium.
2. Zastosuj i sprawdź migrację w **bazie testowej**, wraz z uprawnieniami RLS. Zweryfikuj działanie triggera kolejki SEO po ograniczeniu `EXECUTE`.
3. Potwierdź kopię danych i możliwość odtworzenia.
4. Zastosuj zabezpieczenie `docs/sql/security-queue-lockdown.sql`, sprawdź `security-queue-postflight.sql`.
5. Zastosuj `docs/sql/affiliate-click-attribution.sql`, sprawdź `affiliate-attribution-postflight.sql`.
6. Porównaj 7- i 30-dniowe sumy kliknięć, przetestuj admin/non-admin/anon.
7. Jedno scalenie `release/wydanie-02-analityka` do `main` i **jedno wdrożenie produkcyjne Vercel**. Bez GitHub Actions.
8. Otwórz `/stylizacje`, strony produktów, `/go/[id]`, panel statystyk i sprawdź pełny przepływ.

## Gdy wdrożenie zawiedzie

- **Nie usuwaj nowych kolumn Supabase** tylko dlatego, że aplikacja się nie zbudowała. Migracja jest addytywna i starsza wersja aplikacji nie musi z niej korzystać.
- Jeśli nowy build Vercel nie przejdzie, pozostaw wcześniejszy deployment produkcyjny. Jeśli nowa wersja działa niepoprawnie po publikacji, przywróć poprzedni poprawny deployment w Vercel i zbadaj logi.
- Nie przywracaj starych uprawnień anonimowych do kolejki SEO jako rutynowej czynności naprawczej.
- Jeśli potrzebna jest naprawa bazodanowa, korzystaj ze zweryfikowanej kopii i procedury odtwarzania, nie wykonuj w ciemno `DROP TABLE` czy `DROP COLUMN`.

## Status w dniu 22.10.2026

- Brak automatycznej kopii danych na planie Free.
- Kopia i próba odtworzenia: **niepotwierdzone**, blokują produkcyjną migrację.
- `npm run build`: **niewykonany** z powodu niedostępnych w środowisku zależności Next.js i braku dostępu do repozytorium przez Git.
- GitHub Actions: **nieużywane**.
- Vercel: **nie uruchamiać ponownego buildu**, dopóki testy, kopia i migracje testowe nie przejdą.

## Windows PowerShell (zalecane dla Twojego komputera)

Przygotowano osobny skrypt `scripts/backup-supabase-before-release.ps1`. Wymaga działającego **Docker Desktop** oraz **Supabase CLI**. Dane połączenia podajesz do ukrytego monitu po uruchomieniu skryptu — **nie wysyłaj ich do ChatGPT**.

W katalogu projektu:
```powershell
git pull --ff-only
powershell -NoProfile -File .\scripts\backup-supabase-before-release.ps1
```

Skrypt zapisuje kopię w nowym folderze `Dokumenty/TrendZaMniej-Backup-<data>` poza repozytorium; odmawia zapisu do folderu repozytorium lub nadpisania istniejącej kopii. Jeśli lokalne zasady PowerShell blokują skrypt, sprawdź ustawienia ze zaufanym administratorem — nie zmieniaj globalnej polityki uruchamiania.

W folderze muszą znaleźć się: `roles.sql`, `schema.sql`, `data.sql`, `SHA256SUMS.txt`. Potwierdź liczbę i rozmiary plików, nie wklejaj tutaj zawartości. Dalszy warunek: sprawdzenie możliwości przywrócenia bazy w izolowanym środowisku testowym.

### Wyniki ręcznych testów aplikacji (22.10.2026)

Użytkownik potwierdził, że `npm run verify:release` zakończyło się sukcesem na Windows, w tym `next build` Next.js 16.4.0, TypeScript oraz wygenerowanie 32 stron statycznych. `npm audit --omit=dev` zgłosiło **0 podatności w zależnościach produkcyjnych**. W logu pozostają ostrzeżenia Edge Runtime i `z-index`, które nie zablokowały kompilacji. Nie wykonujemy kolejnego builda Vercel, dopóki migracje i kopie nie są gotowe.
