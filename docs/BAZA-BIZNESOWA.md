# Trend za Mniej — stan wyjściowy biznesu i plan decyzji

**Data kontroli: 22 października 2026 r.** Jest to punkt odniesienia, nie obietnica wyników finansowych. Źródła: odczyty agregatów z bieżącego Supabase (bez modyfikacji danych), kod i [plan rozwoju](./PLAN-ROZWOJU.md).

## Dla kogo i co sprzedajemy?

Nie jesteśmy sklepem: pomagamy wybrać damskie stylizacje na okazję i budżet. Rozwijamy **pięć istniejących, ręcznie redagowanych zestawów**, zamiast wprowadzać masowy import ofert lub funkcje AI bez potwierdzonego popytu. Linki prowadzą do SHEIN; przychód, jeśli wystąpi, pochodzi z zatwierdzonych prowizji partnera.

## Dostępne dane bazowe (ostatnie 30 dni kalendarzowych)

| Pomiar | Wynik | Ograniczenia |
| --- | ---: | --- |
| Produkty w katalogu | 100 (97 aktywnych) | Liczba produktów ≠ liczba wyświetleń |
| Kliknięcia do partnera zapisane przez `/go` | 34 | Zdarzenia, nie unikalni klienci ani zakupy |
| Kliknięcia przez `/go` w ostatnich 7 dniach | 7 | Stan na 22.10.2026; liczone dni kalendarzowe |
| Akcesoria kosmetyczne — kliknięcia w 30 dni | 10 | Tylko niewielka próbka kliknięć, nie wyznacza automatycznie strategii |
| Swetry / Kurtki i płaszcze / Dom i lifestyle | po 4 | Nie porównywać bez odsłon danej kategorii |

**Ważne:** reklamy i linki kampanii SHEIN poza ścieżką `/go` mogą nie być uwzględnione. Historyczne kliknięcia `/go` nie mają źródła stylizacja/produkt, więc nie wolno ich wstecznie przypisywać do gotowych zestawów.

## Brakujące dane — nie zgadujemy

- **Vercel Web Analytics:** próba odczytu odsłon za okres 7–22.10.2026 zakończyła się błędem uprawnień **403** dla zespołu, nie zerowym ruchem. Wymaga ponownego zezwolenia na odczyt statystyk we właściwym zakresie. Nie wyciągać na tej podstawie wniosków o konwersji.
- **Google Search Console:** brak aktualnych wyników wyświetleń, zapytań i wejść organicznych w tym przeglądzie.
- **Panel partnerski SHEIN:** brak zweryfikowanych danych o zamówieniach i zatwierdzonych prowizjach. **Nie wyliczamy przychodów** ze zdarzeń `affiliate_clicks`.
- **Jakość ofert:** nie wykonano osobnej aktualnej weryfikacji cen, rozmiarów i działania wszystkich linków na urządzeniu mobilnym.

## Pierwszy eksperyment biznesowy — 14 dni nowych danych po Wydaniu 02

**Hipoteza:** użytkownikowi łatwiej podjąć decyzję, gdy widzi kompletną stylizację i kwotę zestawu, niż przy samym katalogu produktów.

1. Nie zmieniać segmentu ani nie dodawać masowo ofert. Pozostać przy pięciu stylizacjach jako małym eksperymencie.
2. W Wydaniu 02 mierzyć przejścia do SHEIN osobno ze stylizacji i z kart produktów; zaznaczać udział kliknięć ze znanym źródłem, aby historia bez atrybucji nie przekłamywała wyniku.
3. Gdy będą dostępne odsłony z **tego samego okresu**, porównywać *kliknięcia ze stylizacji / odsłony stylizacji* z *kliknięciami z produktów / odsłony produktów*. To **przybliżona relacja zdarzeń**, nie konwersja osób ani przypisanie transakcji. Brak odsłon → nie liczyć wskaźnika.
4. Po 14 dniach nowego pomiaru ustalić progi i kierunek dalszych prób na podstawie realnej liczebności próby; nie ustalać dziś sztucznych celów procentowych.
5. Oddzielnie w panelu SHEIN sprawdzić, czy kliknięcia przekładają się na kwalifikowane zamówienia i zatwierdzone prowizje. Jeśli nie ma danych, raport oznaczyć jako **niepotwierdzony**.

**Decyzja po eksperymencie:** ulepszać zestawy i opisy, jeśli widać zainteresowanie i sprawdzone linki. W innym przypadku najpierw zweryfikować ruch, dostępność cen i jakość przekierowań; nie budować nowych drogich funkcji.

## Cotygodniowa rutyna redakcyjna

1. Sprawdź w SHEIN pięć gotowych stylizacji: aktualność ceny, rozmiarów, działanie linków, kompletność zestawu i informację o wyłączeniach (np. butów/dostawy). Nie reklamuj najniższej ceny bez weryfikacji.
2. Zweryfikuj 3–5 stron docelowych w Search Console na podstawie rzeczywistych zapytań, nie samych pozycji.
3. Opracuj 3–5 krótkich materiałów tygodniowo **na bazie faktycznie dostępnych zestawów**; linkuj do odpowiadającej stylizacji, nie tylko do strony głównej.
4. Porównuj dane za te same okresy; zapisuj wnioski i jedną decyzję na następny tydzień.
5. Nie rozliczaj przychodów na podstawie kliknięć. Zamówienia i prowizje pochodzą z panelu programu partnerskiego.

## Zasady publikacji i kosztów

Nie uruchamiać migracji bez zweryfikowanego planu odzyskiwania danych, a nie tylko CSV produktów. Aktualny plan Supabase: Free, bez pewnej automatycznej kopii możliwej do przywrócenia. Nie tworzyć dodatkowej płatnej gałęzi ani nie wykonywać nowego deploymentu Vercel, zanim release i uprawnienia nie przejdą przeglądu. Nie używać GitHub Actions.

Po potwierdzeniu warunków wystarczy **jedno kontrolowane wdrożenie Wydania 02**.
