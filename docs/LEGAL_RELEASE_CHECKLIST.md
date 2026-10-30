# Trend za Mniej — kontrola publikacji (30.10.2026)

Serwis ma charakter informacyjno-afiliacyjny. Operator jest osobą fizyczną i deklaruje prowadzenie działalności nierejestrowanej. Ten dokument to checklista techniczno-prawna, a nie potwierdzenie pełnej zgodności z przepisami.

## Zrealizowane w kodzie
- Regulamin wskazuje osobę fizyczną i charakter działalności nierejestrowanej, bez fikcyjnego NIP/REGON.
- Kontakt, regulamin i polityka prywatności używają tych samych danych właściciela oraz adresu e-mail.
- Adres zamieszkania i adres operatora mogą być podane bez zapisywania prywatnych danych w publicznym repozytorium, przez **dwie zmienne środowiskowe Vercel**:
  - `SITE_OWNER_RESIDENCE_PLACE` — rzeczywiste miejsce zamieszkania (miejscowość)
  - `SITE_OWNER_POSTAL_ADDRESS` — rzeczywisty adres do ujawnienia na stronie
- Obydwa pola będą widoczne publicznie po poprawnym ustawieniu **obu** zmiennych oraz ponownym wdrożeniu. Nie ustawiaj ich bez świadomej decyzji właściciela.
- Karty kampanii SHEIN niesprawdzonych w ostatnich 14 dniach nie wyświetlają w nagłówkach niepotwierdzonych kwot, procentów i zapewnień o rabacie. Zachowują kod, ostrzeżenie, szczegóły historyczne i link afiliacyjny.
- Data aktualizacji katalogu nie jest prezentowana jako data weryfikacji rabatu.
- Linki afiliacyjne pozostają opisane jako reklama przed przejściem do sklepu.

## Do wykonania przez operatora (nie można potwierdzić wyłącznie z repozytorium)
1. **Uzupełnij dane adresowe**: art. 5 ust. 2 ustawy o świadczeniu usług drogą elektroniczną wymaga dla osoby fizycznej wskazania imienia i nazwiska, miejsca zamieszkania i adresu, a także adresów elektronicznych. Zmiennych z danymi osobowymi nie commituj do GitHub. Bez uzupełnienia tej informacji obowiązek może pozostawać niespełniony.
2. **Weryfikuj promocje** w panelu administracyjnym. Potwierdzenie musi oznaczać faktyczne sprawdzenie: kwoty/rabatu, terminu, grupy klientów, minimalnego koszyka, ewentualnego limitu kuponu oraz warunków w SHEIN. Jeśli brakuje 30-dniowej ceny referencyjnej, nie przedstawiaj danego produktu jako przecenionego, zanim zweryfikujesz zastosowanie obowiązku Omnibus.
3. **Sprawdź zgodność zasad użycia zdjęć** z licencją/programem afiliacyjnym. Wpis w regulaminie o prawach właścicieli fotografii nie nadaje licencji.
4. **Zweryfikuj w produkcji cookies/localStorage**: szczególnie Web Analytics, Supabase Auth, statystyki kliknięć i wszelkie dodatkowe narzędzia. W razie użycia technologii wymagającej uprzedniej zgody skonfiguruj mechanizm przed uruchomieniem takiej technologii.
5. **Potwierdź retencję i transfery danych** w ustawieniach Vercel, Supabase, poczty i bazie zdarzeń. Następnie zastąp ogólne kryteria w polityce prywatności konkretnymi okresami/zasadami opartymi na faktycznej konfiguracji. Nie publikuj zmyślonych okresów przechowywania.
6. **Sprawdź status podatkowy**: zasady działalności nierejestrowanej mają dodatkowe warunki; limit w 2026 r. wynosi 10 813,50 zł przychodu należnego na kwartał. Odrębnie rozważ VAT-UE dla usług zagranicznego kontrahenta.
7. Jeśli charakter lub forma prowadzenia serwisu się zmieni, zaktualizuj regulamin i politykę prywatności.
8. Po wdrożeniu sprawdź w przeglądarce stronę `/regulamin`, `/kontakt`, `/polityka-prywatnosci`, `/promocje-shein` i co najmniej kilka kart produktów.

## Podstawy i wytyczne
- [Ustawa o świadczeniu usług drogą elektroniczną (art. 5)](https://eli.gov.pl/api/acts/DU/2024/1513/text.html)
- [UOKiK — informacje o obniżkach cen](https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/)
- [UOKiK — influencer marketing i linki afiliacyjne](https://uokik.gov.pl/influencer-marketing)
- [Biznes.gov.pl — działalność nierejestrowana](https://biznes.gov.pl/pl/firma/zakladanie-firmy/chce-wiedziec-jak-zalozyc-wlasna-firme/dzialalnosc-nierejestrowa-oraz-inne-sytuacje-w-ktorych-nie-trzeba-rejestrowac-firmy)
