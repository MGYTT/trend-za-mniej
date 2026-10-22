import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function load(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

test("outfit product affiliate links include source and current outfit slug", () => {
  const file = load("../app/stylizacje/[slug]/page.tsx");
  assert.match(file, /\/go\/.*origin=outfit&look=/);
  assert.match(file, /encodeURIComponent\(look\.slug\)/);
});
test("product detail affiliate links declare product origin", () => {
  const file = load("../app/produkt/[slug]/page.tsx");
  assert.match(file, /\/go\/.*\?origin=product/);
});
test("click tracking delegates source validation before affiliate redirection", () => {
  const route = load("../app/go/[id]/route.ts");
  assert.match(route, /resolveClickAttribution\(/);
  assert.match(route, /source_type:\s*attribution\.sourceType/);
  assert.match(route, /outfit_slug:\s*attribution\.outfitSlug/);
  assert.match(route, /product\.affiliateUrl/);
  assert.match(route, /PGRST204/);
});
test("analytics SQL is security invoker and only grants authenticated access", () => {
  const sql = load("../docs/sql/affiliate-click-attribution.sql");
  assert.match(sql, /SECURITY INVOKER/);
  assert.match(sql, /REVOKE EXECUTE ON FUNCTION public\.get_affiliate_source_stats\(integer\)/);
  assert.match(sql, /FROM PUBLIC, anon/);
});
test("unreleased feature branches do not trigger automatic Vercel deployments", () => {
  const config = JSON.parse(load("../vercel.json"));
  assert.equal(config.git.deploymentEnabled.main, true);
  assert.equal(config.git.deploymentEnabled["release/*"], false);
});
