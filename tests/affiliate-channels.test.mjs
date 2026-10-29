import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const productRedirect = load("../app/go/[id]/route.ts");
const outfits = load("../app/stylizacje/[slug]/page.tsx");
const sheinRedirect = load("../app/promocje-shein/go/[id]/route.ts");
const dashboard = load("../app/admin/skutecznosc/page.tsx");
const productStats = load("../app/admin/statystyki/page.tsx");
const shell = load("../components/admin/AdminAppShell.tsx");
const sidebar = load("../components/admin/AdminDesktopSidebar.tsx");
const header = load("../components/admin/AdminHeader.tsx");
const productTests = load("./product-detail.test.mjs");
const outfitTests = load("./outfits-ui.test.mjs");

test("product redirect marks new clicks as products without breaking affiliate destination", () => {
  assert.match(productRedirect, /source: verifiedLook \? "outfit" : "product"/);
  assert.match(productRedirect, /outfit_slug: verifiedLook/);
  assert.match(productRedirect, /getProductById\(id\)/);
  assert.match(productRedirect, /product\.affiliateUrl/);
  assert.match(productRedirect, /createAdminClient\(\)/);
  assert.match(productRedirect, /\.from\(\s*"affiliate_clicks"\s*\)/);
  assert.match(productRedirect, /NextResponse\.redirect/);
  assert.match(productRedirect, /export const dynamic = "force-dynamic"/);
});

test("outfit attribution is validated against active complete looks, not a raw URL parameter", () => {
  assert.match(outfits, /origin=outfit&look=/);
  assert.match(outfits, /encodeURIComponent\(look\.slug\)/);
  assert.match(productRedirect, /requestedUrl\.searchParams\.get\("origin"\) === "outfit"/);
  assert.match(productRedirect, /requestedUrl\.searchParams\.get\("look"\)/);
  assert.match(productRedirect, /getAllResolvedLooks\(await getProducts\(\)\)/);
  assert.match(productRedirect, /look\.slug === requestedLook && look\.available/);
  assert.match(productRedirect, /look\.products\.some\(\(item\) => item\.id === product\.id\)/);
  assert.match(productRedirect, /if \(matchedLook\) verifiedLook = matchedLook\.slug/);
  assert.match(productRedirect, /try \{/);
});

test("SHEIN click system and existing product/outfit regression tests remain present", () => {
  assert.match(sheinRedirect, /shein_campaign_clicks/);
  assert.match(sheinRedirect, /safeCampaignUrl\(campaign\.affiliate_url\)/);
  assert.match(productTests, /original affiliate route/);
  assert.match(outfitTests, /outfit affiliates still point to tracking redirects/);
});

test("unified report authorizes owner before querying sensitive statistics", () => {
  const owner = dashboard.indexOf('admin.role !== "owner"');
  const firstRpc = dashboard.indexOf('get_affiliate_channel_stats');
  assert.ok(owner >= 0 && firstRpc > owner);
  assert.match(dashboard, /supabase\.auth\.getClaims\(\)/);
  assert.match(dashboard, /export const dynamic = "force-dynamic"/);
  assert.match(dashboard, /supabase\.rpc\("get_affiliate_channel_stats", \{ p_days: selectedDays \}\)/);
  assert.match(dashboard, /supabase\.rpc\("get_outfit_affiliate_stats", \{ p_days: selectedDays \}\)/);
  assert.match(dashboard, /supabase\.rpc\("get_shein_campaign_click_stats", \{ p_days: selectedDays \}\)/);
});

test("comparison separates product, outfit, SHEIN and unknown historical traffic", () => {
  assert.match(dashboard, /key: "product"/);
  assert.match(dashboard, /key: "outfit"/);
  assert.match(dashboard, /key: "shein"/);
  assert.match(dashboard, /bySource\.get\("unassigned"\)/);
  assert.match(dashboard, /Nie doliczamy ich do żadnego kanału/);
  assert.match(dashboard, /knownTotal = SOURCES\.reduce/);
  assert.match(dashboard, /unassigned > 0/);
  assert.match(dashboard, /To liczba przejść afiliacyjnych, nie sprzedaż, przychód ani liczba unikalnych osób/);
});

test("report allows 7 or 30 day windows with genuine empty and error states", () => {
  assert.match(dashboard, /selectedDays = days === "7" \? 7 : 30/);
  assert.match(dashboard, /\/admin\/skutecznosc\?days=/);
  assert.match(dashboard, /statsUnavailable/);
  assert.match(dashboard, /Zbiorcze statystyki są chwilowo niedostępne/);
  assert.match(dashboard, /Brak przejść do promocji SHEIN/);
  assert.match(dashboard, /Na razie nie ma przypisanych kliknięć stylizacji/);
  assert.match(dashboard, /<RankingSection/);
});

test("outfit ranking labels are grounded in actual editor and legacy outfit titles", () => {
  assert.match(dashboard, /import \{ LOOKS \} from "@\/lib\/stylizacje"/);
  assert.match(dashboard, /\.from\("editorial_outfits"\)\.select\("slug,title"\)\.eq\("published", true\)/);
  assert.match(dashboard, /LOOKS\.map/);
  assert.match(dashboard, /outfitTitles\.get\(row\.outfit_slug\)/);
  assert.match(dashboard, /href: "\/stylizacje\/" \+ item\.slug/);
});

test("desktop, iOS, existing analytics and headers link to the new report", () => {
  assert.match(sidebar, /href: "\/admin\/skutecznosc"/);
  assert.match(shell, /href: "\/admin\/skutecznosc"/);
  assert.match(shell, /pathname\.startsWith\("\/admin\/skutecznosc"\)/);
  assert.match(header, /pathname\.startsWith\("\/admin\/skutecznosc"\)/);
  assert.match(productStats, /adminData\.role === "owner"/);
  assert.match(productStats, /href="\/admin\/skutecznosc"/);
  assert.match(productStats, /"user_id,role"/);
});

test("existing product and SHEIN statistics remain distinct from attributed channel totals", () => {
  assert.match(productStats, /get_clicks_by_day/);
  assert.match(productStats, /get_product_click_stats/);
  assert.match(productStats, /affiliate_clicks/);
  assert.match(dashboard, /get_shein_campaign_click_stats/);
  assert.match(dashboard, /get_affiliate_channel_stats/);
  assert.doesNotMatch(dashboard, /revenue|order_total|commission|confirmedPurchases/);
});

test("changed JSX attributes are not accidentally left unterminated", () => {
  for (const source of [dashboard, sidebar, shell, header, productStats]) {
    assert.doesNotMatch(source, /className="[^"\n>]*>/);
    assert.doesNotMatch(source, /^<<<<<<< /m);
  }
});
