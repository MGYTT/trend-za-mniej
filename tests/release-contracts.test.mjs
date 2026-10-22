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

test("PowerShell backup works without Docker and validates the public archive", () => {
  const backup = load("../scripts/backup-supabase-before-release.ps1");
  assert.match(backup, /Resolve-PgTool "pg_dump"/);
  assert.match(backup, /Resolve-PgTool "pg_restore"/);
  assert.match(backup, /--format=custom/);
  assert.match(backup, /--schema=public/);
  assert.match(backup, /PGPASSWORD/);
  assert.match(backup, /Read-Host .* -AsSecureString/);
  assert.match(backup, /--list/);
  assert.match(backup, /Get-FileHash/);
  assert.match(backup, /TABLE DATA/);
  assert.doesNotMatch(backup, /& docker |& supabase db dump|git push/);
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

test("Windows PostgreSQL 18 backup tools are supported without Docker", () => {
  const backup = load("../scripts/backup-supabase-before-release.ps1");
  assert.ok(backup.includes("foreach ($major in @(18, 17))"));
  assert.ok(backup.includes("pg_restore.exe"));
  assert.ok(backup.includes("Resolve-PgTool \"pg_dump\""));
  assert.doesNotMatch(backup, /& docker/);
});
