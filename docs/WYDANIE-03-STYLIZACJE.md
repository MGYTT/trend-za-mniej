# Wydanie 03 — profesjonalna strona /stylizacje

## Pozycjonowanie biznesowe

Celem jest pomoc osobie szukającej damskiej stylizacji w budżecie 100–200 zł — szybki wybór według okazji i kwoty, zrozumienie realnych elementów zestawu oraz odpowiedzialne przejście do sklepu. Nie obiecujemy wzrostu ruchu lub prowizji bez wyników. Nie tworzymy fikcyjnych testów, rabatów ani masowo powielanych podstron SEO.

**Dlaczego niezależnie:** gałąź `release/stylizacje-growth-03` wychodzi z aktualnego `main` i nie wymaga nowych tabel, migracji ani sekretów. Niedokończone Wydanie 02 (atrybucja źródeł kliknięć) pozostaje osobnym PR. Wyłączenie automatycznych Vercel Preview dla `release/*` obowiązuje jak wcześniej.

## Zakres ulepszeń

1. Mocniejsza mobilna strona wejścia: cel i oferta, rzeczywiste zdjęcia produktów i wyróżnienie zestawu z najniższą zapisaną sumą cen.
2. Szybsza decyzja: budżety jako dostępne przyciski, okazje w select, kolejność redakcyjna albo od najniższej sumy, reset i licznik wyników `aria-live`.
3. Czytelne karty z liczbą elementów, sumą katalogową, ceną bez dostawy i właściwym wejściem do detali.
4. Autorski poradnik zakupowy: okazja, cena, rozmiar i elementy niewliczone w sumę; odpowiedzi na rzeczywiste pytania bez nieuprawnionego FAQ rich-result schema.
5. SEO: tytuł opisujący zawartość, canonical, metadane social oraz aktualny `BreadcrumbList` i `ItemList` tylko dla kompletnych zestawów.
6. Podstrona zestawu: wyraźne podsumowanie składu i budżetu, szybkie przejście do elementów, jednoznaczna informacja o afiliacji; link do `/go/[id]?origin=outfit&look=...` pozostaje zgodny z obecną trasą `/go`, a po Wydaniu 02 będzie gotowy do atrybucji.

## Zasady prawdziwości

- Ceny pochodzą z **istniejącej bazy** i są opisane jako zapisane w katalogu, a nie weryfikowane na żywo. Koszt dostawy i dodatków wykluczonych w opisie nie jest wliczony.
- Pokazujemy wyłącznie kompletne zestawy, których aktywne produkty mieszczą się w limicie — tak jak w obecnej logice `resolveLooks`.
- NIE twierdzimy, że produkty zostały przetestowane ani że są najtańsze.
- Kliknięcie `/go` to wyjście do partnera, nie zamówienie. Przy linkach afiliacyjnych do partnera `rel="sponsored nofollow noopener noreferrer"`.
- Przed reklamowaniem konieczna ręczna weryfikacja 11 produktów w pięciu stylizacjach: wariant, dostawa, cena i dostępność.

## Bezpieczna weryfikacja przed wdrożeniem

- `npm ci` (tylko jeśli w katalogu nie ma już zainstalowanych zależności); `node --experimental-strip-types --test tests/stylizacje.test.mjs tests/outfit-filters.test.mjs`; `node --test tests/stylizacje-growth.test.mjs`.
- `npm run verify:stylizacje` na Windows przy skonfigurowanym `.env.local`.
- Weryfikacja manualna: mobile 320px/375px, tablet, desktop; filtr budżetu i okazji, sort, reset, stan pusty, focus/klawiatura; linki z 5 kart do podstron i po 2–3 produkty; linki do SHEIN z atrybutem `sponsored`; brak zmian danych.
- Sprawdzenie dostępności i metadanych produkcyjnych przed merge. Zmiany na głównej stronie `/stylizacje` mają działać także, gdy zestaw stanie się niekompletny (empty state), a nie pokazywać nieaktualny budżet.
- Ani GitHub Actions, ani Vercel Preview, ani płatne usługi, ani nowy schemat Supabase. Merge do `main` dopiero po wszystkich testach i świadomym zatwierdzeniu.

## Jak sprawdzić sukces po publikacji?

- Vercel Analytics: organiczne odsłony `/stylizacje`, odsłony kart zestawów, urządzenia i źródła.
- Google Search Console: zapytania, wyświetlenia, CTR i strony docelowe; zero obietnic indeksacji/rankingu.
- Kliknięcia `/go`: najpierw suma zdarzeń. Dopiero po wdrożeniu Wydania 02 źródło stylizacja/produkt.
- Panel programu partnerskiego: zamówienia i prowizje potwierdzone przez SHEIN, nie liczba kliknięć.
- Najpierw 14 dni pomiaru, potem zmiana copy, zdjęć lub wyeksponowania zestawów na podstawie rzeczywistych danych.

Oparcie o wytyczne Google: [tworzenie przydatnych treści](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [unikanie cienkiej afiliacji](https://developers.google.com/search/docs/essentials/spam-policies), [oznaczanie linków sponsorowanych](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links?hl=pl).

## Uwaga o istniejącym ESLint

Na bazowym `main` wykryto wcześniej w Windows 14 błędów `react-hooks/set-state-in-effect` w dziewięciu istniejących komponentach i błąd linku `<a href="/">` na stronie logowania. Na tej gałęzi link został zmieniony na `next/link`, a wyłącznie w dziewięciu historycznych komponentach regułę zachowano jako ostrzeżenie zamiast błędu; nie została wyłączona globalnie. Refaktoryzacja tych efektów wymaga oddzielnych testów regresji. Nie jest to naprawa ich zachowania.

## Linkowanie wewnętrzne

Przeprowadzono audyt drogi do `/stylizacje`. Link jest już obecny w głównym menu, dolnej nawigacji mobilnej oraz w skrótach strony głównej. Dodano brakujący, opisowy odnośnik w stopce. Nie tworzymy osobnych stron filtrów ani duplikatów pod frazy, bo powodowałoby to niepotrzebne mnożenie bardzo podobnych stron.
