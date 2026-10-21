# Wydanie 02 — skąd przychodzą kliknięcia do SHEIN?

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
