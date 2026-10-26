-- Curated store directory entries: no affiliate partnership, coupon or cashback claim.
-- Do not fabricate promo codes: every initial store has 0 third-party offers.
with owner as (
  select user_id from public.admins where role = 'owner'
  order by created_at asc limit 1
)
insert into public.extension_stores
  (slug, name, description, domains, category, website_url, cashback_state, published, created_by)
select v.slug, v.name, v.description, v.domains, v.category, v.website_url,
  'unavailable', true, owner.user_id
from (
  values
    ('zalando', 'Zalando',
     'Moda i obuwie. Trendzamniej nie ma jeszcze zweryfikowanych kuponów dla tego sklepu; obecność w katalogu nie oznacza współpracy.',
     array['zalando.pl']::text[], 'Moda', 'https://www.zalando.pl/'),
    ('modivo', 'MODIVO',
     'Sklep odzieżowy wielu marek. Aktualnie brak potwierdzonych kodów w Trendzamniej; brak afiliacji i cashbacku dla kupującego.',
     array['modivo.pl']::text[], 'Moda', 'https://modivo.pl/'),
    ('eobuwie', 'eobuwie',
     'Obuwie i dodatki. Na razie nie publikujemy kodów dla tego sklepu, dopóki nie zostaną zweryfikowane.',
     array['eobuwie.com.pl']::text[], 'Obuwie', 'https://eobuwie.com.pl/')
) as v(slug,name,description,domains,category,website_url)
cross join owner
on conflict (slug) do nothing;
