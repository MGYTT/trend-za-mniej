import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

test("Supabase Free backup procedure exports roles, schema and data privately", () => {
  const backup = load("../scripts/backup-supabase-before-release.sh");
  assert.match(backup, /umask 077/);
  assert.match(backup, /SUPABASE_DB_URL/);
  assert.match(backup, /--role-only/);
  assert.match(backup, /--data-only/);
  assert.match(backup, /sha256sum -c/);
  assert.match(backup, /chmod 600/);
  assert.doesNotMatch(backup, /git add|git push/);
});

test("login uses Next.js internal Link instead of document navigation", () => {
  const login = load("../app/login/page.tsx");
  assert.ok(login.includes('import Link from "next/link"'));
  assert.ok(login.includes("        <Link"));
  assert.ok(!login.includes("        <a"));
});

test("React legacy lint exemptions are limited to the nine affected files", () => {
  const config = load("../eslint.config.mjs");
  const legacyFiles = [
    "app/admin/nowa-oferta/page.tsx",
    "components/SiteHeader.tsx",
    "components/admin/AdminAppShell.tsx",
    "components/admin/AdminHeader.tsx",
    "components/admin/AdminProductList.tsx",
    "components/admin/AdminSeoQualityManager.tsx",
    "components/admin/AdminTikTokManager.tsx",
    "components/admin/PublishConfirmation.tsx",
    "components/admin/SocialMediaStudio.tsx",
  ];
  assert.ok(config.includes('"react-hooks/set-state-in-effect": "warn"'));
  assert.ok(!config.includes('"react-hooks/set-state-in-effect": "off"'));
  for (const file of legacyFiles) {
    assert.ok(config.includes(JSON.stringify(file)), file);
  }
});
