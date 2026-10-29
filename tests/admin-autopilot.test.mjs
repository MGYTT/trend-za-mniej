import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const cockpit = read("../app/admin/autopilot/page.tsx");
const sidebar = read("../components/admin/AdminDesktopSidebar.tsx");
const shell = read("../components/admin/AdminAppShell.tsx");
const header = read("../components/admin/AdminHeader.tsx");
const dashboard = read("../components/admin/AdminMobileDashboard.tsx");
const admin = read("../app/admin/page.tsx");

test("Autopilot requires owner role and uses only authenticated, read-only queries", () => {
  assert.match(cockpit, /supabase\.auth\.getClaims\(\)/);
  assert.match(cockpit, /\.from\("admins"\)/);
  assert.match(cockpit, /admin\.role !== "owner"/);
  assert.match(cockpit, /redirect\("\/login"\)/);
  assert.match(cockpit, /count: "exact", head: true/g);
  assert.doesNotMatch(cockpit, /createAdminClient\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/);
  assert.match(cockpit, /dynamic = "force-dynamic"/);
  assert.match(cockpit, /index: false/);
});

test("actionable counts are based on real database rows and missing data is not zero", () => {
  for (const table of ["products","shein_campaigns","extension_offers","search_index_queue","editorial_outfits"]) {
    assert.ok(cockpit.includes('.from("' + table + '")'), table);
  }
  assert.match(cockpit, /\.is\("last_reviewed_at", null\)/);
  assert.match(cockpit, /\.is\("valid_until", null\)/);
  assert.match(cockpit, /\.is\("submitted_at", null\)/);
  assert.match(cockpit, /\.eq\("shein_identity_status", "conflict"\)/);
  assert.match(cockpit, /\.lt\("valid_until", today\)/);
  assert.match(cockpit, /return row\.error \? null : row\.count/);
  assert.match(cockpit, /Symbol „—” oznacza brak odczytu, a nie zero problemów/);
});

test("statuses distinguish one actual scheduled job, admin-assisted sync and manual work", () => {
  assert.match(cockpit, /Wygaszanie ofert po terminie/);
  assert.match(cockpit, /co 5 minut/);
  assert.match(cockpit, /Dotyczy wyłącznie ofert z ustaloną datą ważności/);
  assert.match(cockpit, /IndexNow i zgłoszenia wyszukiwarek/);
  assert.match(cockpit, /Zależne od panelu/);
  assert.match(cockpit, /Ceny i dostępność produktów/);
  assert.match(cockpit, /Nowe stylizacje/);
  assert.match(cockpit, /Publikacje w social mediach/);
  assert.match(cockpit, /Nie udajemy, że ręczne zadania są automatami/);
});

test("desktop and mobile navigation retain every old tool and introduce a clear entry point", () => {
  for (const href of [
    "/admin", "/admin#admin-offers", "/admin/nowa-oferta", "/admin/stylizacje",
    "/admin/social", "/admin/tiktok", "/admin/statystyki", "/admin/seo",
    "/admin/widocznosc", "/admin/zespol", "/admin/promocje-shein",
    "/admin/kody-rabatowe", "/admin/terminy-promocji", "/admin/skutecznosc",
  ]) assert.ok(sidebar.includes('href: "' + href + '"'), href);
  assert.match(sidebar, /href: "\/admin\/autopilot"/);
  assert.match(sidebar, /01 · Sterowanie/);
  assert.match(sidebar, /04 · Wyniki i jakość/);
  assert.match(shell, /href="\/admin\/autopilot"/);
  assert.match(shell, /href="\/admin\/terminy-promocji"/);
  assert.match(header, /return "Centrum Autopilota"/);
  assert.match(dashboard, /href="\/admin\/autopilot"/);
  assert.match(admin, /href="\/admin\/autopilot"/);
});
