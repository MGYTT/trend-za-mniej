import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const categorySeo = load("../lib/categories.ts");
const categoryPage = load("../app/kategoria/[slug]/page.tsx");
const editorial = load("../components/SweaterCategoryEditorial.tsx");
const homepage = load("../components/HomeLanding.tsx");

test("the existing sweater URL has an accurate dedicated title and meta description", () => {
  assert.match(categorySeo, /Swetry damskie SHEIN – modele i ceny w katalogu/);
  assert.match(categorySeo, /Swetry damskie SHEIN z katalogu Trend za Mniej/);
  assert.match(categoryPage, /canonical,/);
  assert.match(categoryPage, /findCategoryBySlug/);
  assert.match(categoryPage, /isSweaterCategory \? "Swetry damskie SHEIN" : category\.name/);
  assert.doesNotMatch(categorySeo, /gwarantowana zniżka|najtańsze na rynku|potwierdzona dostępność/);
});

test("sweater price range is calculated only from current active category catalog rows", () => {
  assert.match(categoryPage, /getProducts\(\{ category: category\.name, sort: "newest" \}\)/);
  assert.match(categoryPage, /<SweaterCategoryEditorial/);
  assert.match(categoryPage, /products=\{products\}/);
  assert.match(editorial, /products\.map\(\(product\) => product\.price\)/);
  assert.match(editorial, /Number\.isFinite\(price\) && price > 0/);
  assert.match(editorial, /Math\.min\(\.\.\.prices\)/);
  assert.match(editorial, /Math\.max\(\.\.\.prices\)/);
  assert.match(editorial, /formatPrice\(minPrice\)/);
  assert.match(editorial, /Nie potwierdza aktualnych cen/);
});

test("original buyer guidance and meaningful internal links aid discovery without doorway pages", () => {
  assert.match(editorial, /Swetry damskie SHEIN: jak wybrać fason i sprawdzić cenę/);
  assert.match(editorial, /młodzieżowe/);
  assert.match(editorial, /href="\/kategoria\/kardigany"/);
  assert.match(editorial, /href="\/kategoria\/spodnie"/);
  assert.match(editorial, /href="\/stylizacje"/);
  assert.match(homepage, /href="\/kategoria\/swetry"/);
  assert.doesNotMatch(editorial, /"@type":\s*"FAQPage"|ratingValue|AggregateRating/);
});
