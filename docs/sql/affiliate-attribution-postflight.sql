-- READ-ONLY: uruchom po udanym wykonaniu affiliate-click-attribution.sql
-- i przed wdrożeniem frontendu. Każde false w kolumnach *_ok wymaga wyjaśnienia.

-- 1) RLS i uprawnienia do funkcji oraz tabeli.
SELECT
  c.relrowsecurity AS rls_enabled,
  NOT has_table_privilege('anon','public.affiliate_clicks','SELECT') AS anon_select_blocked_ok,
  NOT has_table_privilege('anon','public.affiliate_clicks','INSERT') AS anon_insert_blocked_ok,
  NOT has_function_privilege('anon','public.get_affiliate_source_stats(integer)','EXECUTE') AS anon_rpc_blocked_ok,
  has_function_privilege('authenticated','public.get_affiliate_source_stats(integer)','EXECUTE') AS authenticated_rpc_granted_ok,
  NOT p.prosecdef AS function_invoker_ok
FROM pg_class c
JOIN pg_proc p ON p.oid = 'public.get_affiliate_source_stats(integer)'::regprocedure
WHERE c.oid = 'public.affiliate_clicks'::regclass;

-- 2) Nowe kolumny.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='affiliate_clicks'
  AND column_name IN ('source_type','outfit_slug')
ORDER BY column_name;

-- 3) Spójność 7 i 30 dni z licznikiem wszystkich kliknięć.
-- SQL Editor działa z uprawnieniami właściciela, dlatego może widzieć
-- wszystkie rekordy; dodatkowo przetestuj aplikację jako administrator.
SELECT '7 dni' AS period,
       (SELECT count(*) FROM public.affiliate_clicks WHERE created_at >= current_date - 6) AS all_clicks,
       (SELECT coalesce(sum(clicks),0) FROM public.get_affiliate_source_stats(7)) AS classified_clicks
UNION ALL
SELECT '30 dni',
       (SELECT count(*) FROM public.affiliate_clicks WHERE created_at >= current_date - 29),
       (SELECT coalesce(sum(clicks),0) FROM public.get_affiliate_source_stats(30));

-- 4) RLS: osobno zweryfikuj w aplikacji,
-- że zalogowany zwykły użytkownik NIE widzi danych raportu.
-- Test roli anon wymaga żądania API z anon key, a nie sesji SQL Editor.
