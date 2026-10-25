import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STYLE_GUIDES, getGuideBySlug } from "../lib/poradniki.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const index = read("../app/poradniki/page.tsx");
const detail = read("../app/poradniki/[slug]/page.tsx");
const finder = read("../components/guides/GuideExplorer.tsx");
const checklist = read("../components/guides/GuideChecklist.tsx");
const planner = read("../components/guides/GuideBudgetPlanner.tsx");
const sitemap = read("../app/sitemap.ts");

test("six unique editorial guides keep the three existing canonical addresses", () => {
  assert.equal(STYLE_GUIDES.length, 6);
  assert.equal(new Set(STYLE_GUIDES.map((item) => item.slug)).size, 6);
  for (const slug of [
    "jak-ubrac-sie-do-pracy-do-150-zl",
    "co-zalozyc-na-weekend-do-150-zl",
    "jak-skompletowac-stylizacje-do-100-zl",
  ]) assert.ok(getGuideBySlug(slug), slug);
  for (const slug of [
    "jak-dobrac-rozmiar-ubran-przez-internet",
    "szafa-kapsulowa-na-maly-budzet",
    "jak-laczyc-kolory-ubran-w-stylizacji",
  ]) assert.ok(getGuideBySlug(slug), slug);
});

test("each editorial provides genuine practical guidance rather than artificial keywords", () => {
  for (const guide of STYLE_GUIDES) {
    assert.ok(guide.quickAnswer.length > 100, guide.slug);
    assert.equal(guide.quickSteps.length, 3, guide.slug);
    assert.equal(guide.checklist.length, 5, guide.slug);
    assert.equal(guide.sections.length, 3, guide.slug);
    assert.ok(guide.sections.every((section) => section.paragraphs.length === 2 && section.tips.length >= 2));
    assert.ok(guide.summary.length > 70);
    assert.ok(guide.readMinutes > 0);
    assert.ok(["Budżet","Zakupy online","Styl","Okazje"].includes(guide.topic));
  }
});

test("guide hub has indexable SSR cards, helpful search, categories, clear UX and fallback", () => {
  assert.match(index, /<GuideExplorer guides=\{cards\}/);
  assert.match(index, /"CollectionPage"/);
  assert.match(index, /"ItemList"/);
  assert.match(index, /numberOfItems: STYLE_GUIDES\.length/);
  assert.match(index, /canonical: "\/poradniki"/);
  assert.match(index, /getAllResolvedLooks/);
  assert.match(finder, /useMemo/);
  assert.match(finder, /input id="guide-search" type="search"/);
  assert.match(finder, /aria-pressed=\{item === topic\}/);
  assert.match(finder, /aria-live="polite"/);
  assert.match(finder, /setQuery\("editorial-placeholder-never-used"\)|onChange=\{\(event\) => setQuery\(event\.target\.value\)\}/);
  assert.match(finder, /setTopic\("Wszystkie"\)/);
  assert.match(finder, /guide\.quickSteps\[0\]/);
  assert.match(finder, /href=\{"\/poradniki\/" \+ guide\.slug\}/);
});

test("article gives instant answer, actionable steps and optional explanatory detail", () => {
  assert.match(detail, /guide\.quickAnswer/);
  assert.match(detail, /guide\.quickSteps\.map/);
  assert.match(detail, /<details className=/);
  assert.match(detail, /section\.tips\.map/);
  assert.match(detail, /section\.paragraphs\.map/);
  assert.match(detail, /id=\{section\.id\}/);
  assert.match(detail, /"#" \+ section\.id/);
  assert.match(detail, /aria-label="Spis treści poradnika"/);
  assert.match(detail, /<GuideChecklist items=\{guide\.checklist\}/);
});

test("shopping checklist remains interactive and accessible on phones", () => {
  assert.match(checklist, /useState<number\[\]>\(\[\]\)/);
  assert.match(checklist, /type="checkbox"/);
  assert.match(checklist, /aria-label="Postęp checklisty"/);
  assert.match(checklist, /aria-live="polite"/);
  assert.match(checklist, /setChecked\(\[\]\)/);
  assert.match(checklist, /min-h-12/);
});

test("budget calculator never claims current merchant prices or invented discounts", () => {
  assert.match(detail, /<GuideBudgetPlanner limit=\{budgetLimit\}/);
  assert.match(detail, /budgetLimit === 100 \|\| budgetLimit === 150/);
  assert.match(planner, /limit: 100 \| 150/);
  assert.match(planner, /inputMode="decimal"/);
  assert.match(planner, /Number\.isFinite/);
  assert.match(planner, /Pierwszy produkt/);
  assert.match(planner, /Drugi produkt/);
  assert.match(planner, /Dostawa/);
  assert.match(planner, /nie są to automatycznie pobrane ani zweryfikowane ceny SHEIN/);
  assert.match(planner, /W budżecie/);
  assert.match(planner, /Ponad limit/);
});

test("SEO includes canonical, metadata, social preview and crawlable editorial details", () => {
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /getGuideBySlug\(slug\)/);
  assert.match(detail, /if \(!guide\) notFound\(\)/);
  assert.match(detail, /canonical: "\/poradniki\/" \+ guide\.slug/);
  assert.match(detail, /"BreadcrumbList"/);
  assert.match(detail, /"Article"/);
  assert.match(detail, /articleSection: guide\.category/);
  assert.match(detail, /abstract: guide\.quickAnswer/);
  assert.match(detail, /"@type": "CollectionPage"/);
  assert.match(detail, /publisher: \{ "@type": "Organization"/);
  assert.match(detail, /twitter: \{ card: "summary_large_image"/);
  assert.match(sitemap, /STYLE_GUIDES\.map\(\(guide\) =>/);
  assert.doesNotMatch(detail, /FAQPage|AggregateRating|ratingValue|datePublished/);
});

test("editorials have internal links and show related outfits only when available", () => {
  assert.match(detail, /look\.available && guide\.relatedLookSlugs\.includes\(look\.slug\)/);
  assert.match(detail, /formatPrice\(look\.total\)/);
  assert.match(detail, /relatedGuides\.map/);
  assert.match(detail, /href=\{"\/poradniki\/" \+ related\.slug\}/);
  assert.match(detail, /"\/stylizacje\/" \+ look\.slug/);
  assert.match(detail, /href="\/afiliacja"/);
  assert.match(detail, /Bez fizycznych testów produktów/);
  assert.match(index, /Przed zakupem porównaj aktualną/);
  assert.doesNotMatch(detail, /href=\{product\.affiliateUrl\}/);
});

test("new components are closed and do not inject hidden click handlers", () => {
  for (const source of [index, detail, finder, checklist, planner]) {
    assert.doesNotMatch(source, /^<<<<<<< /m);
    assert.doesNotMatch(source, /className="[^"\n>]*>/);
  }
});
