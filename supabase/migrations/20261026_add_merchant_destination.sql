-- Additive migration: old app remains compatible during Vercel preview and rollout.
alter table public.extension_offers add column if not exists destination_url text;
alter table public.extension_offers add constraint extension_destination_url_https
  check (destination_url is null or
    (length(destination_url) between 12 and 2000 and destination_url ~ '^https://[^[:space:]]+$'));
