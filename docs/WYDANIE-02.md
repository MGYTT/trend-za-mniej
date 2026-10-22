# Wydanie 02 — skąd przychodzą kliknięcia do SHEIN?

Najprostsza instrukcja i aktualna kontrola bezpieczeństwa: [Wydanie 02 — prosto](./WYDANIE-02-PROSTO.md).

Stan: wersja robocza na gałęzi `release/wydanie-02-analityka`. Bez GitHub Actions i bez automatycznych Vercel Preview Deployments.

## Co mierzymy

Kliknięcie produktu `/go/[id]` otrzymuje jedno z trzech źródeł:
- `outfit` + `outfit_slug`: kliknięcie z podstrony gotowej stylizacji;
- `product`: kliknięcie z podstrony pojedynczego produktu;
- `unknown`: link bez parametrów (np. stary link), niewłaściwe lub niespójne parametry.

**To nie jest raport zamówień, ani przychodów.** Nie pobieramy IP ani danych osobowych, nie stawiamy cookies. Źródło jest parametrem adresu i dlatego może być zmanipulowane — służy do orientacyjnego porównania kliknięć, nie do rozliczeń prowizyjnych.

## Kolejność uruchomienia (dopiero po zatwierdzeniu wydania)

1. Utwórz kopię zapasową / punkt przywracania bazy Supabase.
2. W SQL Editor uruchom skrypt `docs/sql/affiliate-click-attribution.sql`.
3. Zweryfikuj, że funkcja `get_affiliate_source_stats` respektuje dotychczasowe RLS; osoba niebędąca administratorem nie widzi żadnych wierszy. Skrypt nie rozszerza uprawnień SELECT do `affiliate_clicks`.
4. Lokalnie: `node --experimental-strip-types --test tests/affiliate-attribution.test.mjs`, `npm run lint`, `npm run build`. **Nie używaj GitHub Actions.**
5. Dopiero potem wykonaj **jeden** merge `release/wydanie-02-analityka` do `main`, wyzwalając jeden produkcyjny build na Vercel.
6. W `/admin/statystyki` sprawdź nowy raport za 7 i 30 dni. Starsze rekordy powinny być zaliczone jako „nieustalone”.
7. Sprawdź ręcznie przycisk w stylizacji oraz przycisk na stronie pojedynczego produktu. Otwórz raport i zobacz nowe kliknięcia.

## Zgodność wsteczna
- Nowy `/go/[id]` próbuje zapisać źródło kliknięcia. Jeśli kolumny nie są jeszcze dostępne, podejmuje próbę zapisania starszego formatu. **Przekierowanie do sklepu działa niezależnie od wyniku zapisu.**
- Dotychczasowe statystyki wszystkich kliknięć nie są zmieniane.
- Brak nowego zależnego serwisu analitycznego i dodatkowego abonamentu.

## Metryki po starcie

Porównujemy udział kliknięć z gotowych stylizacji względem kliknięć z kart produktów i nieustalonych źródeł. Samo zliczanie kliknięć nie pokazuje liczby sprzedaży; zatwierdzone prowizje sprawdzamy w programie partnerskim.

## Weryfikacja i interpretacja wskaźników

- Raport `get_affiliate_source_stats` liczy pełne dni kalendarzowe (dziś + 6 albo 29 poprzednich dni), **tak samo jak `get_clicks_by_day`**. Poprzednia wersja propozycji SQL liczyła ostatnie 7 lub 30 dobowych okresów i mogła dawać różnice.
- Tabela `affiliate_clicks` ma włączony RLS. Z raportu mogą korzystać zalogowani administratorzy. Anonimowy użytkownik nie ma `SELECT` ani `INSERT`; nie wprowadzamy nowych polityk RLS.
- W bazie dozwolone są jedynie kombinacje `source_type` i `outfit_slug`, które mają sens; `outfit_slug` może wystąpić tylko dla źródła `outfit`.
- Udział stylizacji jest liczony w odniesieniu do **kliknięć o znanym pochodzeniu** (stylizacja + podstrona produktu); stare i nieustalone kliknięcia nie zniekształcają procentu. To udział kliknięć, a nie konwersja zakupu.
- Testy pomocnicze, uruchamiane ręcznie: `node --experimental-strip-types --test tests/affiliate-stats.test.mjs`.
- Po zastosowaniu SQL zweryfikuj, że sumy dla źródeł odpowiadają liczbie kliknięć w tym samym okresie, a raport jest niedostępny dla roli anonimowej i nie-administratora.
- Weryfikuj na zbiorczych danych, bez gromadzenia identyfikatorów użytkowników, IP ani ciasteczek w bazie.

**Stan prac:** kod i skrypt przygotowane na gałęzi. Pełny build Next.js nie został jeszcze uruchomiony. Brak wdrożenia produkcyjnego oraz zmian w schemacie bazy.

## Kontrola przed wdrożeniem — kompletna lista

1. Sprawdź status [Database Advisors](./SECURITY-REVIEW.md). Ostrzeżenia SECURITY DEFINER wymagają analizy zależności, ale nie wykonujemy masowych REVOKE.
2. Uruchom *tylko odczyt* `docs/sql/affiliate-attribution-preflight.sql`.
3. Zrób backup bazy / sprawdź możliwość przywrócenia.
4. Przejrzyj przygotowany skrypt migracyjny `docs/sql/affiliate-click-attribution.sql`. **Nie uruchomiony.**
5. Po jego wykonaniu uruchom `docs/sql/affiliate-attribution-postflight.sql` i przetestuj dostęp anonimowy oraz użytkownika niebędącego administratorem.
6. Ręcznie uruchom `npm run test:affiliate`, `npm run lint`, `npm run build` w pełnym lokalnym repo.
7. Dopiero po pozytywnym wyniku planujemy jeden merge do `main` i jedno wdrożenie Vercel.

**Wyniki lokalne 21.10.2026**: testy Node.js dla `affiliate-attribution` i `affiliate-stats`: **10/10 PASS**; `tsc --noEmit` dla tych dwóch modułów: **PASS**. Nie zastępuje to pełnego `npm run build`.

## Naprawa uszkodzonego pliku migracji i ochrona kolejki SEO

W wersji przygotowanej wcześniej plik `docs/sql/affiliate-click-attribution.sql` miał urwany warunek SQL i zdublowany fragment funkcji. Plik został **w całości napisany ponownie**: jedna transakcja, jedno `CREATE OR REPLACE FUNCTION`, kompletne warunki, zbalansowane bloki `DO`. Nigdy nie wykonywano tego wadliwego skryptu na produkcyjnej bazie.

Przygotowano osobną, ograniczoną zmianę uprawnień `docs/sql/security-queue-lockdown.sql` (patrz `docs/SECURITY-REVIEW.md`) i kontrolę wyników `docs/sql/security-queue-postflight.sql`. Przed zastosowaniem na produkcji wymaga zatwierdzenia oraz sprawdzenia triggera w środowisku testowym.

Nowe **testy statyczne struktury SQL**: `npm run test:release-sql`. Testy NIE wykonują migracji ani nie zastępują sprawdzenia bazy.

## Bramka wydania bez GitHub Actions i bez Vercel

Przed każdym przyszłym wdrożeniem:
```bash
npm ci
npm run verify:release
```
Polecenie uruchamia kolejno:
1. Parser TypeScript dla plików `.ts` i `.tsx` w `app/`, `components/`, `lib/` oraz plikach konfiguracyjnych (`npm run check:syntax`). Wykrywa brakujący nawias JSX, który wcześniej zepsuł build Vercel.
2. Trzy testy samego analizatora (`npm run test:syntax`).
3. Testy atrybucji kliknięć, agregowania statystyk, SQL, stylizacji i filtrów.
4. ESLint.
5. Pełny build Next.js — dopiero ten krok daje wysoką pewność przed deployem.

**Wynik testu analizatora (lokalny izolowany katalog, Node.js 22 + TypeScript): 3/3 PASS.**
Skan całej aplikacji oraz pełny build nadal wymagają pobranego repozytorium i zależności. Nie oznaczamy wydania jako gotowego bez ich uruchomienia.

## Kontrola jakości raportu kliknięć

- Raport administracyjny porównuje sumę źródeł ze starym licznikiem kliknięć w tym samym okresie.
- Gdy wynik się nie zgadza lub raport dzienny nie działa, pokazuje ostrzeżenie zamiast sugerować, że statystyki są kompletne.
- Z rankingu można otworzyć aktywnie zdefiniowane stylizacje; historyczne nieznane slugi nie prowadzą do potencjalnych stron 404.
- Trzy nowe testy dotyczą uzgodnienia sum, brakujących danych oraz błędnych liczb.
- Ogólny opis prac i lista blokad: [Aktualny stan projektu](./STATUS-PROJEKTU.md).

## Kontrola wiarygodności parametrów linków afiliacyjnych

- Powielone `origin` lub `look` nie są traktowane jako wiarygodne źródło kliknięcia.
- Link z `origin=product` nie może jednocześnie zgłaszać `look`.
- Dla źródła `outfit` sprawdzamy rzeczywistą przynależność produktu do konkretnej stylizacji w redakcyjnym katalogu.
- Dodano trzy testy regresyjne, w tym test wszystkich pięciu stylizacji i ich rzeczywistych produktów.
- To zabezpiecza jakość danych analitycznych; źródła parametru URL nadal nie należy utożsamiać z potwierdzoną sprzedażą.

## Bezpieczny start Wydania 02

Zobacz [procedurę kopii bezpieczeństwa i jednego wdrożenia](./BACKUP-I-DEPLOY-02.md). Repozytorium zawiera skrypt wykonywania logicznej kopii Supabase Free i testy spójności linków afiliacyjnych.
