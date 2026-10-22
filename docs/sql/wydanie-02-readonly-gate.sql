-- WYDANIE 02 — tylko odczyt. Bez DDL, bez DML.
-- Uruchamiane przez asystenta przed migracją; wynik nie zastępuje kopii bazy.
-- "ready_for_additive_sql" weryfikuje wyłącznie wstępne warunki techniczne,
-- NIE oznacza zgody na migrację ani potwierdzenia możliwości przywrócenia danych.
WITH baseline AS (
  SELECT
    (SELECT relrowsecurity FROM pg_class WHERE oid='public.affiliate_clicks'::regclass) AS rls_on,
    has_table_privilege('anon','public.affiliate_clicks','SELECT') AS anon_select,
    has_table_privilege('anon','public.affiliate_clicks','INSERT') AS anon_insert,
    (SELECT COUNT(*) FROM information_schema.columns
      WHERE table_schema='public' AND table_name='affiliate_clicks'
        AND column_name IN ('source_type','outfit_slug')) AS new_cols,
    (SELECT count(*) FROM public.products) AS products,
    (SELECT count(*) FROM public.affiliate_clicks) AS clicks,
    (SELECT count(*) FROM public.affiliate_clicks c
       LEFT JOIN public.products p ON c.product_id=p.id WHERE p.id IS NULL) AS orphan_clicks,
    (SELECT count(*) FROM public.product_slug_redirects r
       LEFT JOIN public.products p ON r.product_id=p.id WHERE p.id IS NULL) AS orphan_redirects
)
SELECT
  products,clicks,new_cols,rls_on,anon_select,anon_insert,
  orphan_clicks,orphan_redirects,
  (rls_on AND NOT anon_select AND NOT anon_insert
    AND orphan_clicks=0 AND orphan_redirects=0 AND new_cols=0)
    AS ready_for_additive_sql
FROM baseline;

-- Symulacja wartości DEFAULT 'unknown' po dodaniu kolumn, bez zmiany tabel.
WITH days AS (SELECT x FROM (VALUES (7),(30)) AS p(x)),
existing_clicks AS (
 SELECT d.x AS days, c.id, 'unknown'::text AS source_type, NULL::text AS outfit_slug
 FROM days d JOIN public.affiliate_clicks c
 ON c.created_at >= current_date - (d.x - 1)
)
SELECT d.x AS days,
  (SELECT count(*) FROM public.affiliate_clicks c
     WHERE c.created_at >= current_date - (d.x - 1)) AS old_total,
  count(e.id) AS simulated_new_total,
  count(e.id) FILTER (WHERE e.source_type='unknown' AND e.outfit_slug IS NULL) AS compatible_rows
FROM days d LEFT JOIN existing_clicks e ON e.days=d.x
GROUP BY d.x ORDER BY d.x;

-- Publicznie wywoływalna funkcja SECURITY DEFINER: istniejące ryzyko do naprawy.
SELECT p.oid::regprocedure::text AS routine,
  p.prosecdef AS security_definer,
  pg_get_userbyid(p.proowner) AS owner,
  has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute
FROM pg_proc p
WHERE p.oid IN (
  'public.queue_search_index_path(text,text)'::regprocedure,
  'public.queue_product_index_change()'::regprocedure
)
ORDER BY routine;
