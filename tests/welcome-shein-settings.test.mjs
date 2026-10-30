import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_WELCOME_SHEIN, validateWelcomeSheinSettings,
  mapWelcomeRow, welcomeSettingsToRow, WELCOME_AFFILIATE_DISCLOSURE,
} from "../lib/welcome-shein-settings.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const api = read("../app/api/admin/welcome-shein/route.ts");
const page = read("../app/admin/oferta-powitalna/page.tsx");
const editor = read("../components/admin/WelcomeSheinEditor.tsx");
const card = read("../components/WelcomeSheinOfferCard.tsx");
const publicData = read("../lib/welcome-shein-public.ts");
const sql = read("../supabase/migrations/20261029_welcome_shein_settings.sql");
const sidebar = read("../components/admin/AdminDesktopSidebar.tsx");
const mobile = read("../components/admin/AdminAppShell.tsx");

test("original 60% offer is preserved as defaults and edits are validated", () => {
  assert.equal(DEFAULT_WELCOME_SHEIN.campaignCode, "SBNSL5D");
  assert.equal(DEFAULT_WELCOME_SHEIN.affiliateUrl, "https://onelink.shein.com/58/66hx4q3nwzrl");
  assert.equal(DEFAULT_WELCOME_SHEIN.discountPercent, 60);
  assert.equal(DEFAULT_WELCOME_SHEIN.delaySeconds, 10);
  assert.equal(DEFAULT_WELCOME_SHEIN.enabled, false); // Unverified discount cannot be enabled by default.
  const checked = validateWelcomeSheinSettings({ ...DEFAULT_WELCOME_SHEIN, campaignCode: "newcode1" });
  assert.ok("value" in checked);
  assert.equal(checked.value.campaignCode, "NEWCODE1");
  assert.equal(checked.value.theme, "peach");
  assert.ok(WELCOME_AFFILIATE_DISCLOSURE.includes("nie gwarantuje rabatu"));
});

test("malformed URLs, deceptive hosts, CSS themes, invalid controls are rejected", () => {
  for (const affiliateUrl of [
    "javascript:alert(1)", "https://fake.com/58/66hx4q3nwzrl",
    "http://onelink.shein.com/58/66hx4q3nwzrl",
    "https://onelink.shein.com.evil.com/58/66hx4q3nwzrl",
    "https://onelink.shein.com/58/abc?redirect=https://fake.com",
    "https://onelink.shein.com/58/abc#x",
    "https://onelink.shein.com/path",
  ]) assert.ok("error" in validateWelcomeSheinSettings({ ...DEFAULT_WELCOME_SHEIN, affiliateUrl }), affiliateUrl);
  for (const patch of [
    { enabled: "false" }, { theme: "bg-red-900" },
    { discountPercent: 101 }, { discountPercent: 0 },
    { discountPercent: 5.5 }, { delaySeconds: 0 }, { delaySeconds: 300 },
    { campaignVersion: -1 }, { validUntil: "2026-02-30" },
    { headline: "x" }, { extraNote: "x".repeat(500) },
    { campaignCode: "WRONG CODE" },
  ]) assert.ok("error" in validateWelcomeSheinSettings({ ...DEFAULT_WELCOME_SHEIN, ...patch }), JSON.stringify(patch));
});

test("database mapping and write payload retain all editable fields", () => {
  const raw = welcomeSettingsToRow(DEFAULT_WELCOME_SHEIN, "00000000-0000-4000-8000-000000000001");
  const result = mapWelcomeRow(raw);
  assert.deepEqual(result, DEFAULT_WELCOME_SHEIN);
  assert.equal(raw.campaign_code, "SBNSL5D");
  assert.equal(raw.campaign_version, 1);
  assert.equal(raw.updated_by, "00000000-0000-4000-8000-000000000001");
});

test("database enforces singleton RLS, owner mutation and public-only active campaigns", () => {
  assert.match(sql, /enable row level security/);
  assert.match(sql, /welcome_shein_singleton check \(id = 'homepage'\)/);
  assert.match(sql, /enabled = true and \(valid_until is null or valid_until >= current_date\)/);
  assert.match(sql, /using \(\(select public\.is_owner\(\)\)\)/);
  assert.match(sql, /revoke all on public\.welcome_shein_offer from anon, authenticated/);
  assert.match(sql, /grant select on public\.welcome_shein_offer to anon, authenticated/);
  assert.match(sql, /grant update on public\.welcome_shein_offer to authenticated/);
  assert.doesNotMatch(sql, /grant (?:insert|delete|all) on public\.welcome_shein_offer to anon/);
  assert.match(publicData, /\.eq\("enabled", true\)/);
  assert.match(publicData, /return null/);
});

test("owner-only API validates input, updates existing singleton and invalidates home cache", () => {
  assert.match(api, /supabase\.auth\.getClaims\(\)/);
  assert.match(api, /admin\?\.role !== "owner"/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /validateWelcomeSheinSettings\(raw\)/);
  assert.match(api, /\.from\("welcome_shein_offer"\)/);
  assert.match(api, /\.update\(welcomeSettingsToRow\(checked\.value, userId\)\)/);
  assert.match(api, /\.eq\("id", "homepage"\)/);
  assert.match(api, /revalidatePath\("\/", "page"\)/);
  assert.match(api, /export async function PATCH/);
  assert.doesNotMatch(api, /createAdminClient|service_role|\.insert\(|\.delete\(/);
  assert.match(page, /admin\.role !== "owner"/);
  assert.match(page, /dynamic = "force-dynamic"/);
});

test("editor supports toggle, live preview, code, URL, copy, themes, timing and campaign version", () => {
  assert.match(editor, /role="switch"/);
  assert.match(editor, /<WelcomeSheinOfferCard settings=\{form\} preview \/>/);
  assert.match(editor, /patch\("campaignVersion", form\.campaignVersion \+ 1\)/);
  assert.match(editor, /onClick=\{\(\) => void save\(\)\}/);
  assert.match(editor, /\/api\/admin\/welcome-shein/);
  assert.match(editor, /discountPercent/);
  assert.match(editor, /affiliateUrl/);
  assert.match(editor, /validUntil/);
  assert.match(editor, /delaySeconds/);
  assert.match(editor, /form\.enabled/);
  assert.match(card, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(card, /WELCOME_AFFILIATE_DISCLOSURE/);
  assert.match(card, /const THEMES/);
  assert.match(sidebar, /href: "\/admin\/oferta-powitalna"/);
  assert.match(mobile, /href: "\/admin\/oferta-powitalna"/);
});
