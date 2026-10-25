import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const redirect = read("../app/promocje-shein/go/[id]/route.ts");
const publicUi = read("../components/SheinPromotionsExplorer.tsx");
const adminPage = read("../app/admin/promocje-shein/page.tsx");
const studio = read("../components/admin/AdminSheinCampaignStudio.tsx");
const campaignSource = read("../lib/shein-campaigns.ts");
const productGo = read("../app/go/[id]/route.ts");

test("public campaign links use the tracking route without losing affiliate disclosures", () => {
  assert.ok(publicUi.includes('href={"/promocje-shein/go/" + encodeURIComponent(promotion.id)}'));
  assert.ok(publicUi.includes('rel="sponsored nofollow noopener noreferrer"'));
  assert.ok(publicUi.includes('target="_blank"'));
  assert.ok(!publicUi.includes("href={promotion.affiliateUrl}"));
  assert.ok(redirect.includes('export async function GET'));
});

test("redirect resolves only existing active campaign with validated SHEIN destination", () => {
  for (const part of [
    '.from("shein_campaigns")', '.eq("id", id)', '.eq("published", true)',
    'campaign.valid_until && campaign.valid_until < warsawDate()',
    'safeCampaignUrl(campaign.affiliate_url)', 'url.protocol !== "https:"',
    'url.hostname !== "onelink.shein.com"', 'url.username || url.password',
    'url.search || url.hash', 'NextResponse.redirect(fallback',
  ]) assert.ok(redirect.includes(part), part);
  assert.ok(!redirect.includes('searchParams.get("url")'));
});

test("tracking stores only campaign ID and cannot prevent redirects", () => {
  assert.ok(redirect.includes('createAdminClient()'));
  assert.ok(redirect.includes('.from("shein_campaign_clicks")'));
  assert.ok(redirect.includes('.insert({ campaign_id: campaign.id })'));
  assert.ok(redirect.includes('return NextResponse.redirect(destination'));
  assert.ok(redirect.includes('"Cache-Control": "private, no-store, max-age=0"'));
  assert.doesNotMatch(redirect, /user_agent|ip_address|userId|cookie|fingerprint/i);
  assert.ok(productGo.includes('affiliate_clicks'));
});

test("only owner can query campaign metrics in a server component", () => {
  const owner = adminPage.indexOf('admin.role !== "owner"');
  const stats = adminPage.indexOf('get_shein_campaign_click_stats');
  assert.ok(owner >= 0 && stats > owner);
  assert.ok(adminPage.includes('supabase.auth.getClaims()'));
  assert.ok(adminPage.includes('supabase.rpc("get_shein_campaign_click_stats", { p_days: 7 })'));
  assert.ok(adminPage.includes('supabase.rpc("get_shein_campaign_click_stats", { p_days: 30 })'));
  assert.ok(adminPage.includes('analyticsUnavailable={analyticsUnavailable}'));
  assert.ok(!studio.includes('.from("shein_campaign_clicks")'));
});

test("7 and 30-day insights are actual click counts rather than conversions", () => {
  assert.ok(campaignSource.includes('export type CampaignClickCounts'));
  assert.ok(studio.includes('useState<7 | 30>(30)'));
  assert.ok(studio.includes('clickCounts[id]'));
  assert.ok(studio.includes('aria-pressed={analyticsDays === days}'));
  assert.ok(studio.includes('measuredTotal.toLocaleString("pl-PL")'));
  assert.ok(studio.includes('topCampaigns.map('));
  assert.ok(studio.includes('clicksFor(row.id)'));
  assert.ok(studio.includes('To nie są zakupy, przychody ani liczba unikalnych osób.'));
});

test("unavailable metrics are not shown as real zero and empty state is explained", () => {
  assert.ok(adminPage.includes('analyticsUnavailable = Boolean(weekResult.error || monthResult.error)'));
  assert.ok(studio.includes('analyticsUnavailable ? ('));
  assert.ok(studio.includes('Statystyki chwilowo niedostępne'));
  assert.ok(studio.includes('Brak zarejestrowanych przejść'));
  assert.ok(studio.includes('bez danych historycznych'));
});

test("publishing process and product affiliate redirects remain unchanged", () => {
  assert.ok(studio.includes('method: editing ? "PATCH" : "POST"'));
  assert.ok(studio.includes('void save(false)'));
  assert.ok(studio.includes('void save(true)'));
  assert.ok(publicUi.includes('Opis i warunki kampanii'));
  assert.ok(productGo.includes('getProductById(id)'));
});

test("modified JSX remains intact", () => {
  for (const source of [studio, adminPage, publicUi]) {
    assert.doesNotMatch(source, /className="[^"\n>]*>/);
    assert.doesNotMatch(source, /^<<<<<<< /m);
  }
});
