import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOOKS, resolveLooks } from "../lib/stylizacje.ts";
import { STYLE_GUIDES, getGuidesForLook } from "../lib/poradniki.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const explorer = read("../components/OutfitExplorer.tsx");
const listing = read("../app/stylizacje/page.tsx");
const detail = read("../app/stylizacje/[slug]/page.tsx");
const sitemap = read("../app/sitemap.ts");

const additions = new Map([
  ["minimalizm-bez-i-czern-do-100-zl", [["bezowy-dzianinowy-top-damski",37.17],["czarne-spodnie-damskie-z-szerokimi-nogawkami",27.93]]],
  ["wygodny-luz-do-100-zl", [["biala-bluza-damska-z-kapturem-attitoon",37],["spodnie-do-jogi-z-szerokimi-nogawkami",29.70]]],
  ["dzianina-i-denim-do-150-zl", [["jednokolorowy-casualowy-sweter-pullover",43.45],["damskie-zwezane-jeansy",72.60]]],
  ["smart-casual-koszula-do-150-zl", [["inawly-koszula-damska-casualowa-w-jednolitym-kolorze",28.05],["damskie-eleganckie-casualowe-spodnie",77.10]]],
  ["czarna-mini-i-botki-do-200-zl", [["damska-elegancka-mini-sukienka",73.22],["modne-wygodne-casualowe-damskie-botki-za-kostke",90.74]]],
]);

test("five existing URLs retained and five new URLs are unique", () => {
  const old = ["casual-do-150-zl","do-pracy-do-150-zl","weekend-do-150-zl",
    "jesienny-look-do-200-zl","streetwear-do-100-zl"];
  assert.equal(LOOKS.length, 10);
  assert.equal(new Set(LOOKS.map((l)=>l.slug)).size,10);
  for (const slug of old) assert.ok(LOOKS.some((l)=>l.slug===slug));
  for (const slug of additions.keys()) assert.ok(LOOKS.some((l)=>l.slug===slug));
});

test("new looks use distinct real catalog products and coherent budgets", () => {
  const priceMap = new Map([...additions.values()].flat().map(([slug,price])=>[slug,price]));
  const products = [...priceMap].map(([slug,price],i)=>({id:"new-"+i,slug,price,active:true}));
  const resolved = resolveLooks(products);
  for(const [slug,items] of additions) {
    const look=LOOKS.find((x)=>x.slug===slug);
    assert.ok(look,slug);
    assert.deepEqual(look.productSlugs,items.map(([id])=>id));
    assert.equal(new Set(look.productSlugs).size,2);
    const priceCents=items.reduce((sum,[,price])=>sum+Math.round(price*100),0);
    const current=resolved.find(x=>x.slug===slug);
    assert.equal(Math.round(current.total*100),priceCents);
    assert.ok(current.available);
    assert.ok(priceCents<=Math.round(look.maxBudget*100));
    assert.ok(look.intro.length>=120,slug);
    assert.equal(look.whyItWorks.length,2);
    assert.ok(look.tip.length>=110);
    assert.ok(look.excluded.length>=60);
  }
});

test("every look has its own combination and original editorial notes", () => {
  const combos=LOOKS.map(x=>[...x.productSlugs].sort().join("|"));
  assert.equal(new Set(combos).size,LOOKS.length);
  for(const look of LOOKS) {
    assert.equal(look.whyItWorks.length,2);
    assert.ok(look.whyItWorks.every(x=>x.length>=35));
    assert.match(look.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("guide budgets and outfit links stay consistent", () => {
  for(const guide of STYLE_GUIDES) {
    const limit=/do-(100|150)-zl/.exec(guide.slug);
    for(const slug of guide.relatedLookSlugs) {
      const look=LOOKS.find(l=>l.slug===slug);
      assert.ok(look,slug);
      if(limit) assert.ok(look.maxBudget<=Number(limit[1]));
      assert.ok(getGuidesForLook(slug).some(x=>x.slug===guide.slug));
    }
  }
});

test("one clear expansion action, filters expose all matching outfits", () => {
  assert.match(explorer,/const INITIAL_OUTFITS = 6/);
  assert.match(explorer,/visible\.slice\(0, INITIAL_OUTFITS\)/);
  assert.match(explorer,/const showAll = isFiltered \|\| sort !== "editorial" \|\| expanded/);
  assert.match(explorer,/Pokaż pozostałe \{visible\.length - INITIAL_OUTFITS\} stylizacje/);
  assert.match(explorer,/setExpanded\(true\)/);
  assert.match(explorer,/setExpanded\(false\)/);
  assert.match(explorer,/aria-live="polite"/);
  assert.doesNotMatch(explorer,/window\.location|pushState/);
});

test("all generated routes keep sponsored tracking, budgets and truthful catalog notices", () => {
  assert.match(listing,/filter\(\(look\) => look\.available\)/);
  assert.match(detail,/LOOKS\.map\(\(look\) => \(\{ slug: look\.slug \}\)\)/);
  assert.match(detail,/if \(!look\) notFound\(\)/);
  assert.match(detail,/origin=outfit&look=/);
  assert.match(detail,/rel="sponsored nofollow noopener noreferrer"/);
  assert.match(detail,/Zapisane ceny|Cena zapisana przy publikacji/);
  assert.match(detail,/Nie ma jednego wspólnego koszyka/);
  assert.match(sitemap,/lookPages/);
});

test("other looks prioritize same occasion while keeping only 3 alternatives", () => {
  assert.match(detail,/Number\(b\.occasion === look\.occasion\)/);
  assert.match(detail,/Math\.abs\(a\.total - look\.total\)/);
  assert.match(detail,/\.slice\(0, 3\)/);
});
