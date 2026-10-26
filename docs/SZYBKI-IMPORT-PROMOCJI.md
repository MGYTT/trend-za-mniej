# Szybki import promocji

Panel: /admin/kody-rabatowe (tylko właściciel).

Import:
1. Sklep musi już istnieć w katalogu. Kampanie SHEIN są w osobnym panelu.
2. Wklej tabelę CSV oddzieloną średnikami albo TSV skopiowane z arkusza.
3. Pierwszy wiersz: sklep;tytul;opis;typ;kod;data;link
4. Maksymalnie 20 wierszy na import; typ = coupon, campaign albo promotion.
5. Dla promotion kod pozostaje pusty. Data (RRRR-MM-DD) i link (HTTPS w domenie sklepu) są opcjonalne.
6. Sprawdź podgląd błędów. Zatwierdź import. Wszystkie wiersze zapisują się jako szkice.

Przed publikacją ręcznie sprawdź kod, link, daty i warunki u sprzedawcy.
Import nie publikuje niczego automatycznie. Zapobieganie duplikatom:
dla kodów sklep+rodzaj+kod, dla promocji sklep+rodzaj+tytuł;
w podglądzie i ponownie w API. Współbieżne importy mogą teoretycznie
utworzyć duplikaty bez unikalnego indeksu na bazie.

Przycisk "Duplikuj jako szkic" kopiuje dane oferty do nowego formularza,
zachowuje kod jako punkt wyjścia, ale czyści datę, wyłącza publikację oraz oznaczenie weryfikacji. Ponownie sprawdź kod przed publikacją.
Automatyczny harmonogram wyłączania wygasłych ofert Supabase pozostaje bez zmian.
