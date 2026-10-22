import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STYLE_GUIDES, getGuideBySlug, getGuidesForLook } from "../lib/poradniki.ts";
import { LOOKS } from "../lib/stylizacje.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const listing = read("../app/poradniki/page.tsx");
const detail = read("../app/poradniki/[slug]/page.tsx");
const sitemap = read("../app/sitemap.ts");
const home = read("../app/page.tsx");
const outfits = read("../app/stylizacje/page.tsx");
const outfitDetail = read("../app/stylizacje/[slug]/page.tsx");
const footer = read("../components/SiteFooter.tsx");
const lookBySlug = new Map(LOOKS.map((look) => [look.slug, look]));

test("three editorial guides, unique public slugs", () => {
  assert.equal(STYLE_GUIDES.length, 3);
  assert.equal(new Set(STYLE_GUIDES.map((guide) => guide.slug)).size, STYLE_GUIDES.length);
  for (const guide of STYLE_GUIDES) {
    assert.match(guide.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(getGuideBySlug(guide.slug), guide);
    assert.ok(guide.title.length > 35);
    assert.ok(guide.summary.length > 70);
    assert.ok(guide.lead.length > 120);
    assert.equal(guide.sections.length, 3);
    assert.equal(guide.checklist.length, 5);
    assert.ok(new Set(guide.sections.map((section) => section.id)).size === 3);
    assert.ok(guide.sections.every((section) =>
      section.paragraphs.length === 2 &&
      section.paragraphs.every((paragraph) => paragraph.length > 120) &&
      section.tips.length >= 2));
  }
  assert.equal(getGuideBySlug("nie-ma-takiego-poradnika"), undefined);
});

test("only existing outfit configurations within each guide budget", () => {
  for (const guide of STYLE_GUIDES) {
    assert.ok(guide.relatedLookSlugs.length >= 1);
    assert.equal(new Set(guide.relatedLookSlugs).size, guide.relatedLookSlugs.length);
    const budget = /do-(100|150)-zl/.exec(guide.slug);
    for (const outfitSlug of guide.relatedLookSlugs) {
      const look = lookBySlug.get(outfitSlug);
      assert.ok(look, outfitSlug);
      if (budget) {
        assert.ok(look.maxBudget <= Number(budget[1]));
      }
      assert.ok(getGuidesForLook(outfitSlug).some((item) => item.slug === guide.slug));
    }
  }
  assert.deepEqual(getGuidesForLook("nieznany-zestaw"), []);
});

test("articles have metadata and unknown slugs return 404", () => {
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /getGuideBySlug\(slug\)/);
  assert.match(detail, /if \(!guide\) notFound\(\)/);
  assert.match(detail, /canonical: "\/poradniki\/" \+ guide\.slug/);
  assert.match(detail, /"BreadcrumbList"/);
  assert.match(detail, /"Article"/);
  assert.match(detail, /publisher: \{ "@type": "Organization"/);
  assert.doesNotMatch(detail, /FAQPage|AggregateRating|Review|ratingValue|datePublished/);
});

test("editorials hide unavailable looks and explain saved prices", () => {
  assert.match(detail, /look\.available && guide\.relatedLookSlugs\.includes\(look\.slug\)/);
  assert.match(listing, /filter\(\(look\) => look\.available\)/);
  assert.match(detail, /getProducts\(\)/);
  assert.match(detail, /formatPrice\(look\.total\)/);
  assert.match(detail, /ceny to sumy zapisane/i);
  assert.match(detail, /suma zapisanych cen, bez dostawy/i);
  assert.match(detail, /Bez fizycznych testów produktów/);
  assert.match(listing, /udawania, że przetestowaliśmy każdą rzecz/i);
  assert.match(detail, /\/afiliacja/);
  assert.doesNotMatch(detail, /href=\{product\.affiliateUrl\}/);
});

test("index and sitemap expose the guide hub and all editorial pages", () => {
  assert.match(listing, /canonical: "\/poradniki"/);
  assert.match(listing, /"ItemList"/);
  assert.match(listing, /numberOfItems: STYLE_GUIDES\.length/);
  assert.match(sitemap, /\/poradniki/);
  assert.match(sitemap, /STYLE_GUIDES\.map\(\(guide\) =>/);
  assert.match(sitemap, /\.\.\.guidePages/);
});

test("home, footer, and outfits link to guides", () => {
  assert.match(home, /<EditorialGuides \/>/);
  assert.match(home, /href=\{"\/poradniki\/" \+ guide\.slug\}/);
  assert.match(footer, /"\/poradniki"/);
  assert.match(outfits, /href="\/poradniki"/);
  assert.match(outfitDetail, /getGuidesForLook\(look\.slug\)/);
  assert.match(outfitDetail, /"\/poradniki\/" \+ guide\.slug/);
});

test("no fake shop verification, reviews or guaranteed sales", () => {
  const allContent = STYLE_GUIDES.map((guide) =>
    [guide.title, guide.lead, guide.summary,
      ...guide.sections.flatMap((s) => [...s.paragraphs, ...s.tips]),
      ...guide.checklist].join(" ")
  ).join(" ");
  assert.doesNotMatch(allContent, /testowałam osobiście|sprawdziliśmy w sklepie|gwarantowana prowizja|najniższa cena na rynku/i);
  assert.ok(allContent.includes("SHEIN"));
});
