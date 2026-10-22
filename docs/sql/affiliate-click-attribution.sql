-- WYDANIE 02: zmianę wykonujemy JEDEN RAZ w Supabase SQL Editor,
-- po zatwierdzeniu kopii zapasowej i testach przedwdrożeniowych.
-- Dodajemy źródło kliknięcia, nie zapisujemy IP/cookies/użytkowników.
-- Historię kliknięć zachowujemy (domyślnie 'unknown').


BEGIN;
-- Nie blokuj długo zapisów na działającej stronie.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- RLS i brak dostępu anon muszą być zachowane przez migrację.
-- Jeśli zabezpieczenia różnią się od stanu zaakceptowanego w przeglądzie,
-- przerwij transakcję zamiast wykonywać zmianę na nieznanym schemacie.
DO $verify_privacy$
BEGIN
  IF NOT (
    SELECT relrowsecurity
    FROM pg_class
    WHERE oid = 'public.affiliate_clicks'::regclass
  ) THEN
    RAISE EXCEPTION 'Wydanie 02: RLS affiliate_clicks nie jest wlaczone';
  END IF;

  IF has_table_privilege('anon', 'public.affiliate_clicks', 'SELECT')
     OR has_table_privilege('anon', 'public.affiliate_clicks', 'INSERT') THEN
    RAISE EXCEPTION 'Wydanie 02: anon ma nieoczekiwane uprawnienia do klikniec';
  END IF;
END
$verify_privacy$;

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS outfit_slug text;

DO $check_source$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.affiliate_clicks'::regclass
      AND conname = 'affiliate_clicks_source_type_check'
  ) THEN
    ALTER TABLE public.affiliate_clicks
      ADD CONSTRAINT affiliate_clicks_source_type_check
      CHECK (source_type IN ('outfit', 'product', 'unknown'));
  END IF;
END
$check_source$;

DO $check_consistency$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.affiliate_clicks'::regclass
      AND conname = 'affiliate_clicks_attribution_consistency_check'
  ) THEN
    ALTER TABLE public.affiliate_clicks
      ADD CONSTRAINT affiliate_clicks_attribution_consistency_check
      CHECK (
        (source_type IN ('product', 'unknown') AND outfit_slug IS NULL)
        OR (
          source_type = 'outfit'
          AND outfit_slug IS NOT NULL
          AND length(outfit_slug) <= 100
          AND outfit_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        )
      );
  END IF;
END
$check_consistency$;

CREATE INDEX IF NOT EXISTS affiliate_clicks_created_source_idx
  ON public.affiliate_clicks (created_at DESC, source_type, outfit_slug);

CREATE OR REPLACE FUNCTION public.get_affiliate_source_stats(p_days integer)
RETURNS TABLE (
  source_type text,
  outfit_slug text,
  clicks bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $source_stats$
  SELECT c.source_type, c.outfit_slug, count(*)::bigint AS clicks
  FROM public.affiliate_clicks AS c
  -- Match get_clicks_by_day(): today + previous (p_days - 1) calendar days.
  WHERE c.created_at >= current_date
    - (greatest(1, least(90, coalesce(p_days, 30))) - 1)
  GROUP BY c.source_type, c.outfit_slug
  ORDER BY clicks DESC, c.source_type, c.outfit_slug;
$source_stats$;

REVOKE EXECUTE ON FUNCTION public.get_affiliate_source_stats(integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_affiliate_source_stats(integer)
  TO authenticated, service_role;

COMMIT;

-- PO WYKONANIU: docs/sql/affiliate-attribution-postflight.sql.
-- Czytelnik niebędący administratorem NIE powinien widzieć wyników przez RLS.
