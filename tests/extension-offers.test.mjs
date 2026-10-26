import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateExtensionOffer, validCalendarDay } from "../lib/extension-offer-validation.ts";
import { filterOffers, matchesStore, trustedSiteLink } from "../extension/logic.mjs";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const valid = {
  id: null, storeName: "Przykładowy sklep", storeDomains: "sklep.pl, shop.sklep.pl",
  title: "Przykładowa zweryfikowana promocja", description: "Oferta ograniczona warunkami",
  offerType: "coupon", code: "TEST10", pagePath: "/kody-rabatowe",
  published: true, verified: true, validUntil: "2026-12-31",
};
test("validates multi-store offers and rejects URL / redirect injection", () => {
  const ok = validateExtensionOffer(valid);
  assert.ok("value" in ok);
  assert.deepEqual(ok.value.storeDomains, ["sklep.pl", "shop.sklep.pl"]);
  for (const storeDomains of ["https://evil.com", "example.com/path", "localhost", "a.com.evil.com:443"]) {
    assert.ok("error" in validateExtensionOffer({ ...valid, storeDomains }));
  }
  for (const pagePath of ["//evil.com", "https://evil.com", "/test?redirect=http://evil.com", "/../secret"]) {
    assert.ok("error" in validateExtensionOffer({ ...valid, pagePath }));
  }
});
test("requires explicit verification before publishing", () => {
  assert.ok("error" in validateExtensionOffer({ ...valid, verified: false }));
  assert.ok("value" in validateExtensionOffer({ ...valid, published: false, verified: false }));
  assert.ok("error" in validateExtensionOffer({ ...valid, published: "true" }));
  assert.ok("error" in validateExtensionOffer({ ...valid, offerType: "campaign", code: "" }));
  assert.ok("value" in validateExtensionOffer({ ...valid, offerType: "promotion", code: "" }));
  assert.equal(validCalendarDay("2026-02-30"), false);
  assert.equal(validCalendarDay("2026-12-31"), true);
});
test("recognizes subdomains without matching lookalike domains", () => {
  assert.equal(matchesStore("checkout.sklep.pl", ["sklep.pl"]), true);
  assert.equal(matchesStore("sklep.pl.evil.com", ["sklep.pl"]), false);
  assert.equal(matchesStore("other.pl", ["sklep.pl"]), false);
});
test("only opens exact HTTPS Trendzamniej pages", () => {
  assert.equal(trustedSiteLink("https://trendzamniej.pl/kody-rabatowe"),"https://trendzamniej.pl/kody-rabatowe");
  assert.equal(trustedSiteLink("https://trendzamniej.pl.evil.com/"), null);
  assert.equal(trustedSiteLink("javascript:alert(1)"), null);
});
test("separates coupons from campaigns and boosts current store", () => {
  const offers = [
    {store:"SHEIN", domains:["shein.com"], title:"Kampania", description:"", code:"ABCD",type:"campaign",validUntil:null},
    {store:"Sklep", domains:["sklep.pl"], title:"Kupon", description:"", code:"XYZ",type:"coupon",validUntil:null},
  ];
  assert.equal(filterOffers(offers,"","coupon","sklep.pl","2026-10-26").length, 1);
  assert.equal(filterOffers(offers,"","all","sklep.pl","2026-10-26")[0].store, "Sklep");
});
test("admin API enforces owner and same-origin; public API hides direct affiliate links", () => {
  const api = read("../app/api/admin/extension-offers/route.ts");
  const publicApi = read("../app/api/extension/offers/route.ts");
  const sql = read("../supabase/migrations/20261026_multistore_extension_offers.sql");
  assert.match(api,/getClaims/);
  assert.match(api,/admin\?\.role === "owner"/);
  assert.match(api,/sameOrigin/);
  assert.match(api,/validateExtensionOffer/);
  assert.match(publicApi,/\.eq\("published", true\)/);
  assert.doesNotMatch(publicApi,/affiliate_url/);
  assert.match(sql,/enable row level security/);
  assert.match(sql,/public\.is_owner/);
});
