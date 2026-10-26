-- Run AFTER the new production app no longer queries the old field.
alter table public.extension_stores drop column if exists cashback_state;
