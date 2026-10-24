# Wydanie 07 — 10 stylizacji i łatwiejszy wybór

## Zmiany
- 5 nowych zestawów, po dwa rzeczywiste, aktywne produkty: beż i czerń 65,10 zł; wygodny luz 66,70 zł; dzianina i denim 116,05 zł; smart casual 105,15 zł; czarna mini i botki 163,96 zł.
- 5 dotychczasowych stylizacji: dokładniejsze introdukcje, wskazówki odnośnie wymiarów, materiału, sezonowości i zastosowania.
- Katalog prezentuje sześć zestawów na start i jeden przycisk do rozwinięcia pozostałych. Każdy filtr okazji lub ceny oraz sortowanie pokazuje **wszystkie** pasujące propozycje bez ukrytego paginowania.
- Na stronie każdej stylizacji pozostałe propozycje są dobierane przede wszystkim do tej samej okazji, a następnie do podobnego budżetu. Linki wewnętrzne i ich canonical pozostają bez zmian.
- Nowe stylizacje są też połączone z istniejącymi poradnikami. Sitemapa opiera się na \u0060LOOKS\u0060 i obejmuje ich URL bez tworzenia cienkich stron filtrów.

## Audyt katalogu (2026-10-25)
W ramach audytu Supabase tylko SELECT sprawdzono 10 unikalnych produktów nowych stylizacji. Wszystkie są aktywne, mają osobne linki HTTPS na onelink.shein.com i istniejące pliki zdjęć w Storage. Jedną wcześniejszą propozycję wycofano z doboru, bo brakowało jej zdjęcia. **Wszystkie tożsamości produktów w SHEIN pozostają nierozstrzygnięte (unresolved/pending)**: nie deklarujemy, że docelowy produkt, wariant, stan magazynu, cena w sklepie czy prowizja zostały niezależnie potwierdzone.

## Warunki wydania
- Bez zmian schematu, cen, zdjęć, rekordów czy sekretów Supabase. Bez Wydania 02.
- Testy: \u0060npm run verify:stylizacje-07\u0060 (stylizacje, poradniki, SEO Google, 7 nowych kontraktów, ESLint, build). Weryfikację runtime kończy Vercel. Brak GitHub Actions i preview \u0060release/*\u0060.
- Po wdrożeniu sprawdź na telefonie filtr okazji/budżetu, przycisk rozwijania, przejścia do nowych i starych kart, zdjęcia i linki z każdej stylizacji.
- Ceny na stronach są sumą zapisanych cen w naszym katalogu, bez dostawy i dodatków. Aktualną kwotę oraz dostępność należy potwierdzić na stronie SHEIN. Warto dokończyć zadania z issue #9 przed intensywną promocją.
