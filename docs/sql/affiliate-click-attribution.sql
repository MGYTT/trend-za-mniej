-- RUN MANUALLY in Supabase SQL Editor before releasing version 02.
-- No user IDs, IP addresses, cookies or browsing history are collected.
-- Existing public.affiliate_clicks rows remain; they are tagged as "unknown".
-- RLS policy for SELECT remains unchanged (admins only).
-- Test the grants/RLS after applying. Backup beforehand.

BEGIN;

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS outfit_slug text;

DO $$
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
END $$;

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
AS $function$
  SELECT c.source_type, c.outfit_slug, count(*)::bigint
  FROM public.affiliate_clicks AS c
  WHERE c.created_at >= now() - make_interval(
    days => greatest(1, least(90, coalesce(p_days, 30)))
  )
  GROUP BY c.source_type, c.outfit_slug
  ORDER BY count(*) DESC, c.source_type, c.outfit_slug;
$function$;

REVOKE ALL ON FUNCTION public.get_affiliate_source_stats(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_affiliate_source_stats(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_affiliate_source_stats(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_source_stats(integer) TO service_role;

COMMIT;

-- Post-apply smoke tests in SQL Editor:
-- SELECT * FROM public.get_affiliate_source_stats(30);  -- database owner can view all
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='affiliate_clicks';
-- Verify anon role cannot execute the stats RPC, and authenticated non-admin
-- returns no rows due to the existing affiliate_clicks RLS SELECT policy.
