-- READ ONLY: run after security-queue-lockdown.sql.
-- This does not invoke the queue function or change any data.
SELECT
  p.proname AS function_name,
  pg_get_userbyid(p.proowner) AS owner_role,
  p.prosecdef AS security_definer,
  NOT has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_blocked_ok,
  NOT has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_blocked_ok,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_allowed_ok
FROM pg_proc AS p
WHERE p.oid = 'public.queue_search_index_path(text,text)'::regprocedure;

-- Confirm the trigger still exists and points to its internal function.
SELECT tgname, tgrelid::regclass AS target_table, tgfoid::regprocedure AS handler
FROM pg_trigger
WHERE NOT tgisinternal AND tgname = 'products_queue_index_change';
