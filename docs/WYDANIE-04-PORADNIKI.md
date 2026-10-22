# Wydanie 04 — poradniki modowe i organiczne wejścia

## Dlaczego to robimy?

Trend za Mniej ma pomagać wybrać zestaw, a nie tylko przekierowywać do SHEIN. Hipoteza: poradnik odpowiadający na realne pytanie użytkowniczki może dostarczyć wartościowy ruch z wyszukiwarki, a odpowiednie przykłady stylizacji ułatwią przejście do ofert. Wzrost wizyt, liczby zamówień i prowizji wymaga późniejszego pomiaru — nie jest gwarantowany.

## Co przygotowano

Trzy samodzielne poradniki i jeden dział zbiorczy:

- /poradniki — lista poradników z odnośnikami.
- /poradniki/jak-ubrac-sie-do-pracy-do-150-zl — dress code, wygoda, rozmiary i pełny koszt.
- /poradniki/co-zalozyc-na-weekend-do-150-zl — potrzeby, proporcje i wykorzystanie własnych ubrań.
- /poradniki/jak-skompletowac-stylizacje-do-100-zl — plan wydatków, wzory i budżet.

Każdy poradnik zawiera trzy rozbudowane sekcje i pięciopunktową checklistę zakupową. Wskazuje stylizacje wyłącznie wtedy, gdy produkty są aktywne, kompletne i mieszczą się w skonfigurowanym limicie. Przykłady wykorzystują istniejące zdjęcia produktów z katalogu, bez tworzenia sztucznych fotografii.

Na stronie głównej, w stopce, na /stylizacje i w detalach powiązanych zestawów dodano tematyczne linki. Sitemap zawiera hub oraz trzy artykuły. Canonical i dane strukturalne Article / BreadcrumbList nie deklarują fałszywych ocen, recenzji ani fizycznych testów.

## Bezpieczeństwo i uczciwość

- Brak migracji Supabase, zmian produktów, webhooków, nowych kosztów i GitHub Actions.
- Artykuły nie zawierają statycznych kwot ofert ani obietnic rabatu. Suma cen zestawu pochodzi z katalogu; rozmiar, cenę i dostępność trzeba sprawdzić w SHEIN.
- Jeśli powiązana stylizacja staje się niedostępna, nie jest promowana w poradniku jako aktywna.
- Nie twierdzimy, że redakcja fizycznie testowała produkty. Przed publicznym wdrożeniem potrzebny przegląd stylu i rzetelności treści.
- Nie łączymy tej zmiany z niewdrożonym Wydaniem 02.
- Całość jest w gałęzi release/poradniki-organiczne-04. Bez automatycznego Vercel Preview.

## Kontrola przed merge do main

1. npm run verify:poradniki — stare testy stylizacji + siedem testów poradników + ESLint + build Next.js.
2. Mobile 320px i 375px, tablet i desktop: listy, artykuły, nagłówki, okruszki, linki do stylizacji, poradnik w stopce, focus klawiaturą.
3. Potwierdzenie w panelu Supabase, że używane produkty są aktywne i sumy katalogowe mieszczą się w limitach; niezależna weryfikacja cen i wariantów w SHEIN przed intensywną promocją.
4. Sprawdzenie mapy witryny i canonical; artykuł musi być czytelny również wtedy, gdy zestaw znika.
5. Dopiero po przejściu kontroli jeden świadomy merge i jeden produkcyjny deployment Vercel.

## Co sprawdzać po publikacji?

Przez 14 oraz 30 dni: w Google Search Console wyświetlenia, zapytania i kliknięcia do stron /poradniki/*; w Vercel Analytics odsłony poradników i zestawów. Zestawienie kliknięć do SHEIN ze źródłami dopiero po bezpiecznym Wydaniu 02; zakupy i prowizje tylko w panelu programu afiliacyjnego. Bez właściwego dostępu do analityki nie podajemy wymyślonych liczb.

Wytyczne:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=pl
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links?hl=pl

## Uproszczenie nawigacji i strony głównej

Na prośbę właściciela włączone do tego samego wydania: uproszczono nagłówek do 4 działań (Stylizacje, Poradniki, Produkty, Promocje), pozostałe działy dostępne w mobilnym menu i stopce. Dolny pasek mobilny ma 4 pozycje (Start, Stylizacje, Poradniki, Produkty). Strona główna prowadzi najpierw do 3 jasnych wyborów, następnie do 3 poradników i 4 wybranych produktów; usunięto powtarzające się sekcje nowych produktów, kategorii i promocji, ale odpowiednie adresy publiczne nadal działają. Sekcja /stylizacje ma krótki odnośnik do poradników zamiast powtarzania ich miniatur i kolejnego długiego tekstu. Wymaga kontroli UX i testów.
