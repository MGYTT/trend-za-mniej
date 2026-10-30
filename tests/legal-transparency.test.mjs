import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const productCard = read("../components/ProductCard.tsx");
const category = read("../app/kategorie/[slug]/page.tsx");
const product = read("../app/produkt/[slug]/page.tsx");
const popup = read("../components/WelcomeSheinOfferCard.tsx");
const popupSettings = read("../lib/welcome-shein-public.ts");
const promotions = read("../lib/shein-campaigns.ts");
const terms = read("../app/regulamin/page.tsx");
const privacy = read("../app/polityka-prywatnosci/page.tsx");
const contact = read("../app/kontakt/page.tsx");
const footer = read("../components/SiteFooter.tsx");
const styles = read("../app/stylizacje/[slug]/page.tsx");
const offers = read("../components/SheinPromotionsExplorer.tsx");
const coupons = read("../components/CouponCatalog.tsx");

test("uncertain old price and calculated percent are not shown as discounts", () => {
  assert.doesNotMatch(productCard, /oldPrice|percent >= 1|line-through/);
  assert.doesNotMatch(category, /oldPrice|showDiscount|−\{discount\}%/);
  assert.doesNotMatch(product, /getPriceDifference|Poprzednia cena w katalogu/);
});

test("every checked direct offer CTA clearly discloses the commercial nature", () => {
  for (const page of [product, popup, styles, offers, coupons]) {
    assert.match(page, /Reklama · link afiliacyjny/);
    assert.match(page, /prowizj/);
  }
});

test("SHEIN promotions require documented operator action or fresh manual review", () => {
  assert.match(popupSettings, /SHEIN_WELCOME_VERIFIED/);
  assert.match(popupSettings, /settings\.validUntil/);
  assert.match(promotions, /last_reviewed_at/);
  assert.match(promotions, /reviewCutoff/);
});

test("legal information names the natural-person operator without inventing company or NIP", () => {
  assert.match(terms, /LEGAl_IDENTITY_COMPLETE/i);
  assert.match(contact, /LEGAL_IDENTITY_COMPLETE/);
  assert.match(privacy, /LEGAL_IDENTITY_COMPLETE/);
  assert.match(terms, /nie jest sklepem/);
  assert.match(terms, /reklamacj/i);
  assert.match(privacy, /Vercel Web Analytics/);
  assert.match(footer, /href: "\/regulamin"/);
  for (const page of [terms, privacy, contact]) {
    assert.doesNotMatch(page, /NIP|REGON|spółka z ograniczoną/i);
  }
});
