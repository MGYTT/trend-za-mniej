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
