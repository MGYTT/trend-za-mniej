-- Merchant directory only. This migration does NOT activate cashback, create payout promises or alter affiliate attribution.
create table if not exists public.extension_stores (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 80),
  name text not null check (length(trim(name)) between 2 and 120),
  description text not null default '' check (length(description) <= 1200),
  domains text[] not null check (cardinality(domains) between 1 and 12),
  category text not null default 'Inne' check (length(category) between 2 and 60),
  website_url text not null check (website_url ~ '^https://[^[:space:]]+$' and length(website_url) <= 400),
  cashback_state text not null default 'unavailable' check (cashback_state in ('unavailable', 'preparing')),
  published boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.extension_stores enable row level security;
create policy "Visitors read published stores" on public.extension_stores
  for select to anon, authenticated using (published = true);
create policy "Owner reads all stores" on public.extension_stores
  for select to authenticated using ((select public.is_owner()));
create policy "Owner inserts stores" on public.extension_stores
  for insert to authenticated with check ((select public.is_owner()) and created_by = (select auth.uid()));
create policy "Owner updates stores" on public.extension_stores
  for update to authenticated using ((select public.is_owner()))
  with check ((select public.is_owner()) and created_by = (select auth.uid()));
create policy "Owner deletes stores" on public.extension_stores
  for delete to authenticated using ((select public.is_owner()));
grant select on public.extension_stores to anon, authenticated;
grant insert, update, delete on public.extension_stores to authenticated;

alter table public.extension_offers
  add column if not exists store_slug text references public.extension_stores(slug) on delete set null;
create index if not exists extension_offers_store_slug_idx
  on public.extension_offers (store_slug) where published = true;
