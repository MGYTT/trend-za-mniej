# Trend za Mniej — plan rozwoju produktu i biznesu

> Wersja robocza • 21.10.2026 • analiza kodu repozytorium (gałąź `main`).  
> **Cel:** przejść od katalogu afiliacyjnego do serwisu, który **pomaga podjąć decyzję zakupową**.  
> To plan eksperymentów, nie prognoza ani gwarancja przychodów.

## 1. Pozycjonowanie

**Propozycja wartości:** „Wybierz budżet i okazję, a Trend za Mniej pokaże Ci gotową stylizację, koszt całego zestawu i linki do poszczególnych elementów”.

**Pierwsza grupa docelowa (hipoteza do zweryfikowania):** osoby szukające damskich stylizacji codziennych w budżecie 100–200 zł.

**Dlaczego użytkownik ma wracać:** aktualizowane zestawy, oszczędność czasu, przejrzysty budżet, praktyczne podpowiedzi i uczciwie podana aktualność cen. Nie obiecujemy „najniższej ceny”, jeżeli jej nie weryfikujemy.

**Czego teraz NIE budujemy:** kolejnego masowego importu ofert, zaawansowanego AI, kont klientów, płatnych reklam ani rozbudowanych alertów cenowych bez danych i popytu.

## 2. Co jest już w kodzie

| Obszar | Stan rozpoznany w repo |
| --- | --- |
| Aplikacja | Next.js 16, React 19, TypeScript, Tailwind 4 (`package.json`) |
| Dane | Produkty w Supabase; odczyt/kategorie/filtrowanie (`lib/products.ts`) |
| Kliknięcia afiliacyjne | `/go/[id]` przekierowuje i zapisuje wpis do `affiliate_clicks` |
| Administracja | Panel ofert, statystyk, SEO, publikacji społecznościowych w `app/admin` |
| SEO | Metadane, kanoniczne URL, mapa serwisu, robots, dane strukturalne |
| Analityka | Vercel Analytics w `app/layout.tsx`; panel statystyk liczy kliknięcia afiliacyjne |
| Promocje SHEIN | `components/SheinPromotionsExplorer.tsx` używa bezpośrednich linków z kampanii; ich kliknięcia nie przechodzą przez obecne `/go/[id]` |
| Proces zespołowy | README jest szablonowy; brak katalogu testów, workflow CI i migracji bazy w obecnym drzewie repo |

**Ważne ograniczenie:** wpis w `affiliate_clicks` to **kliknięcie, nie zakup**. Dane o zleceniach/prowizjach należy weryfikować w panelu afiliacyjnym. Nie utożsamiać liczby kliknięć z przychodem.

## 3. 90-dniowy plan wykonania

### Etap 0: Pomiar stanu wyjściowego (dni 1–7) — P0

- [ ] Odczytać z Vercel Analytics wizyty/źródła dla ostatnich 28 dni.
- [ ] Sprawdzić w Google Search Console: indeksowanie, wyświetlenia, kliknięcia, zapytania i strony docelowe.
- [ ] Zweryfikować w panelu afiliacyjnym SHEIN: kliknięcia, zamówienia kwalifikowane, zatwierdzone prowizje oraz reguły używania linków i materiałów.
- [ ] Przetestować ręcznie po 3 linki z produktów i kampanii na telefonie: czy działają, czy prowadzą do właściwej oferty, czy cena/dostępność są zgodne.
- [ ] Zestawić bazowy lejek: wizyty → strony produktów/stylizacji → kliknięcia do partnera → zamówienia/prowizje (ostatni krok wyłącznie z panelu partnera).
- [ ] Ustalić sposób weryfikowania cen; nie prezentować „promocji” ani porównań bez wiarygodnej ceny odniesienia.

**Rezultat:** raport bazowy. Nie zgadywać wyników ani nie zakładać, że brak przychodu oznacza problem wyłącznie z SEO.

### Etap 1: MVP „Gotowe stylizacje” (dni 8–21) — P0

Uruchomić mały eksperyment zamiast dużej przebudowy:

- [ ] Nowa strona `/stylizacje`: 5 ręcznie wybranych zestawów na konkretną okazję i do konkretnego budżetu.
- [ ] Strona `/stylizacje/[slug]`: zdjęcie/tytuł zestawu, 2–4 produkty, suma zapisanych cen, komentarz „dlaczego te elementy pasują do siebie”, link do każdego produktu.
- [ ] Ostrzeżenie: ceny, rozmiary i dostępność mogą zmieniać się u sprzedawcy; data sprawdzenia ofert i informacja o afiliacji.
- [ ] Wersja mobile-first, prawidłowe metadane i linkowanie wewnętrzne ze strony głównej i produktów.
- [ ] Karta stylizacji powinna dać konkretną odpowiedź: dla kogo, na jaką okazję, ile kosztuje komplet, czego brakuje i jakie są ograniczenia.
- [ ] Każdy produkt ma prowadzić na właściwy adres w serwisie, a docelowe wyjście do sklepu przechodzić przez istniejący mechanizm `/go/[id]`.

**Propozycja techniczna V1:** użyć istniejących rekordów produktów i niewielkiej, ręcznie redagowanej konfiguracji zestawów (np. `lib/stylizacje.ts`) bez migracji bazy. Po walidacji przenieść redakcję stylizacji do panelu admina i bezpiecznych tabel Supabase (z RLS i migracjami).

**Warunki akceptacji:** co najmniej 5 kompletnych zestawów, działające linki, prawidłowe sumowanie, poprawna obsługa produktów nieaktywnych i pustych zdjęć, metadane, dobry widok mobilny, brak deklaracji niezweryfikowanych obniżek.

### Etap 2: Lejek i jakość ofert (dni 22–45) — P1

- [ ] Rozróżnić zdarzenia wejścia na stylizację, przejścia na produkt i kliknięcia do sklepu; unikać zbierania danych osobowych bez potrzeby.
- [ ] Dodać raport skuteczności stylizacji i źródeł ruchu; dane zakupowe/prowizyjne importować tylko jeśli program partnerski to umożliwia, inaczej porównywać ręcznie.
- [ ] Zaprojektować sposób mierzenia kliknięć w kampanie SHEIN, które obecnie omijają `/go/[id]`.
- [ ] Wprowadzić rutynę oznaczania i wyłączania wygasłych/niedostępnych ofert.
- [ ] Dopracować 5 najlepszych podstron na podstawie realnych zapytań i zachowania użytkowników.

### Etap 3: Ruch organiczny i powroty (dni 46–90) — P1

- [ ] Testować przez 4 tygodnie **jeden segment odbiorców** (np. stylizacje do 150 zł).
- [ ] Publikować 3–5 krótkich filmów tygodniowo opartych na prawdziwych zestawach, z odpowiednim odesłaniem do `/stylizacje/[slug]`.
- [ ] Przygotować autorskie poradniki: „3 zestawy do pracy do 150 zł”, „co dobrać do ...”, „jak zbudować szafę kapsułową taniej”; unikać masowych, powielonych opisów.
- [ ] Porównywać formaty treści i źródła ruchu. Kontynuować tylko te, które sprowadzają jakościowe wizyty i kliknięcia.
- [ ] Dopiero po potwierdzeniu zainteresowania rozważyć: zapisy na newsletter, ulubione, kreator stylizacji i dodatkowych partnerów poza SHEIN.

## 4. Jak oceniamy, czy to działa

| KPI | Definicja | Źródło |
| --- | --- | --- |
| Ruch | Wizyty i strony docelowe | Vercel Analytics |
| Widoczność | Wyświetlenia i kliknięcia w wyszukiwarce | Google Search Console |
| Zaangażowanie | Odsłony stylizacji i przejścia do produktów | Zdarzenia analityczne (do wdrożenia) |
| Intencja zakupu | Kliknięcia zewnętrzne / wizyty na odpowiedniej stronie; nie mieszać zdarzeń i użytkowników | `affiliate_clicks` + analityka |
| Wynik finansowy | Kwalifikowane zamówienia, zatwierdzone prowizje, wartość prowizji | Panel programu afiliacyjnego |
| Jakość | Udział działających, sprawdzonych linków; wiek ostatniej weryfikacji ceny | Przegląd redakcyjny |

**Progi sukcesu:** wyznaczyć na podstawie danych z pierwszych 14 dni; nie wpisywać fikcyjnych liczb ani nie obiecywać zarobków. Pierwsza decyzja: czy stylizacje mają lepszy stosunek przejść do sklepu do ruchu niż zwykłe produkty?

## 5. Techniczna higiena produktu — P1/P2

- [ ] Zastąpić szablonowy `README.md` prawdziwym opisem architektury, uruchomienia, procesu redakcyjnego i wdrożeń (bez sekretów).
- [ ] Dodać CI: `npm ci`, `npm run lint`, `npm run build`, testy krytycznych funkcji.
- [ ] Utworzyć testy sumowania zestawów, linków, filtrowania nieaktywnych produktów, SEO stron stylizacji i działania przekierowań.
- [ ] Wdrożyć kontrolowane migracje schematu Supabase, RLS dla tabel w publicznym schemacie i regularny przegląd uprawnień.
- [ ] Utrzymywać oddzielne środowiska testowe i produkcyjne, aktualne kopie zapasowe i zabezpieczone zmienne środowiskowe.
- [ ] Sprawdzić dostępność strony i Core Web Vitals na realnych urządzeniach; optymalizować po pomiarach.

## 6. Tabela priorytetów

| Priorytet | Zadanie | Dlaczego teraz |
| --- | --- | --- |
| P0 | Pomiar lejka i weryfikacja afiliacji | Bez tego nie wiemy, skąd bierze się brak zamówień |
| P0 | 5 gotowych stylizacji w budżecie | Użytkownik otrzyma realną, odróżniającą nas korzyść |
| P1 | Pomiar skuteczności stylizacji | Decyzje oparte na danych |
| P1 | Dystrybucja krótkich materiałów | Sprawdzenie, czy istnieje popyt i jakie treści przyciągają |
| P1 | Testy, CI i dokumentacja | Utrzymanie jakości wraz ze wzrostem produktu |
| P2 | Kreator budżetowy, newsletter, alerty | Dopiero po potwierdzeniu korzystania z podstawowej usługi |

## 7. Zasady redakcyjne i biznesowe

1. Nie sugerujemy, że osobiście testowaliśmy produkt, jeżeli tego nie robiliśmy.
2. Nie deklarujemy najniższych cen, dostępności ani procentów rabatu bez weryfikacji.
3. Wyraźnie oznaczamy relację afiliacyjną i przestrzegamy zasad programu partnerskiego.
4. Nie uznajemy kliknięcia za zakup.
5. Treści tworzymy najpierw dla użytkownika — konkretne zestawy, argumenty i ograniczenia.
6. Nie wdrażamy od razu na produkcję: zmiany przez gałąź → PR → przegląd → test → świadome połączenie.

---

**Następne działanie developerskie:** osobny PR z funkcją `/stylizacje` i 5 ręcznie przygotowanymi zestawami na istniejących rekordach produktów, po ustaleniu i sprawdzeniu dostępnych produktów. Ten dokument jest szkicem planu, nie wdrożeniem funkcji.

## 8. Aktualizacja realizacji — 22.10.2026

- **Etap 1 (MVP):** pięć stylizacji jest już opublikowanych; nie budujemy ich drugi raz.
- **Etap 0 (baseline):** potwierdzono 34 kliknięcia `/go` za 30 dni i 7 za ostatnich 7 dni; brak zweryfikowanych odwiedzin, wyników Search Console i prowizji — patrz [biznesowy stan wyjściowy](./BAZA-BIZNESOWA.md).
- **Etap 2 (Wydanie 02):** kod atrybucji i admina przygotowany, build Windows zaliczony; migracja Supabase nadal niewykonana, bo CSV nie stanowi kompletnej i przetestowanej kopii do odtworzenia.
- **Decyzja biznesowa:** przez pierwszych 14 dni po uruchomieniu pomiaru nie deklarujemy „wygranego” zestawu bez wiarygodnego mianownika odsłon i poprawnego udziału kliknięć ze znanym źródłem.
- **Wymogi operacyjne:** bez GitHub Actions, bez płatnych dodatków i bez dodatkowych Vercel Preview. Publikacja dopiero po kontrolach przywracania danych.

## 9. Jakość ofert przed skalowaniem ruchu — 23.10.2026

Weryfikacja strukturalna 97 aktywnych ofert: pola HTTPS, opisy i ceny kompletne, ale żadna oferta nie ma potwierdzonego klucza identyfikacyjnego SHEIN, a 86 nie było edytowanych w ostatnim tygodniu. **Działanie P1:** sprawdzić w sklepie 11 produktów z pięciu gotowych stylizacji, zaczynając od Streetwear z zapasem katalogowym 1 zł; następnie systematycznie sprawdzać pozostałe oferty, wykorzystując istniejący moduł duplikatów. Bez masowego dodawania produktów i bez automatycznego poprawiania cen. Patrz [JAKOSC-OFERT.md](./JAKOSC-OFERT.md).
