-- READ-ONLY: uruchom w Supabase SQL Editor przed migracją analityczną.
-- Nie uruchamia DDL ani DML; raportuje stan przed wdrożeniem.

-- 1) Tabela, RLS, uprawnienia
SELECT
  c.relrowsecurity AS rls_enabled,
  has_table_privilege('anon', 'public.affiliate_clicks', 'SELECT') AS anon_select_granted,
  has_table_privilege('anon', 'public.affiliate_clicks', 'INSERT') AS anon_insert_granted,
  has_table_privilege('authenticated', 'public.affiliate_clicks', 'SELECT') AS auth_select_granted
FROM pg_class AS c
WHERE c.oid = 'public.affiliate_clicks'::regclass;

-- 2) Obecne kolumny (przed migracją nowe powinny być nieobecne).
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'affiliate_clicks'
ORDER BY ordinal_position;

-- 3) Bieżące sumy do porównania po migracji.
SELECT
  (SELECT count(*) FROM public.affiliate_clicks
    WHERE created_at >= current_date - 6) AS clicks_7d,
  (SELECT count(*) FROM public.affiliate_clicks
    WHERE created_at >= current_date - 29) AS clicks_30d,
  current_setting('TimeZone') AS db_timezone;

-- 4) Polityki SELECT: administratorzy powinni być jedynymi czytelnikami.
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'affiliate_clicks'
ORDER BY policyname;

-- 5) Uproszczona całościowa kontrola preflight:
-- docs/sql/wydanie-02-readonly-gate.sql
