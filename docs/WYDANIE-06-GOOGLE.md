# Wydanie 06 — wizerunek marki w Google

## Cel

Wyświetlać spójny i wiarygodny komunikat dla Trend za Mniej: gotowe stylizacje damskie, poradniki i wybrane oferty, zamiast ogólnego hasła „ubrania i promocje”. Zwiększamy szanse na czytelne tytuły i opisy, ale Google tworzy finalny wynik sam; żadna zmiana nie gwarantuje pozycji, CTR, favicony ani sitelinków.

## Zmiany

- Główny \`<title>\`, meta description, OG/Twitter i widoczny \`<h1>\` opisują tę samą ofertę, ze spójną marką Trend za Mniej.
- \`/stylizacje\` i \`/poradniki\` mają krótsze, unikalne tytuły i opisy bez obietnic „najniższej ceny” lub niepotwierdzonego rabatu.
- W \`WebSite\` i \`Organization\` utrzymana nazwa Trend za Mniej, z jednym alternatywnym wariantem TrendZaMniej, bez reklamowego sloganu jako alternatywnej nazwy.
- Favicon /icon 512×512 i Apple /apple-icon 180×180: białe **T** na jednolitym różowym tle. Te same, stabilne adresy URL; generator PNG przeniesiony z przestarzałego Edge Runtime do Node.js (Next.js ImageResponse).
- OG 1200×630: zachowana identyfikacja marki, ale bez niepotwierdzonego hasła „codziennie nowe”. Poradniki indywidualne wskazują istniejącą grafikę udostępniania.
- Bez zmian adresów URL, przekierowań afiliacyjnych, produktów, sitemap, RLS i Supabase; brak fałszywych ocen, recenzji, bieżących cen lub dodatkowych schematów rich-results.

## Weryfikacja

- \`npm run verify:google-seo\` uruchamia testy stylizacji, poradników, SEO oraz lint + Next.js build. Sprawdź ikonę i kartę social w działającym buildzie.
- Po wdrożeniu: otwórz \`/icon\`, \`/opengraph-image\`, \`/robots.txt\` i \`/sitemap.xml\` oraz odpowiednie adresy stron. Zweryfikuj, czy zwracają prawidłową treść i metadane.
- W Google Search Console: przetestuj aktualny URL, zbadaj indeksowanie strony głównej, \`/stylizacje\` i \`/poradniki\`. Po ponownym skanowaniu obserwuj wyświetlenia i CTR; nie wymyślaj wyników. Rich Results Test nie gwarantuje, że wyszukiwarka pokaże specjalny wynik.

Oficjalne zalecenia Google:
- https://developers.google.com/search/docs/appearance/title-link?hl=pl
- https://developers.google.com/search/docs/appearance/snippet?hl=pl
- https://developers.google.com/search/docs/appearance/favicon-in-search?hl=pl
- https://developers.google.com/search/docs/appearance/site-names?hl=pl
