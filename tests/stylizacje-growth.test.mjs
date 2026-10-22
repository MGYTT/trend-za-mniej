import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const listing = load("../app/stylizacje/page.tsx");
const detail = load("../app/stylizacje/[slug]/page.tsx");
const explorer = load("../components/OutfitExplorer.tsx");
const filter = load("../lib/outfit-filters.ts");

test("listing shows only available outfits and does not create indexed filter variants", () => {
  assert.match(listing, /filter\(\(look\) => look\.available\)/);
  assert.match(listing, /alternates: \{ canonical: "\/stylizacje" \}/);
  assert.match(listing, /numberOfItems: looks\.length/);
  assert.match(listing, /"BreadcrumbList"/);
  assert.match(listing, /"ItemList"/);
  assert.doesNotMatch(listing, /FAQPage|AggregateRating|reviewCount/);
});

test("people-first landing describes saved prices and transparent affiliation", () => {
  assert.match(listing, /suma cen zapisanych/);
  assert.match(listing, /nie testujemy fizycznie/i);
  assert.match(listing, /przez link partnera/);
  assert.match(listing, /id="poradnik-stylizacji"/);
  assert.match(listing, /id="wybierz-stylizacje"/);
});

test("filters are accessible, use true totals and do not create filter routes", () => {
  assert.match(explorer, /aria-pressed=\{budget ===/);
  assert.match(explorer, /aria-live="polite"/);
  assert.match(explorer, /htmlFor="look-occasion"/);
  assert.match(explorer, /htmlFor="look-sort"/);
  assert.match(explorer, /filterOutfits\(looks/);
  assert.match(explorer, /sortOutfits\(/);
  assert.match(filter, /Math\.round\(outfit\.total \* 100\) > maxCents/);
  assert.doesNotMatch(explorer, /window\.location|URLSearchParams|pushState/);
});

test("outfit offers have sponsored links and retain optional attribution parameters", () => {
  assert.match(detail, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(detail, /origin=outfit&look=/);
  assert.match(detail, /encodeURIComponent\(look\.slug\)/);
  assert.match(detail, /target="_blank"/);
  assert.match(detail, /id="sklad-stylizacji"/);
  assert.match(detail, /Nie ma jednego wspólnego koszyka/);
});

test("outfit cannot show missing or over-budget products", () => {
  assert.match(detail, /resolveLooks\(await getProducts\(\)\)\.filter\(\(item\) => item\.available\)/);
  assert.match(detail, /if \(!look\) notFound\(\)/);
  assert.match(detail, /look\.excluded/);
  assert.match(detail, /look\.whyItWorks/);
});
