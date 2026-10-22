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

test("release keeps legacy React warnings scoped and fixes the login internal link", () => {
  const cfg = load("../eslint.config.mjs");
  const login = load("../app/login/page.tsx");
  assert.match(cfg, /"react-hooks\/set-state-in-effect": "warn"/);
  assert.doesNotMatch(cfg, /"react-hooks\/set-state-in-effect": "off"/);
  assert.equal((cfg.match(/\.tsx"/g) ?? []).length, 9);
  assert.ok(login.includes('import Link from "next/link"'));
  // Check the actual JSX element, not a backslash-n string or exact indentation.
  assert.match(login, /<Link\s+href=["']\/["']/);
  assert.doesNotMatch(login, /<a\b[^>]*\bhref=["']\/["']/);
});

test("outfits are discoverable from the global footer and homepage", () => {
  const footer = load("../components/SiteFooter.tsx");
  const home = load("../app/page.tsx");
  assert.match(footer, /"\/stylizacje"/);
  assert.match(footer, /label: "Stylizacje"/);
  assert.match(home, /href="\/stylizacje"/);
});

test("the storefront offers only three primary choices, with extras still reachable", () => {
  const header = load("../components/SiteHeader.tsx");
  const home = load("../app/page.tsx");
  const bottom = load("../components/MobileBottomNav.tsx");
  const footer = load("../components/SiteFooter.tsx");
  assert.match(header, /const MENU: MenuItem\[\] = \[/);
  assert.match(header, /const EXTRA_MENU: MenuItem\[\] = \[/);
  assert.match(header, /href: "\/poradniki"/);
  assert.match(home, /title="Stylizacje"/);
  assert.match(home, /title="Poradniki"/);
  assert.match(home, /title="Produkty"/);
  assert.doesNotMatch(home, /<Categories categories=/);
  assert.doesNotMatch(home, /<Promotions promotions=/);
  assert.doesNotMatch(home, /id="najnowsze"/);
  assert.match(bottom, /grid-cols-4/);
  assert.match(bottom, /pathname\.startsWith\("\/poradniki\/"\)/);
  assert.match(footer, /href: "\/kategorie"/);
  assert.match(footer, /href: "\/promocje-shein"/);
});
