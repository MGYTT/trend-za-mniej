import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_NAME, SITE_DEFAULT_TITLE, SITE_DESCRIPTION } from "../lib/site.ts";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const layout = load("../app/layout.tsx");
const home = load("../app/page.tsx");
const outfits = load("../app/stylizacje/page.tsx");
const guides = load("../app/poradniki/page.tsx");
const guideDetail = load("../app/poradniki/[slug]/page.tsx");
const icon = load("../app/icon.tsx");
const apple = load("../app/apple-icon.tsx");
const og = load("../app/opengraph-image.tsx");
const sitemap = load("../app/sitemap.ts");
const robots = load("../app/robots.ts");

test("distinctive, truthful home result without duplicated brand name", () => {
  assert.equal(SITE_NAME, "Trend za Mniej");
  assert.ok(SITE_DEFAULT_TITLE.startsWith("Stylizacje damskie"));
  assert.ok(SITE_DEFAULT_TITLE.endsWith(" | " + SITE_NAME));
  assert.equal(SITE_DEFAULT_TITLE.split(SITE_NAME).length, 2);
  assert.match(SITE_DESCRIPTION, /100–200 zł/);
  assert.match(SITE_DESCRIPTION, /sprawdź ceny u sprzedawcy/);
  assert.doesNotMatch(SITE_DESCRIPTION, /gwarantuj|najtańsz|codziennie nowe/i);
  assert.match(home, /Gotowe stylizacje\./);
  assert.match(home, /Moda za mniej\./);
  assert.doesNotMatch(home, /Codziennie nowe modne perełki/);
});

test("root brand and crawl metadata are consistent", () => {
  assert.match(layout, /metadataBase:/);
  assert.match(layout, /template:\s*"%s \| Trend za Mniej"/);
  assert.match(layout, /SITE_DEFAULT_TITLE/);
  assert.match(layout, /SITE_DESCRIPTION/);
  assert.match(layout, /type:\s*"WebSite"/);
  assert.match(layout, /type:\s*"Organization"/);
  assert.match(layout, /name:\s*SITE_NAME/);
  assert.match(layout, /"max-image-preview":\s*"large"/);
  assert.match(layout, /canonical:\s*"\/"/);
  assert.match(layout, /\/icon/);
  assert.match(layout, /\/opengraph-image/);
});

test("outfit and guide listing titles describe their distinct content", () => {
  assert.match(outfits, /title: "Stylizacje damskie do 100, 150 i 200 zł"/);
  assert.match(outfits, /canonical: "\/stylizacje"/);
  assert.match(outfits, /ceny zapisanych w katalogu/i);
  assert.match(guides, /title: "Poradniki modowe: stylizacje i zakupy z głową"/);
  assert.match(guides, /canonical: "\/poradniki"/);
  assert.match(guideDetail, /canonical: "\/poradniki\/" \+ guide\.slug/);
  assert.match(guideDetail, /images: \[\{ url: "\/opengraph-image"/);
  assert.doesNotMatch(guideDetail, /ratingValue|AggregateRating|FAQPage/);
});

test("favicon is recognizable and keeps Google's stable icon URL", () => {
  assert.match(icon, /width: 512/);
  assert.match(icon, /height: 512/);
  assert.match(icon, /background: "#e11d48"/);
  assert.match(icon, />T<\/span>/);
  assert.doesNotMatch(icon, /♥|heart|f97316/);
  assert.match(apple, /width: 180/);
  assert.match(apple, /height: 180/);
  assert.match(apple, />T<\/span>/);
  assert.match(icon, /runtime = "nodejs"/);
  assert.match(apple, /runtime = "nodejs"/);
  assert.match(layout, /url: "\/icon"/);
  assert.match(layout, /url: "\/apple-icon"/);
});

test("sharing preview has no unfounded freshness claims", () => {
  assert.match(og, /Trend za Mniej/);
  assert.match(og, /Gotowe stylizacje w Twoim budżecie/);
  assert.match(og, /Poznaj skład zestawów i wybieraj świadomie/);
  assert.doesNotMatch(og, /Codziennie nowe|Najniższe ceny|100% gwarancji/i);
});

test("existing indexed routes and exclusion rules remain intact", () => {
  assert.match(sitemap, /\/poradniki/);
  assert.match(sitemap, /\/stylizacje/);
  assert.match(sitemap, /\.\.\.guidePages/);
  assert.match(robots, /\/admin/);
  assert.match(robots, /\/go/);
  assert.match(robots, /\/api/);
  assert.match(robots, /sitemap\.xml/);
});
