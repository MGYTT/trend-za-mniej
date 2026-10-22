# Wydanie 02 — prosto, bezpiecznie, bez instalowania programów

**Cel:** w panelu `/admin/statystyki` pokazujemy, z której stylizacji lub strony produktu nastąpiło kliknięcie do SHEIN. **Nie dodajemy sklepu, nie zastępujemy dotychczasowych produktów i nie zmieniamy ich cen.**

## Co ja zrobiłem bez dotykania danych

Kontrola tylko do odczytu w Supabase, 22.10.2026:

| Obiekt | Rekordy |
| --- | ---: |
| Produkty (`products`) | 100, w tym 97 aktywnych |
| Kliknięcia (`affiliate_clicks`) | 34 |
| Historyczne przekierowania (`product_slug_redirects`) | 37 |
| Dziennik produktów (`product_activity`) | 110 |
| Kolejka SEO (`search_index_queue`) | 603 |
| Administratorzy (`admins`) | 2 |
| Obecność administracyjna (`admin_presence`) | 2 |

RLS włączony na wszystkich siedmiu tabelach. Brak kliknięć i przekierowań z nieistniejącymi produktami (0/0). Brak nowych kolumn atrybucji, nie wykonano migracji. Liczby będą się naturalnie zmieniały podczas pracy strony.

Lokalnie na Windows przeszły: `npm run verify:release`, produkcyjny build Next.js i TypeScript; `npm audit --omit=dev` = 0 podatności produkcyjnych.

## Jedyny krok użytkownika — dwa pliki CSV, bez terminala

W [Supabase Table Editor](https://supabase.com/dashboard/project/cpbyhabvmstevjyyrgpw/editor):

1. Otwórz w schemacie **public** tabelę **products** i wybierz **Export to CSV** (nazwa przycisku może różnić się w zależności od wersji panelu).
2. Tak samo pobierz **affiliate_clicks** jako CSV.
3. Wybierz pełen eksport bez filtrów i upewnij się, że pliki zawierają wiersze. Zapamiętaj, gdzie zostały zapisane — **poza folderem repozytorium**. Nie wysyłaj plików ani danych logowania przez czat, nie przesyłaj do GitHuba.

To jest **prosty dodatkowy eksport najważniejszych danych**, nie pełna kopia zapasowa PostgreSQL/Supabase. CSV nie zachowuje uprawnień, RLS, funkcji, triggerów, haseł, użytkowników Auth ani plików Storage. Nie należy twierdzić, że sam eksport CSV zapewnia możliwość odtworzenia całego serwisu. Przed ryzykowną zmianą schematu nadal trzeba potwierdzić odtwarzalną kopię i strategię przywracania.

Alternatywa dla zaawansowanych — pełniejsza kopia schematu public przez `pg_dump`: [BACKUP-I-DEPLOY-02.md](./BACKUP-I-DEPLOY-02.md). Nie wymaga Dockera, ale nie jest obowiązkowym narzędziem do codziennego prowadzenia projektu.

## Pozostałe kroki, które wykonuje asystent — nie użytkownik

1. Przejrzeć skrypty SQL, RLS, zależności triggerów i ograniczyć czas blokad w migracji.
2. Przeprowadzić kontrolę przedwdrożeniową tylko do odczytu.
3. Gdy kopia z opcją przywracania jest zweryfikowana, zastosować migrację atrybucji i osobną poprawkę uprawnień kolejki SEO, po testach jej działania.
4. Porównać liczbę produktów i kliknięć oraz raport za 7/30 dni; sprawdzić role `anon`, `authenticated`, administratora.
5. Wykonać **jeden** merge wydania do `main` i **jeden** deployment produkcyjny Vercel, następnie przetestować publiczne ścieżki.

**STOP:** nie uruchamiać migracji ani deploymentu, jeśli brakuje zweryfikowanego odzyskiwania danych lub pojawi się niespójność w raportach. Nie korzystamy z GitHub Actions, nie uruchamiamy Vercel Preview, nie zakładamy płatnego projektu ani Supabase branch.

## Po wykonaniu eksportu CSV

22.10.2026 użytkownik potwierdził zapis obu plików CSV. Następnie asystent wykonał wyłącznie odczyty w Supabase i potwierdził wszystkie kluczowe liczniki oraz uprawnienia. Symulacja źródła `unknown` dla istniejącej historii daje **7/7 kliknięć w 7 dni** i **34/34 w 30 dni**. Nie wykonano migracji SQL ani deploymentu.

**Nie trzeba wykonywać ponownie eksportu ani instalować programu.** Pliki CSV pozostają lokalnie u właściciela. Ponieważ nie da się obecnie udowodnić ich odtwarzalności ani wykorzystać ich do przywrócenia całego schematu Auth/Storage, traktujemy je jako dodatkowe zabezpieczenie, a nie punkt pełnego odtworzenia produkcji. Pozostała blokada jest konkretnie udokumentowana w `STATUS-PROJEKTU.md`.

## Następna kontrola biznesowa — 23.10.2026

Przeprowadzono read-only kontrolę jakości wszystkich 97 aktywnych ofert. Linki i zdjęcia są strukturalnie kompletne, ale 97 ofert nie ma zweryfikowanego klucza SHEIN, a 86 nie było edytowanych przez 7 dni. Szczegóły: [JAKOSC-OFERT.md](./JAKOSC-OFERT.md). Nie zmieniano cen, produktów ani statusów. Nie uruchomiono migracji ani deploymentu.
