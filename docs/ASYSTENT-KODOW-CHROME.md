# Asystent kodów Trendzamniej 0.4.0

1. Otwórz obsługiwany sklep posiadający oferty Trendzamniej.
2. Kliknij ikonę wtyczki Chrome. Rozpoznany sklep jest automatycznie wyróżniony.
3. Kliknij „Pokaż kody na stronie sklepu”. Dopiero wtedy wyświetli się panel w bieżącej karcie.
4. Możesz skopiować kod, przeczytać jego typ i zamknąć panel przyciskiem × albo Esc.
5. Zaznacz lub odznacz „Tylko promocje obecnego sklepu”.

Prywatność: uprawnienie tabs służy rozpoznawaniu domeny; activeTab i scripting
pozwalają wyświetlić panel po jednoznacznym kliknięciu. Host permissions obejmują
tylko https://trendzamniej.pl/*, skąd pobierana jest lista ofert.
Nie ma automatycznej podmiany linków, modyfikacji cookies, próbowania kodów
w koszyku ani wysyłania adresu odwiedzanej strony do serwera Trendzamniej.

Testy: npm run test:extension, npm run build.
Instalacja lokalna: chrome://extensions → Tryb dewelopera → Załaduj rozpakowane → extension/.
Wersja Chrome Web Store wymaga osobnej publikacji. Adaptery automatycznego
testowania kodów będą odrębnym, regulaminowo sprawdzonym etapem.
