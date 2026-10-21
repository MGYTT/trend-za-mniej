# Wydanie 01 — Trend za Mniej

Ta gałąź łączy dział **Gotowe stylizacje** (5 redagowanych zestawów) i **przekierowania historycznych URL produktów**. Przed publikacją sprawdzamy również spójność cen, dostępność i indeksowanie.

## Zasady wydawania

- Nie łączymy tej gałęzi z `main`, dopóki komplet zmian nie przejdzie testów i przeglądu.
- Automatyczne wdrożenia Vercel są wyłączone dla `release/*` w `vercel.json`. Gałąź `main` ma zachować możliwość **jednego** wdrożenia produkcyjnego po zatwierdzeniu.
- **Nie używamy GitHub Actions.** Wszystkie testy uruchamiamy ręcznie na lokalnym komputerze.
- Nie wykonujemy zmian w bazie produkcyjnej w ramach tego wydania.

## Ręczne polecenia

W środowisku z Node.js 22 i poprawnym plikiem .env.local (sekrety tylko lokalnie):

```bash
npm ci
node --experimental-strip-types --test tests/stylizacje.test.mjs
npm run lint
npm run build
```

## Weryfikacja przed jednym wdrożeniem

- [ ] Na /stylizacje widoczne tylko dostępne zestawy mieszczące się w budżecie.
- [ ] Na /stylizacje/[slug] suma wyliczana z aktualnych danych katalogu, komunikat „cena z publikacji”.
- [ ] Przy przekroczeniu budżetu lub usunięciu produktu zestaw znika z katalogu i z mapy.
- [ ] Nawigacja na telefonie działa, przyciski i zdjęcia nie nachodzą na siebie.
- [ ] Stary URL produktu przekierowuje na aktualny za pomocą HTTP 308, nowy jest 200, nieistniejący 404.
- [ ] Zewnętrzne linki afiliacyjne prowadzą do właściwego produktu, bez obietnic niezweryfikowanych cen.
- [ ] Google Search Console: po wydaniu sprawdzić sitemapę i wybrane adresy, nie zakładając gwarancji indeksacji.
- [ ] Na PR nie ma ustawionego auto-merge ani automatycznej publikacji.

## Ograniczenia MVP

Aktualne stylizacje są skonfigurowane ręcznie w `lib/stylizacje.ts`; administracja zestawami z panelu to osobny etap. Zsumowane ceny nie obejmują wysyłki i mogą się różnić od cen w sklepie. Tylko zatwierdzone prowizje z programu afiliacyjnego należy traktować jako zarobek.

## Uzupełnienie: linkowanie wewnętrzne

- Z aktywnej strony produktu można przejść do gotowych stylizacji zawierających ten produkt.
- Kategoria pokazuje pasujące kompletne stylizacje, bez wyświetlania wygasłych lub przekraczających budżet.
- Każda stylizacja udostępnia odnośniki do innych dostępnych zestawów, co ułatwia nawigację i odkrywanie treści.
- Linkowanie służy użytkownikom, nie jest gwarancją indeksowania przez Google.
- Dopisano dwa testy ręcznie uruchamianego skryptu Node.js; bez GitHub Actions.
