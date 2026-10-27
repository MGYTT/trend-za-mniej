import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OUTFIT_CATEGORIES, getOutfitCategory, matchesOutfitCategory } from "../lib/outfit-landing-categories.ts";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const listing = source("../app/stylizacje/page.tsx");
const detail = source("../app/stylizacje/[slug]/page.tsx");
const sitemap = source("../app/sitemap.ts");
const landing = source("../components/OutfitCategoryLanding.tsx");

test("SEO categories use unique stable slugs and human-edited content", () => {
  assert.equal(OUTFIT_CATEGORIES.length, 13);
  assert.equal(new Set(OUTFIT_CATEGORIES.map((entry) => entry.slug)).size, 13);
  for (const category of OUTFIT_CATEGORIES) {
    assert.match(category.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(category.heading.length >= 24);
    assert.ok(category.description.length >= 90);
    assert.ok(category.intro.length >= 100);
    assert.ok(category.advice.length >= 80);
    assert.equal(getOutfitCategory(category.slug), category);
  }
  assert.equal(getOutfitCategory("nie-ma"), undefined);
});

test("budget category uses actual total, not maxBudget label", () => {
  const below = { total: 99.99, occasion: "Na randkę", style: "Wieczorowo" };
  const above = { total: 100.01, occasion: "Na randkę", style: "Wieczorowo" };
  assert.equal(matchesOutfitCategory(getOutfitCategory("do-100-zl"), below), true);
  assert.equal(matchesOutfitCategory(getOutfitCategory("do-100-zl"), above), false);
  assert.equal(matchesOutfitCategory(getOutfitCategory("do-150-zl"), above), true);
  assert.equal(matchesOutfitCategory(getOutfitCategory("na-randke"), below), true);
  assert.equal(matchesOutfitCategory(getOutfitCategory("do-pracy"), below), false);
});

test("new occasion pages have proper category routes, canonicals and ItemList", () => {
  assert.match(detail, /OUTFIT_CATEGORIES\.map/);
  assert.match(detail, /getOutfitCategory\(slug\)/);
  assert.match(detail, /matchesOutfitCategory\(category, item\)/);
  assert.match(detail, /alternates: \{ canonical: "\/stylizacje\/" \+ category\.slug \}/);
  assert.match(landing, /"BreadcrumbList"/);
  assert.match(landing, /"ItemList"/);
  assert.match(landing, /numberOfItems: looks\.length/);
  assert.match(landing, /formatPrice\(look\.total\)/);
  assert.match(landing, /look\.products\.slice\(0, 2\)/);
  assert.match(landing, /afiliacyjnych/);
});

test("SEO categories are discoverable, but empty ones are not in the sitemap", () => {
  assert.match(listing, /visibleCategories\.map/);
  assert.match(listing, /href=\{`\/stylizacje\/do-\$\{budget\}-zl`\}/);
  assert.match(sitemap, /OUTFIT_CATEGORIES/);
  assert.match(sitemap, /availableLooks\.some\(\(look\) => matchesOutfitCategory\(category, look\)\)/);
  assert.match(sitemap, /\.\.\.outfitCategoryPages/);
});
