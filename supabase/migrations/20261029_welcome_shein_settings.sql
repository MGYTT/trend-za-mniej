-- One editable first-visit SHEIN welcome offer. Content is only publicly readable when active.
create table if not exists public.welcome_shein_offer (
  id text primary key default 'homepage',
  enabled boolean not null default true,
  eyebrow text not null default '🎁 Oferta powitalna SHEIN',
  greeting text not null default 'Gratulacje! 🎉',
  headline text not null default 'Ekskluzywna oferta dla Ciebie! 🎁',
  discount_percent smallint not null default 60 check (discount_percent between 1 and 100),
  discount_prefix text not null default 'Do',
  discount_suffix text not null default 'zniżki',
  audience text not null default 'Tylko dla kwalifikujących się nowych użytkowników',
  instruction text not null default '🌟 Wyszukaj poniższy kod w aplikacji SHEIN, aby sprawdzić ofertę:',
  campaign_code text not null default 'SBNSL5D' check (campaign_code ~ '^[A-Z0-9]{4,14}$'),
  affiliate_url text not null default 'https://onelink.shein.com/58/66hx4q3nwzrl'
    check (affiliate_url ~ '^https://onelink[.]shein[.]com/[0-9]+/[a-z0-9]+$'),
  cta_label text not null default 'Sprawdź ofertę w SHEIN',
  dismiss_label text not null default 'Nie teraz, przeglądaj stylizacje',
  extra_note text not null default '',
  theme text not null default 'peach' check (theme in ('peach','rose','lavender')),
  delay_seconds smallint not null default 10 check (delay_seconds between 3 and 60),
  campaign_version integer not null default 1 check (campaign_version between 1 and 1000000),
  valid_until date null,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id),
  constraint welcome_shein_singleton check (id = 'homepage'),
  constraint welcome_shein_copy_lengths check (
    char_length(eyebrow) between 3 and 90 and
    char_length(greeting) between 3 and 100 and
    char_length(headline) between 5 and 150 and
    char_length(discount_prefix) between 1 and 12 and
    char_length(discount_suffix) between 1 and 24 and
    char_length(audience) between 5 and 200 and
    char_length(instruction) between 10 and 300 and
    char_length(cta_label) between 5 and 100 and
    char_length(dismiss_label) between 5 and 100 and
    char_length(extra_note) <= 400
  )
);
alter table public.welcome_shein_offer enable row level security;
create policy "Public reads enabled and unexpired welcome offer"
  on public.welcome_shein_offer for select to anon, authenticated
  using (enabled = true and (valid_until is null or valid_until >= current_date));
create policy "Owner reads all welcome settings"
  on public.welcome_shein_offer for select to authenticated
  using ((select public.is_owner()));
create policy "Owner updates welcome offer"
  on public.welcome_shein_offer for update to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));
revoke all on public.welcome_shein_offer from anon, authenticated;
grant select on public.welcome_shein_offer to anon, authenticated;
grant update on public.welcome_shein_offer to authenticated;
insert into public.welcome_shein_offer (id)
values ('homepage')
on conflict (id) do nothing;
