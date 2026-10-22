# Kontrola bezpieczeństwa Supabase — przed wydaniem 02

Data odczytu: **21 października 2026 r.**  
Zakres: przegląd zaleceń Supabase Database Advisors, bez zmian w produkcyjnej bazie.

## Wnioski

- Supabase Database Advisors pokazuje **18 funkcji SECURITY DEFINER z uprawnieniem EXECUTE dla roli anon** oraz analogiczne ostrzeżenia dla roli authenticated. Wśród nich znajdują się funkcje wyzwalaczy (trigger), których nie można wywołać jak zwykłych funkcji RPC.
- To **ostrzeżenia o ekspozycji**, nie potwierdzenie, że funkcje dają nieautoryzowany dostęp. Przegląd wybranych funkcji administracyjnych wykazał sprawdzanie tożsamości i ról przez `auth.uid()` i pomocnicze funkcje właściciela. Pełny audyt wywołań i polityk pozostaje otwarty.
- Osobne ostrzeżenie: nieaktywna ochrona przed używaniem haseł obecnych w znanych wyciekach.
- `public.affiliate_clicks` ma włączony **RLS**, rolę `anon` bez `SELECT` i `INSERT`, rolę `authenticated` z `SELECT` ograniczonym polityką do administratorów.
- Nowy `get_affiliate_source_stats(integer)` ma działać jako `SECURITY INVOKER`; dostęp RPC tylko dla `authenticated` i `service_role`. Sama rola `authenticated` NIE daje prawa odczytu danych bez polityki RLS.

## Działania przed wdrożeniem

1. Przeanalizować wszystkie funkcje z zakładki **Database Advisors → Security** w panelu Supabase.
2. Ustalić, które funkcje powinny być dostępne dla `anon`, `authenticated` i ról wewnętrznych. Rozdzielić zwykłe RPC od funkcji triggerów oraz funkcji wykorzystywanych wewnętrznie przez RLS.
3. Nie usuwać masowo `EXECUTE` bez przejrzenia zależności — mogłoby to zablokować logowanie, odczyt produktów, panel admina lub triggery.
4. Dla administracyjnych RPC, które nie są potrzebne anonimowym użytkownikom, zaplanować ograniczenie uprawnień po przeprowadzeniu testów uprawnień w środowisku testowym.
5. W ustawieniach Supabase Auth rozważyć włączenie **Leaked Password Protection**.
6. Po wdrożeniu migracji analitycznej ponownie uruchomić Advisors i zweryfikować polityki RLS.

## Dokumentacja

- [Supabase: Database Linter — publicznie dostępne funkcje SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Leaked Password Protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

**Żadnych uprawnień, funkcji ani konfiguracji uwierzytelniania nie zmieniono w produkcji.**

## Weryfikacja szczegółowa 21.10.2026 — kolejka SEO

**Potwierdzony problem konfiguracji:** `public.queue_search_index_path(text,text)` ma `SECURITY DEFINER`, jest własnością `postgres`, dopuszcza `anon` i `authenticated` do `EXECUTE`, a sama nie sprawdza `auth.uid()`. Dopisuje przekazane ścieżki do `public.search_index_queue`. Możliwe jest bezpośrednie zgłaszanie niechcianych ścieżek przez REST RPC. Nie stwierdzono wykorzystania tej możliwości przez osoby trzecie.

**Bezpieczna proponowana poprawka:** `docs/sql/security-queue-lockdown.sql` odbiera uprawnienie bezpośredniego `EXECUTE` rolom `PUBLIC`, `anon`, `authenticated`, pozostawia `service_role`. Nie zmienia kodu funkcji i nie usuwa żadnych danych. Trigger `products_queue_index_change` wykonuje się jako `postgres` i z tej pozycji nadal może wywołać funkcję. W kodzie aplikacji nie znaleziono bezpośrednich wywołań tego RPC; panel obsługuje kolejkę przez tabelę / chronioną trasę serwera.

Przed produkcyjnym wykonaniem skryptu zalecany test w bazie testowej: utworzyć/zmienić testową ofertę i upewnić się, że trigger tworzy wpis w kolejce. W produkcji najpierw wykonać kopię zapasową i przejrzeć uprawnienia, następnie po wykonaniu skryptu uruchomić **`docs/sql/security-queue-postflight.sql`**. Nie wywoływać tego RPC anonimowo w formie testu zapisu na produkcji.

**Pozostałe 17 funkcji:** 4 to funkcje triggerów (łącznie z `queue_product_index_change`), a nie zwykłe RPC. Funkcje administracyjne korzystają z `auth.uid()` lub sprawdzeń roli właściciela. Nie zaleca się masowego odbierania `EXECUTE` — `is_admin`, `is_owner`, `can_manage_product`, `is_admin_user`, `owner_role_exists` są używane przez RLS lub panel administracyjny. Reszta wymaga osobnego przeglądu uprawnień i zależności.

Stan: **skrypty zapisane w repozytorium, NIE wykonano ich na produkcji**.
