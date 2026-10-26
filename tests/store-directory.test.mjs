import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeDirectoryText,
  offerCountLabel,
  selectDirectoryStores,
} from "../lib/store-directory-utils.ts";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const shops = [
  { slug: "shein", name: "SHEIN", category: "Moda", description: "Kody kampanii", offerCount: 24 },
  { slug: "zalando", name: "Zalando", category: "Moda", description: "Moda i obuwie", offerCount: 0 },
  { slug: "eobuwie", name: "eobuwie", category: "Obuwie", description: "Buty i dodatki", offerCount: 0 },
  { slug: "modivo", name: "MODIVO", category: "Moda", description: "Ubrania i buty", offerCount: 2 },
];
const filters = { query: "", category: "all", mode: "all", sort: "recommended" };

test("search handles Polish diacritics, case and multi-word queries", () => {
  assert.equal(normalizeDirectoryText("ŁÓDŹ  ŻÓŁTE"), "lodz zolte");
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, query: "mOdA kampanii" }, []).map(s => s.slug), ["shein"]);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, query: "OBUWIE" }, []).map(s => s.slug), ["eobuwie", "zalando"]);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, query: "nieistniejacy-sklep" }, []), []);
});

test("filters only shops with published offers and never invents discounts", () => {
  const selected = selectDirectoryStores(shops, { ...filters, mode: "available" }, []);
  assert.deepEqual(selected.map(s => s.slug), ["shein", "modivo"]);
  assert.equal(selected.every(s => s.offerCount > 0), true);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, category: "Obuwie", mode: "available" }, []), []);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, category: "Moda" }, []).map(s => s.slug),
    ["shein", "modivo", "zalando"]);
});

test("favorites and A-Z sorting work without persisting browsing history", () => {
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, mode: "favourites" }, ["zalando", "shein"]).map(s => s.slug),
    ["shein", "zalando"]);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, sort: "alphabetical" }, []).map(s => s.slug),
    ["eobuwie", "modivo", "shein", "zalando"]);
  assert.deepEqual(selectDirectoryStores(shops, { ...filters, mode: "favourites" }, []).map(s => s.slug), []);
});

test("offer counters use Polish grammar", () => {
  assert.equal(offerCountLabel(0), "0 ofert");
  assert.equal(offerCountLabel(1), "1 oferta");
  assert.equal(offerCountLabel(2), "2 oferty");
  assert.equal(offerCountLabel(5), "5 ofert");
  assert.equal(offerCountLabel(12), "12 ofert");
  assert.equal(offerCountLabel(24), "24 oferty");
});

test("catalog SEO and empty store pages remain truthful", () => {
  const listing = read("../app/kody-rabatowe/page.tsx");
  const detail = read("../app/kody-rabatowe/[slug]/page.tsx");
  const directory = read("../components/StoreDirectory.tsx");
  const sitemap = read("../app/sitemap.ts");
  const couponCatalog = read("../components/CouponCatalog.tsx");
  assert.match(listing, /<StoreDirectory stores=\{stores\} unavailable=\{unavailable\}/);
  assert.match(listing, /ItemList/);
  assert.match(listing, /kuponów do koszyka/);
  assert.match(directory, /Z ofertami/);
  assert.match(directory, /aria-pressed/);
  assert.match(detail, /robots: \{ index: hasOffers, follow: true \}/);
  assert.match(detail, /Brak opublikowanych kodów/);
  assert.match(sitemap, /activeStoreSlugs/);
  assert.match(couponCatalog, /rel="sponsored nofollow noopener noreferrer"/);
  for (const source of [listing, detail, directory, couponCatalog]) {
    assert.doesNotMatch(source, /cashback|wtyczk|Chrome|rozszerzenie/i);
  }
});
