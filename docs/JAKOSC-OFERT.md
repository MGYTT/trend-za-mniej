# Kontrola jakości ofert — Trend za Mniej

**Cel biznesowy:** chronić wiarygodność pięciu gotowych stylizacji i skuteczność przejść do partnera; nie zwiększać liczby ofert kosztem jakości. Ta kontrola nie zmienia żadnych danych.

## Aktualny wynik (23.10.2026, odczyt produkcyjnego Supabase)

| Sprawdzany element | Wynik |
| --- | ---: |
| Produkty ogółem / aktywne | 100 / 97 |
| Aktywne oferty z pustym lub nie-HTTPS adresem partnera | 0 |
| Aktywne oferty bez zgodnego wzorca domeny SHEIN | 0 |
| Aktywne oferty bez adresu zdjęcia HTTPS | 0 |
| Aktywne oferty bez nazwy skróconej lub opisu | 0 |
| Aktywne oferty z niedodatnią ceną katalogową | 0 |
| Aktywne oferty ze starą ceną ≤ cenie bieżącej | 0 |
| Aktywne oferty bez potwierdzonego klucza produktu SHEIN | **97** |
| Status tożsamości SHEIN: `unresolved` / `pending` | 74 / 23 |
| Aktywne oferty bez edycji rekordu od ponad 7 dni | **86** |
| Produkty z pięciu redagowanych stylizacji | **11/11 aktywnych** |
| Produkty ze stylizacji bez potwierdzonego klucza SHEIN | **11/11** |
| Produkty ze stylizacji bez edycji rekordu od ponad 7 dni | **11/11** |

**Interpretacja:** kontrola sprawdza **obecność pól, formaty URL i ceny zapisane w naszym katalogu**. Nie otwiera produktów na stronie SHEIN i nie potwierdza, że oferta istnieje, ma właściwy wariant, aktualną cenę lub nalicza prowizję. Brak klucza identyfikacyjnego oznacza niewyjaśnioną tożsamość produktu, **nie automatycznie zepsuty link**. `updated_at` mierzy datę edycji rekordu, a nie datę sprawdzenia w sklepie. Nie dokonuj masowej zmiany statusów ani automatycznej zamiany linków na podstawie samego raportu.

## Najważniejszy następny krok redakcyjny

1. **Najpierw pięć stylizacji (11 produktów):** ręcznie sprawdzić u partnera prowadzenie linku, nazwę/wariant/rozmiar, cenę i dostępność. Szczególnie Streetwear — zaledwie 1 zł zapasu do budżetu katalogowego.
2. W panelu admina wykorzystać istniejący moduł ochrony duplikatów i weryfikacji kluczy SHEIN; nie oznaczać statusu `resolved` bez realnej weryfikacji źródła.
3. Przygotować krótkie materiały społecznościowe dopiero po potwierdzeniu rzeczywistej dostępności stylizacji.
4. W kolejnej iteracji uzupełniać weryfikację pozostałych 86 ofert bez edycji w ostatnim tygodniu, zaczynając od ofert z kliknięciami.
5. Co tydzień powtórzyć tylko-odczytowy raport `docs/sql/jakosc-ofert-readonly.sql` w Supabase. Nie wymaga nowych narzędzi ani płatnych integracji.

## Co to daje biznesowo?

Zmniejsza ryzyko promowania wygasłej oferty i utraty zaufania użytkownika, zanim zwiększymy ruch SEO i z krótkich filmów. **Nie dowodzi wzrostu przychodów.** Podstawowy eksperyment z planu 90 dni pozostaje niezmieniony: pięć zestawów, mierzenie kliknięć z przypisanym źródłem, porównanie z odsłonami i weryfikacja zamówień/prowizji w programie partnerskim.

**Bezpieczeństwo:** raport SQL jest wyłącznie odczytowy i nie obchodzi RLS użytkowników końcowych. Prowadzi się go z konta administracyjnego SQL Editor lub zaufanego połączenia DBA — nigdy publicznie w aplikacji.
