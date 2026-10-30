import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const page = load("../app/produkt/[slug]/page.tsx");
const photo = load("../components/ProductPhoto.tsx");
const redirect = load("../app/go/[id]/route.ts");
const layout = load("../app/produkt/[slug]/layout.tsx");

test("product detail keeps original affiliate route and sponsored disclosures", () => {
  assert.match(page, /const goHref = `\/go\/\$\{product\.id\}`/);
  assert.equal((page.match(/href=\{goHref\}/g) ?? []).length, 2);
  assert.equal((page.match(/rel="sponsored nofollow noopener noreferrer"/g) ?? []).length, 2);
  assert.equal((page.match(/target="_blank"/g) ?? []).length, 2);
  assert.match(page, /Link afiliacyjny/);
  assert.match(redirect, /createAdminClient\(\)/);
  assert.match(redirect, /affiliate_clicks/);
  assert.match(redirect, /product\.affiliateUrl/);
});

test("product image uses existing image component and compact responsive dimensions", () => {
  assert.match(page, /import ProductPhoto from "@\/components\/ProductPhoto"/);
  assert.match(page, /<ProductPhoto\s+src=\{image\}/);
  assert.match(page, /relative aspect-square w-full/);
  assert.match(page, /lg:aspect-\[4\/5\] xl:aspect-square/);
  assert.match(page, /sizes="\(max-width: 639px\)/);
  assert.match(page, /priority\s+className="p-4 sm:p-6"/);
  assert.match(photo, /fetchPriority=/);
});

test("product purchase copy describes saved prices without unverified discounts", () => {
  assert.match(page, /Cena zapisana w katalogu/);
  assert.match(page, /Sprawdź aktualną ofertę w SHEIN/);
  assert.doesNotMatch(page, /Poprzednia cena w katalogu/);
  assert.doesNotMatch(page, /getPriceDifference|comparison\.oldPrice/);
  assert.match(page, /Reklama · link afiliacyjny/);
  assert.match(page, /nie gwarancja ceny w sklepie/);
  assert.doesNotMatch(page, /względem wcześniejszej ceny/);
  assert.doesNotMatch(page, /\{comparison\.percent\}/);
});

test("mobile purchase CTA remains visible and accessible without overlap", () => {
  assert.match(page, /pb-32 text-stone-900 md:pb-0/);
  assert.match(page, /max-w-7xl px-6 pb-12 pt-5/);
  assert.match(page, /fixed inset-x-0 bottom-0 z-40/);
  assert.match(page, /safe-area-inset-bottom/);
  assert.match(page, /Sprawdź w SHEIN/);
  assert.match(page, /min-\[380px\]:grid-cols-2/);
  assert.match(page, /min-h-14 w-full items-center/);
});

test("related looks show real products, outfit totals and no invented bundles", () => {
  assert.match(page, /getLooksForProduct\(/);
  assert.match(page, /getAllResolvedLooks\(allProducts\)/);
  assert.match(page, /look\.products\.slice\(0, 2\)\.map/);
  assert.match(page, /<ProductPhoto\s+src=\{lookProduct\.image\}/);
  assert.match(page, /formatPrice\(look\.total\)/);
  assert.match(page, /bez dostawy/);
  assert.match(page, /relatedProducts = allProducts/);
  assert.equal((page.match(/await getProducts\(/g) ?? []).length, 1);
});

test("product slug redirects, product metadata, schema and breadcrumbs stay intact", () => {
  assert.match(page, /generateMetadata/);
  assert.match(page, /getProductBySlug\(slug\)/);
  assert.match(page, /permanentRedirect\(`\/produkt\/\$\{currentSlug\}`\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /"@type": "Product"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /aria-label="Okruszki"/);
  assert.match(layout, /product_slug_redirects/);
});

test("product page has no malformed JSX class attributes", () => {
  assert.doesNotMatch(page, /className="[^"\n>]*>/);
  for (const tag of ["main", "section", "article", "aside", "nav", "a", "Link", "ProductPhoto"]) {
    const opening = (page.match(new RegExp("<" + tag + "(?=\\s|>)", "g")) ?? []).length;
    const closing = (page.match(new RegExp("</" + tag + ">", "g")) ?? []).length;
    const selfClosing = (page.match(new RegExp("<" + tag + "\\b[^>]*?/>", "g")) ?? []).length;
    assert.equal(opening, closing + selfClosing, tag);
  }
});
