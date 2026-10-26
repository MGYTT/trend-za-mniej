-- Additive migration: existing SHEIN campaigns, products and redirects are unchanged.
create table if not exists public.extension_offers (
  id uuid primary key default gen_random_uuid(),
  store_name text not null check (length(trim(store_name)) between 2 and 120),
  store_domains text[] not null check (cardinality(store_domains) between 1 and 12),
  title text not null check (length(trim(title)) between 5 and 180),
  description text not null default '' check (length(description) <= 1500),
  offer_type text not null check (offer_type in ('coupon','campaign','promotion')),
  code text check (code is null or length(code) between 2 and 90),
  page_path text not null default '/kody-rabatowe'
    check (page_path ~ '^/[a-zA-Z0-9/_-]*$' and page_path !~ '^//'),
  published boolean not null default false,
  valid_until date,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id),
  constraint extension_code_required check (offer_type = 'promotion' or code is not null)
);
create index if not exists extension_offers_published_idx
  on public.extension_offers (published, valid_until);
alter table public.extension_offers enable row level security;

drop policy if exists "Public reads active extension offers" on public.extension_offers;
create policy "Public reads active extension offers" on public.extension_offers
  for select to anon, authenticated using (
    published = true and (valid_until is null or valid_until >= current_date)
  );
drop policy if exists "Owner reads all extension offers" on public.extension_offers;
create policy "Owner reads all extension offers" on public.extension_offers
  for select to authenticated using ((select public.is_owner()));
drop policy if exists "Owner adds extension offers" on public.extension_offers;
create policy "Owner adds extension offers" on public.extension_offers
  for insert to authenticated with check (
    (select public.is_owner()) and created_by = (select auth.uid())
  );
drop policy if exists "Owner changes extension offers" on public.extension_offers;
create policy "Owner changes extension offers" on public.extension_offers
  for update to authenticated using ((select public.is_owner()))
  with check ((select public.is_owner()) and created_by = (select auth.uid()));
drop policy if exists "Owner removes extension offers" on public.extension_offers;
create policy "Owner removes extension offers" on public.extension_offers
  for delete to authenticated using ((select public.is_owner()));

grant select on public.extension_offers to anon, authenticated;
grant insert, update, delete on public.extension_offers to authenticated;