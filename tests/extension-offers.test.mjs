import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateExtensionOffer, validCalendarDay } from "../lib/extension-offer-validation.ts";
import { filterOffers, matchesStore, trustedSiteLink, trustedStoreWebsite } from "../extension/logic.mjs";
import { merchantDestination } from "../lib/store-destination.ts";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const valid = {
  id: null, storeSlug: "sklep", storeName: "Przykładowy sklep", storeDomains: "sklep.pl, shop.sklep.pl",
  title: "Przykładowa zweryfikowana promocja", description: "Oferta ograniczona warunkami",
  offerType: "coupon", code: "TEST10", pagePath: "/kody-rabatowe", destinationUrl: "https://www.sklep.pl/promocja?kod=TEST10",
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
  assert.match(read("../lib/stores.ts"),/\.eq\("published", true\)/);
  assert.doesNotMatch(publicApi,/affiliate_url/);
  assert.match(sql,/enable row level security/);
  assert.match(sql,/public\.is_owner/);
});


test("store directory and extension have no user-facing cashback copy", () => {
  for (const path of [
    "../app/kody-rabatowe/page.tsx",
    "../app/kody-rabatowe/[slug]/page.tsx",
    "../components/StoreDirectory.tsx",
    "../components/admin/AdminStoreStudio.tsx",
    "../app/api/extension/offers/route.ts",
    "../extension/popup.html",
    "../extension/popup.js",
    "../extension/background.js",
    "../lib/stores.ts",
    "../lib/store-validation.ts",
  ]) {
    assert.doesNotMatch(read(path), /cashback/i, "unexpected cashback reference: " + path);
  }
  const admin = read("../app/api/admin/extension-stores/route.ts");
  assert.doesNotMatch(admin, /cashback/i);
  const manifest = JSON.parse(read("../extension/manifest.json"));
  assert.deepEqual(manifest.permissions, ["tabs"]);
});

test("direct merchant URL validation blocks unsafe redirect destinations", () => {
  assert.equal(merchantDestination("https://www.sklep.pl/oferta?x=1", ["sklep.pl"]), "https://www.sklep.pl/oferta?x=1");
  assert.equal(merchantDestination("https://sklep.pl.evil.com/fake", ["sklep.pl"]), null);
  assert.equal(merchantDestination("https://evil.com/oferta", ["sklep.pl"]), null);
  assert.equal(merchantDestination("http://sklep.pl/oferta", ["sklep.pl"]), null);
  assert.equal(merchantDestination("https://user:pass@sklep.pl/oferta", ["sklep.pl"]), null);
  assert.equal(merchantDestination("https://sklep.pl:8443/oferta", ["sklep.pl"]), null);
  assert.equal(merchantDestination("https://www.awin1.com/click?x=1", ["sklep.pl"]), null);
  assert.equal(trustedStoreWebsite("https://www.sklep.pl/", ["sklep.pl"]), "https://www.sklep.pl/");
  assert.equal(trustedStoreWebsite("https://sklep.pl.evil.com/", ["sklep.pl"]), null);
});

test("only the owner can set merchant URLs and the API reads stored domains", () => {
  const api = read("../app/api/admin/extension-offers/route.ts");
  const publicSource = read("../lib/stores.ts");
  const catalog = read("../components/CouponCatalog.tsx");
  const sql = read("../supabase/migrations/20261026_add_merchant_destination.sql");
  assert.match(api, /getClaims/);
  assert.match(api, /admin\?\.role === "owner"/);
  assert.match(api, /storeDomains = store.domains/);
  assert.match(api, /merchantDestination\(input.destinationUrl, storeDomains\)/);
  assert.match(publicSource, /merchantDestination\(item.destination_url/);
  assert.match(catalog, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(sql, /add column if not exists destination_url/);
});

test("the in-page assistant requires explicit user interaction and narrow permissions", () => {
  const popup = read("../extension/popup.js");
  const helper = read("../extension/assistant-overlay.mjs");
  const html = read("../extension/popup.html");
  const manifest = JSON.parse(read("../extension/manifest.json"));
  assert.equal(manifest.version, "0.4.0");
  assert.deepEqual(manifest.permissions, ["tabs", "activeTab", "scripting"]);
  assert.deepEqual(manifest.host_permissions, ["https://trendzamniej.pl/*"]);
  assert.match(popup, /\$\("show-on-site"\)\.addEventListener\("click"/);
  assert.match(popup, /chrome\.scripting\.executeScript/);
  assert.match(popup, /matchesStore\(host, state\.store\.domains\)/);
  assert.match(html, /id="current-only"/);
  assert.match(helper, /attachShadow/);
  assert.match(helper, /textContent/);
  assert.doesNotMatch(helper, /\.innerHTML\s*=|document\.cookie|checkout\.submit/);
  assert.doesNotMatch(popup, /chrome\.cookies|declarativeNetRequest|webRequest/);
});
