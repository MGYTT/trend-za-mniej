import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../components/HomeLanding.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const looksPage = readFileSync(new URL("../app/stylizacje/page.tsx", import.meta.url), "utf8");
const explorer = readFileSync(new URL("../components/OutfitExplorer.tsx", import.meta.url), "utf8");

test("homepage links to real budget and occasion filters", () => {
  assert.match(home, /\/stylizacje\?budzet=/);
  assert.match(home, /\/stylizacje\?okazja=/);
  assert.match(looksPage, /searchParams: Promise<SearchParams>/);
  assert.match(looksPage, /initialBudget=/);
  assert.match(looksPage, /initialOccasion=/);
  assert.match(explorer, /useState\(initialBudget\)/);
  assert.match(explorer, /useState\(initialOccasion\)/);
});

test("homepage uses valid looks and only catalog products", () => {
  assert.match(index, /resolveLooks\(allProducts\)\.filter\(\(look\) => look\.available\)/);
  assert.match(index, /uniqueById/);
  assert.match(home, /look\.total/);
  assert.match(home, /bez dostawy/);
  assert.doesNotMatch(home, /najniższa cena|gwarantowana promocja/i);
});
