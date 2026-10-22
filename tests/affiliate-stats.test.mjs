import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAffiliateSources, affiliateTotalsMatch } from "../lib/affiliate-stats.ts";

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

test("report reconciliation succeeds for same-period total", () => {
  const summary = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: "one", clicks: 3 },
    { source_type: "product", outfit_slug: null, clicks: 4 },
    { source_type: "unknown", outfit_slug: null, clicks: 2 },
  ]);
  assert.equal(affiliateTotalsMatch(summary, 9), true);
});

test("report reconciliation detects missing categorized clicks", () => {
  const summary = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: "one", clicks: 3 },
  ]);
  assert.equal(affiliateTotalsMatch(summary, 5), false);
});

test("report reconciliation rejects non-integer or invalid totals", () => {
  const summary = summarizeAffiliateSources([]);
  assert.equal(affiliateTotalsMatch(summary, NaN), false);
  assert.equal(affiliateTotalsMatch(summary, -1), false);
  assert.equal(affiliateTotalsMatch(summary, 0.5), false);
  assert.equal(affiliateTotalsMatch(summary, 0), true);
});

test("attribution coverage distinguishes tracked origins from historical unknown clicks", () => {
  const s = summarizeAffiliateSources([
    { source_type: "outfit", outfit_slug: "a", clicks: 3 },
    { source_type: "product", outfit_slug: null, clicks: 2 },
    { source_type: "unknown", outfit_slug: null, clicks: 15 },
  ]);
  assert.equal(s.totalClicks, 20);
  assert.equal(s.knownClicks, 5);
  assert.equal(s.knownCoveragePercent, 25);
  assert.equal(s.outfitShareOfKnown, 60);
});

test("zero clicks and historical-only clicks are not presented as outfit winners", () => {
  const none = summarizeAffiliateSources([]);
  assert.equal(none.totalClicks, 0);
  assert.equal(none.knownCoveragePercent, null);
  assert.equal(none.knownClicks, 0);

  const historical = summarizeAffiliateSources([
    { source_type: "unknown", outfit_slug: null, clicks: 34 },
  ]);
  assert.equal(historical.totalClicks, 34);
  assert.equal(historical.knownCoveragePercent, 0);
  assert.equal(historical.knownClicks, 0);
  assert.deepEqual(historical.outfitRanking, []);
});
