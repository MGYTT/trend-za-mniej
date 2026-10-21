import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOutfits, availableBudgets, availableOccasions } from "../lib/outfit-filters.ts";

const looks = [
  { slug: "a", occasion: "Na co dzień", maxBudget: 100, total: 99.00 },
  { slug: "b", occasion: "Do pracy", maxBudget: 150, total: 111.75 },
  { slug: "c", occasion: "Na co dzień", maxBudget: 200, total: 188.63 },
];

test("Budżet filtruje faktyczną sumę, a nie limit marketingowy", () => {
  assert.deepEqual(filterOutfits(looks, {maxPrice:100,occasion:null}).map((x)=>x.slug), ["a"]);
  assert.deepEqual(filterOutfits(looks, {maxPrice:150,occasion:null}).map((x)=>x.slug), ["a","b"]);
});
test("Okazja i budżet działają razem", () => {
  assert.deepEqual(filterOutfits(looks, {maxPrice:150,occasion:"Na co dzień"}).map((x)=>x.slug), ["a"]);
  assert.deepEqual(filterOutfits(looks, {maxPrice:null,occasion:"Do pracy"}).map((x)=>x.slug), ["b"]);
});
test("Opcje filtrów wynikają z ofert bez duplikatów", () => {
  assert.deepEqual(availableBudgets(looks),[100,150,200]);
  assert.deepEqual(availableOccasions(looks),["Na co dzień","Do pracy"]);
});
test("Niepoprawna cena nie pojawia się w wynikach", () => {
  assert.deepEqual(filterOutfits([...looks,{slug:"bad",total:NaN,occasion:"Do pracy"}],{maxPrice:null,occasion:null}).length,3);
});
