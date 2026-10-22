-- Trend za Mniej: regularna kontrola jakości zapisanych danych oferty.
-- TYLKO ODCZYT (SELECT); nie aktualizuje cen, linków, SKU ani produktów.
-- updated_at to czas EDYCJI REKORDU, nie potwierdzenie ceny w SHEIN.
-- Schemat produkcji istnieje już przed Wydaniem 02; brak nowych kolumn.
SELECT
  count(*)::bigint AS products_total,
  count(*) FILTER (WHERE active)::bigint AS active,
  count(*) FILTER (WHERE active AND (affiliate_url IS NULL OR btrim(affiliate_url)='' OR affiliate_url !~* '^https://'))::bigint AS missing_or_non_https_partner_url,
  count(*) FILTER (WHERE active AND affiliate_url !~* '^https://[^/]*shein\\.')::bigint AS not_shein_domain_pattern,
  count(*) FILTER (WHERE active AND (image_url IS NULL OR btrim(image_url)='' OR image_url !~* '^https://'))::bigint AS missing_or_non_https_image_url,
  count(*) FILTER (WHERE active AND (short_name IS NULL OR btrim(short_name)=''))::bigint AS missing_short_names,
  count(*) FILTER (WHERE active AND (description IS NULL OR btrim(description)=''))::bigint AS missing_descriptions,
  count(*) FILTER (WHERE active AND (price IS NULL OR price<=0))::bigint AS invalid_saved_prices,
  count(*) FILTER (WHERE active AND (old_price IS NOT NULL AND old_price<=price))::bigint AS suspect_reference_prices,
  count(*) FILTER (WHERE active AND (shein_product_key IS NULL OR btrim(shein_product_key)=''))::bigint AS missing_verified_shein_product_keys,
  count(*) FILTER (WHERE active AND shein_identity_status='unresolved')::bigint AS unresolved_shein_identities,
  count(*) FILTER (WHERE active AND shein_identity_status='pending')::bigint AS pending_shein_identities,
  count(*) FILTER (WHERE active AND updated_at<now()-interval '7 days')::bigint AS not_edited_7days
FROM public.products;

-- Powiązania: kliknięcia i stare adresy MUSZĄ dotyczyć istniejących produktów.
SELECT
 (SELECT count(*)::bigint
  FROM public.affiliate_clicks c LEFT JOIN public.products p ON p.id=c.product_id
  WHERE p.id IS NULL) AS orphan_clicks,
 (SELECT count(*)::bigint
  FROM public.product_slug_redirects r LEFT JOIN public.products p ON p.id=r.product_id
  WHERE p.id IS NULL) AS orphan_redirects;

-- Statusy jakości; nigdy nie interpretuj "unresolved" jako nieczynnego linku.
SELECT shein_identity_status,active,count(*)::bigint AS offers
FROM public.products
GROUP BY shein_identity_status,active
ORDER BY active DESC,offers DESC;
