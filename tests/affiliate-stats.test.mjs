import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAffiliateSources } from "../lib/affiliate-stats.ts";

test("counts all sources and consolidates duplicate outfit rows", () => {
  const s = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: "a", clicks: "3" },
    { source_type: "outfit", outfit_slug: "b", clicks: 1 },
    { source_type: "outfit", outfit_slug: "a", clicks: 2 },
    { source_type: "product", outfit_slug: null, clicks: 4 },
    { source_type: "unknown", outfit_slug: null, clicks: 7 },
  ]);
  assert.equal(s.outfitClicks, 6);
  assert.equal(s.productClicks, 4);
  assert.equal(s.unknownClicks, 7);
  assert.deepEqual(s.outfitRanking, [
    { slug: "a", clicks: 5 }, { slug: "b", clicks: 1 },
  ]);
});
test("share denominator includes only known-origin clicks", () => {
  const s = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: "a", clicks: 6 },
    { source_type: "product", outfit_slug: null, clicks: 4 },
    { source_type: "unknown", outfit_slug: null, clicks: 90 },
  ]);
  assert.equal(s.outfitShareOfKnown, 60);
  assert.equal(s.knownClicks, 10);
});
test("no clicks results in zero share", () => {
  const s = summarizeAffiliateSources([]);
  assert.equal(s.outfitShareOfKnown, 0);
  assert.deepEqual(s.outfitRanking, []);
});
test("invalid counts are ignored", () => {
  const s = summarizeAffiliateSources([
    { source_type: "product", outfit_slug: null, clicks: "nope" },
    { source_type: "outfit", outfit_slug: "a", clicks: -1 },
    { source_type: "unknown", outfit_slug: null, clicks: 1.8 },
  ]);
  assert.equal(s.outfitClicks, 0);
  assert.equal(s.unknownClicks, 1);
});
test("unrecognized types and outfit clicks without slugs are unknown", () => {
  const s = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: null, clicks: 3 },
    { source_type: "bogus", outfit_slug: null, clicks: 2 },
  ]);
  assert.equal(s.unknownClicks, 5);
  assert.equal(s.knownClicks, 0);
});
