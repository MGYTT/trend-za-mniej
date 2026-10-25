import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const listing = source("../app/stylizacje/page.tsx");
const explorer = source("../components/OutfitExplorer.tsx");
const detail = source("../app/stylizacje/[slug]/page.tsx");
const resolver = source("../lib/stylizacje.ts");
const redirect = source("../app/go/[id]/route.ts");

test("listing shows available real outfits and stable SEO", () => {
  assert.match(listing, /resolveLooks\(await getProducts\(\)\)\.filter\(\(look\) => look\.available\)/);
  assert.match(listing, /alternates: \{ canonical: "\/stylizacje" \}/);
  assert.match(listing, /numberOfItems: looks\.length/);
  assert.match(listing, /"BreadcrumbList"/);
  assert.match(listing, /"ItemList"/);
  assert.match(resolver, /missing === 0 && distinctProducts && withinBudget/);
});

test("listing is consistent with the homepage on small screens", () => {
  assert.match(listing, /bg-\[#fff8f7\]/);
  assert.match(listing, /px-6 py-11 sm:gap-10 sm:px-8/);
  assert.match(listing, /text-\[clamp\(2\.3rem,7\.5vw,5rem\)\]/);
  assert.match(listing, /\/stylizacje\?budzet=\$\{budget\}/);
  assert.match(listing, /id="wybierz-stylizacje"/);
  assert.match(listing, /id="poradnik-stylizacji"/);
});

test("outfit explorer keeps interactive accessible budget and occasion filters", () => {
  assert.match(explorer, /aria-pressed=\{budget ===/);
  assert.match(explorer, /htmlFor="look-occasion"/);
  assert.match(explorer, /htmlFor="look-sort"/);
  assert.match(explorer, /aria-live="polite"/);
  assert.match(explorer, /filterOutfits\(looks/);
  assert.match(explorer, /sortOutfits\(/);
  assert.match(explorer, /const showAll = isFiltered \|\| sort !== "editorial" \|\| expanded/);
  assert.match(explorer, /visible\.slice\(0, INITIAL_OUTFITS\)/);
  assert.match(explorer, /min-\[440px\]:flex/);
});

test("outfit previews are photographic with factual saved catalog totals", () => {
  assert.match(explorer, /look\.photos\.slice\(0, 2\)\.map/);
  assert.match(explorer, /ProductPhoto/);
  assert.match(explorer, /priceFormatter\.format\(look\.total\)/);
  assert.match(explorer, /Zapisane ceny, bez dostawy/);
  assert.match(explorer, /Zobacz stylizację i oferty/);
});

test("detail hero uses real products, price totals and distinct links", () => {
  assert.match(detail, /resolveLooks\(await getProducts\(\)\)\.filter\(\(item\) => item\.available\)/);
  assert.match(detail, /if \(!look\) notFound\(\)/);
  assert.match(detail, /look\.products\.slice\(0, 2\)\.map/);
  assert.match(detail, /priority=\{index === 0\}/);
  assert.match(detail, /href="\#sklad-stylizacji"/);
  assert.match(detail, /id="sklad-stylizacji"/);
  assert.match(detail, /formatPrice\(look\.total\)/);
  assert.match(detail, /look\.excluded/);
  assert.match(detail, /look\.whyItWorks/);
});

test("outfit affiliates still point to tracking redirects, never invented basket", () => {
  assert.match(detail, /origin=outfit&look=/);
  assert.match(detail, /encodeURIComponent\(look\.slug\)/);
  assert.match(detail, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(detail, /target="_blank"/);
  assert.match(detail, /Nie ma jednego wspólnego koszyka/);
  assert.match(detail, /Zapisane ceny|Cena zapisana przy publikacji/);
  assert.match(redirect, /affiliate_clicks/);
});

test("similar outfits show photographic previews and retain same-occasion ranking", () => {
  assert.match(detail, /Number\(b\.occasion === look\.occasion\)/);
  assert.match(detail, /Math\.abs\(a\.total - look\.total\)/);
  assert.match(detail, /other\.products\.slice\(0, 2\)\.map/);
  assert.match(detail, /\.slice\(0, 3\)/);
});

test("JSX class attributes are closed and meaningful section anchors exist", () => {
  for (const page of [listing, explorer, detail]) {
    assert.doesNotMatch(page, /className="[^"\n>]*>/);
  }
  assert.match(listing, /id="choose-title"/);
  assert.match(detail, /id="outfit-items-title"/);
  assert.match(detail, /id="why-this-outfit"/);
  assert.match(detail, /id="other-outfits-title"/);
});
