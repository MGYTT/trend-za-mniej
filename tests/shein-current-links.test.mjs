import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SHEIN_PROMOTIONS, SHEIN_PROMOTIONS_UPDATED_AT } from "../lib/shein-promotions.ts";

const expected = new Map([
  ["446ZNTY", "https://onelink.shein.com/58/666a9q9i4z2o"],
  ["SBNSL5D", "https://onelink.shein.com/58/666avxd0rw8x"],
  ["779656K", "https://onelink.shein.com/58/666aw977hms3"],
  ["7722P4J", "https://onelink.shein.com/58/666awn0f7wo8"],
  ["5MPUS5S", "https://onelink.shein.com/58/666awyulycct"],
  ["UBUX5BG", "https://onelink.shein.com/58/666ax8prgiig"],
  ["6ZDJHSE", "https://onelink.shein.com/58/666axoi0dnhm"],
  ["2T92449", "https://onelink.shein.com/58/666axyd5ymob"],
  ["Q2V335K", "https://onelink.shein.com/58/666ayc6dr0g4"],
  ["ED4Z4VZ", "https://onelink.shein.com/58/666ayo0kg1lv"],
  ["T265289", "https://onelink.shein.com/58/666ayzur3o5q"],
  ["L55664Q", "https://onelink.shein.com/58/666az9pwn8u8"],
  ["PZJB5YN", "https://onelink.shein.com/58/666azlk3ave8"],
  ["52F5444", "https://onelink.shein.com/58/666azxe9zwiq"],
  ["472J599", "https://onelink.shein.com/58/666b098goxov"],
  ["WUJ5W3X", "https://onelink.shein.com/58/666b0l2nbuxg"],
  ["5754Z2D", "https://onelink.shein.com/58/666b0uxsxjeb"],
  ["SCK77XC", "https://onelink.shein.com/58/666b22chdc9t"],
  ["D764235", "https://onelink.shein.com/58/666b2e6o1o5n"],
  ["K6GX83K", "https://onelink.shein.com/58/666b2q0us3uv"],
  ["QJCMYE4", "https://onelink.shein.com/58/666b31v1ebut"],
  ["U554645", "https://onelink.shein.com/58/666b3nkdnmum"],
  ["5M33636", "https://onelink.shein.com/58/666b3zekddbl"],
  ["Y6QE64T", "https://onelink.shein.com/58/666b4n2xpbnx"],
]);

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const publicData = read("../lib/shein-campaigns.ts");
const redirect = read("../app/promocje-shein/go/[id]/route.ts");

test("all 24 supplied SHEIN campaign codes point to exact supplied /58 affiliate links", () => {
  assert.equal(expected.size, 24);
  assert.equal(SHEIN_PROMOTIONS.length, 24, "Unexpected extra or missing campaign");
  const codes = new Set();
  const links = new Set();
  for (const promotion of SHEIN_PROMOTIONS) {
    assert.ok(expected.has(promotion.code), "Unrecognized campaign code " + promotion.code);
    assert.equal(promotion.affiliateUrl, expected.get(promotion.code), "Link mismatch for " + promotion.code);
    assert.ok(!codes.has(promotion.code), "Duplicate code");
    assert.ok(!links.has(promotion.affiliateUrl), "Duplicate link");
    codes.add(promotion.code);
    links.add(promotion.affiliateUrl);
    const url = new URL(promotion.affiliateUrl);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "onelink.shein.com");
    assert.match(url.pathname, /^\/58\/[a-z0-9]+$/);
  }
  assert.deepEqual(codes, new Set(expected.keys()));
});

test("no former /56 links remain in catalog and update date is truthful", () => {
  assert.doesNotMatch(read("../lib/shein-promotions.ts"), /onelink\.shein\.com\/56\//);
  assert.equal(SHEIN_PROMOTIONS_UPDATED_AT.slice(0, 10), "2026-10-25");
});

test("public listing and redirects read current database rows rather than stale file", () => {
  assert.match(publicData, /\.from\("shein_campaigns"\)/);
  assert.match(publicData, /\.eq\("published", true\)/);
  assert.match(redirect, /\.from\("shein_campaigns"\)/);
  assert.match(redirect, /safeCampaignUrl\(campaign\.affiliate_url\)/);
  assert.match(redirect, /\.from\("shein_campaign_clicks"\)/);
});
