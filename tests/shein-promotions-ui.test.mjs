import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SHEIN_PROMOTIONS, SHEIN_PROMOTIONS_UPDATED_AT } from "../lib/shein-promotions.ts";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const listing = load("../app/promocje-shein/page.tsx");
const explorer = load("../components/SheinPromotionsExplorer.tsx");

test("campaign catalog contains unique actionable codes and plausible HTTPS SHEIN links", () => {
  assert.ok(SHEIN_PROMOTIONS.length > 10, "catalog should not be empty");
  assert.equal(new Set(SHEIN_PROMOTIONS.map((p) => p.id)).size, SHEIN_PROMOTIONS.length);
  assert.equal(new Set(SHEIN_PROMOTIONS.map((p) => p.code)).size, SHEIN_PROMOTIONS.length);
  for (const promotion of SHEIN_PROMOTIONS) {
    assert.match(promotion.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(promotion.code, /^[A-Z0-9]{4,14}$/);
    assert.ok(promotion.title.trim().length > 8);
    assert.ok(promotion.note.trim().length > 20);
    const url = new URL(promotion.affiliateUrl);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "onelink.shein.com");
    assert.match(url.pathname, /^\/\d+\/[a-z0-9]+$/);
  }
});

test("campaign update time stays honest and not represented as live verification", () => {
  assert.ok(Number.isFinite(new Date(SHEIN_PROMOTIONS_UPDATED_AT).getTime()));
  assert.match(listing, /dateModified: SHEIN_PROMOTIONS_UPDATED_AT/);
  assert.match(listing, /Wpisy zaktualizowano/);
  assert.match(listing, /nie są weryfikowane w czasie rzeczywistym/);
  assert.match(listing, /Większość to oznaczenia kampanii/);
  assert.doesNotMatch(listing, /zweryfikowane dzisiaj|sprawdzone dzisiaj|gwarantowany rabat/i);
  assert.doesNotMatch(listing, /"@type": "FAQPage"/);
});

test("search and categories appear immediately after concise hero", () => {
  assert.ok(listing.indexOf('id="znajdz-promocje"') < listing.indexOf("Krótka pomoc"));
  assert.match(listing, /<SheinPromotionsExplorer promotions=\{SHEIN_PROMOTIONS\}/);
  assert.match(listing, /max-w-7xl px-6 pb-9 pt-7 sm:px-8/);
  assert.match(listing, /<h1 id="promotion-hero-title"/);
  assert.match(explorer, /id="shein-promotion-search"/);
  assert.match(explorer, /role="group" aria-label="Filtruj kampanie według kategorii"/);
  assert.match(explorer, /aria-pressed=\{category === item.id\}/);
  assert.match(explorer, /const search = normalize\(query\)/);
  assert.match(explorer, /promotions\.filter\(\(promotion\) =>/);
});

test("offers are loaded in digestible batches with sensible empty state", () => {
  assert.match(explorer, /const INITIAL_VISIBLE = 6/);
  assert.match(explorer, /const STEP = 6/);
  assert.match(explorer, /matches\.slice\(0, visibleCount\)/);
  assert.match(explorer, /setVisibleCount\(\(count\) => count \+ STEP\)/);
  assert.match(explorer, /setVisibleCount\(INITIAL_VISIBLE\)/);
  assert.match(explorer, /role="status" aria-live="polite"/);
  assert.match(explorer, /Brak kampanii pasujących/);
  assert.match(explorer, /onClick=\{clearFilters\}/);
});

test("codes are copyable and always readable when clipboard permission fails", () => {
  assert.match(explorer, /navigator\.clipboard\?\.writeText/);
  assert.match(explorer, /document\.execCommand\("copy"\)/);
  assert.match(explorer, /input\?\.select\(\)/);
  assert.match(explorer, /value=\{promotion\.code\}/);
  assert.match(explorer, /readOnly/);
  assert.match(explorer, /onFocus=\{\(event\) => event\.currentTarget\.select\(\)\}/);
  assert.match(explorer, /Skopiowano/);
});

test("all cards disclose code type and use existing affiliate URLs", () => {
  assert.match(explorer, /id=\{promotion\.id\}/);
  assert.match(explorer, /Kod do wyszukania w SHEIN/);
  assert.match(explorer, /Kod powiązany z ofertą/);
  assert.match(explorer, /promotion\.affiliateUrl/);
  assert.match(explorer, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(explorer, /target="_blank"/);
  assert.match(explorer, /Opis i warunki kampanii/);
  assert.match(listing, /href="\/afiliacja"/);
});

test("new campaign UX preserves canonical and safe structured data", () => {
  assert.match(listing, /canonical: "\/promocje-shein"/);
  assert.match(listing, /"@type": "CollectionPage"/);
  assert.match(listing, /"@type": "BreadcrumbList"/);
  assert.match(listing, /JSON\.stringify\(structuredData\)\.replace\(/);
  for (const page of [listing, explorer]) {
    assert.doesNotMatch(page, /className="[^"\n>]*>/);
  }
});
