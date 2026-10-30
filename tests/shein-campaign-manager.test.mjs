import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateSheinCampaign, CAMPAIGN_CATEGORIES } from "../lib/shein-campaign-validation.ts";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const api = read("../app/api/admin/shein-campaigns/route.ts");
const publicSource = read("../lib/shein-campaigns.ts");
const listing = read("../app/promocje-shein/page.tsx");
const explorer = read("../components/SheinPromotionsExplorer.tsx");
const admin = read("../app/admin/promocje-shein/page.tsx");
const studio = read("../components/admin/AdminSheinCampaignStudio.tsx");
const sidebar = read("../components/admin/AdminDesktopSidebar.tsx");
const mobile = read("../components/admin/AdminAppShell.tsx");

const base = {
  id: "nowe-okazje-shein",
  title: "Nowe okazje w sklepie SHEIN",
  badge: "Moda damska",
  description: "Wybrane kampanie dotyczące oferty SHEIN dla kobiet.",
  code: "ABC1234",
  affiliateUrl: "https://onelink.shein.com/56/64fxs0mpouek",
  ctaLabel: "Zobacz aktualną kampanię",
  note: "Aktualne warunki oraz dostępność sprawdź bezpośrednio w SHEIN.",
  category: "fashion",
  codeKind: "campaign",
  sortOrder: 110,
  published: false,
  validUntil: null,
};

test("normalizes legitimate campaign codes and allows drafts", () => {
  const result = validateSheinCampaign({ ...base, code: "abc1234" });
  assert.ok("value" in result);
  assert.equal(result.value.code, "ABC1234");
  assert.equal(result.value.published, false);
  assert.equal(result.value.affiliateUrl, base.affiliateUrl);
});

test("refuses dangerous links, wrong hosts, non-HTTPS, fragments and redirect parameters", () => {
  for (const affiliateUrl of [
    "http://onelink.shein.com/56/64fxs0mpouek",
    "https://onelink.shein.com.evil.com/56/64fxs0mpouek",
    "https://evil.com/deal",
    "javascript:alert(1)",
    "https://onelink.shein.com/56/abc?q=1",
    "https://onelink.shein.com/56/abc#x",
    "https://onelink.shein.com/unsupported/path",
  ]) {
    assert.ok("error" in validateSheinCampaign({ ...base, affiliateUrl }), affiliateUrl);
  }
});

test("rejects malformed slug, code, invalid category, misleading type and published coercion", () => {
  for (const input of [
    { id: "../../private" }, { id: "X-Invalid" }, { code: "A B" },
    { category: "admin" }, { codeKind: "verified" }, { published: "true" },
    { sortOrder: -1 }, { sortOrder: 3.5 }, { sortOrder: 10000 },
    { title: "Short" }, { note: "Short" },
  ]) {
    assert.ok("error" in validateSheinCampaign({ ...base, ...input }), JSON.stringify(input));
  }
  assert.equal(CAMPAIGN_CATEGORIES.length, 7);
});

test("validates calendar date without throwing and permits no expiry", () => {
  for (const date of ["2026-02-30", "2026-13-07", "not-a-date", "2026-10-1"]) {
    assert.ok("error" in validateSheinCampaign({ ...base, validUntil: date }), date);
  }
  assert.ok("value" in validateSheinCampaign({ ...base, validUntil: "2026-11-30" }));
  assert.ok("value" in validateSheinCampaign({ ...base, validUntil: null }));
});

test("server writes are owner-only, same-origin and validated again", () => {
  assert.match(api, /supabase\.auth\.getClaims\(\)/);
  assert.match(api, /admin\?\.role !== "owner"/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /validateSheinCampaign\(body\)/);
  assert.match(api, /\.from\("shein_campaigns"\)/);
  assert.match(api, /revalidatePath\("\/promocje-shein"\)/);
  assert.match(api, /export async function POST/);
  assert.match(api, /export async function PATCH/);
  assert.doesNotMatch(api, /service_role|createAdminClient/);
});

test("public reads published campaigns only and never falls back to hidden historical links", () => {
  assert.match(publicSource, /\.eq\("published", true\)/);
  assert.match(publicSource, /sort_order/);
  assert.match(publicSource, /valid_until/);
  assert.match(publicSource, /return \{ promotions: \[\], updatedAt: SHEIN_PROMOTIONS_UPDATED_AT, unavailable: true \}/);
  assert.match(listing, /export const dynamic = "force-dynamic"/);
  assert.match(listing, /await getPublishedSheinCampaigns\(\)/);
  assert.match(listing, /<SheinPromotionsExplorer promotions=\{promotions\}/);
  assert.match(listing, /dateModified: updatedAt/);
  assert.match(listing, /nie są weryfikowane w czasie rzeczywistym/);
});

test("admin page checks owner role before reading unpublished records", () => {
  assert.match(admin, /supabase\.auth\.getClaims\(\)/);
  assert.match(admin, /admin\.role !== "owner"/);
  assert.match(admin, /from\("shein_campaigns"\)/);
  assert.match(admin, /force-dynamic/);
  assert.match(admin, /<AdminSheinCampaignStudio/);
  assert.match(admin, /nie są/);
});

test("editor can edit both existing rows and new drafts with explicit publish action", () => {
  assert.match(studio, /initialCampaigns: SheinCampaignRow\[\]/);
  assert.match(studio, /method: editing \? "PATCH" : "POST"/);
  assert.match(studio, /fetch\("\/api\/admin\/shein-campaigns"/);
  assert.match(studio, /void save\(false\)/);
  assert.match(studio, /void save\(true\)/);
  assert.match(studio, /router\.refresh\(\)/);
  assert.match(studio, /type="date"/);
  assert.match(studio, /sortOrder/);
  assert.match(studio, /Potwierdź rodzaj kodu|upewnij się|Upewnij się/);
});

test("public UI respects editable categories, order, label and affiliate disclosures", () => {
  assert.match(explorer, /promotion\.category/);
  assert.match(explorer, /sortOrder/);
  assert.match(explorer, /promotion\.codeKind/);
  assert.match(explorer, /promotion\.ctaLabel/);
  assert.match(explorer, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(explorer, /target="_blank"/);
});

test("campaign manager is reachable from desktop and iOS navigation", () => {
  assert.match(sidebar, /href: "\/admin\/promocje-shein"/);
  assert.match(mobile, /href: "\/admin\/promocje-shein"/);
  assert.match(mobile, /pathname\.startsWith\("\/admin\/promocje-shein"\)/);
});

test("modified JSX has no unterminated class attributes", () => {
  for (const text of [admin, studio, listing, explorer]) {
    assert.doesNotMatch(text, /className="[^"\n>]*>/);
  }
});


test("owner explicitly confirms fresh manual checks before publishing SHEIN campaigns", () => {
  assert.match(api, /verifiedNow !== true/);
  assert.match(api, /last_reviewed_at: new Date\(\)\.toISOString\(\)/);
  assert.match(studio, /verifiedNow/);
  assert.match(studio, /Potwierdzam, że/);
});
