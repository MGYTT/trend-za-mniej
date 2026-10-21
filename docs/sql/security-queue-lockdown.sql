-- SECURITY HARDENING (plan): block direct external RPC calls that enqueue URLs.
-- Execute independently after DBA/owner review and verifying no frontend calls
-- to queue_search_index_path. No other permissions are touched.
--
-- products_queue_index_change trigger calls this function from a
-- SECURITY DEFINER function owned by postgres; therefore its privileged
-- internal call should remain possible. Verify by editing a test product
-- in a NON-PRODUCTION database before using on production.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.queue_search_index_path(text, text)
  FROM PUBLIC, anon, authenticated;

-- Preserve access for trusted server-side service-role operations.
GRANT EXECUTE ON FUNCTION public.queue_search_index_path(text, text)
  TO service_role;

COMMIT;

-- Verify access flags with docs/sql/security-queue-postflight.sql.
