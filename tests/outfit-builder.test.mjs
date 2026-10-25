import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { recommendedBudget, validateOutfitInput } from "../lib/outfit-builder.ts";

const load = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const admin = load("../app/admin/stylizacje/page.tsx");
const studio = load("../components/admin/AdminOutfitStudio.tsx");
const api = load("../app/api/admin/outfits/route.ts");
const managed = load("../lib/editorial-outfits.ts");
const resolver = load("../lib/stylizacje.ts");
const listing = load("../app/stylizacje/page.tsx");
const detail = load("../app/stylizacje/[slug]/page.tsx");
const sitemap = load("../app/sitemap.ts");
const home = load("../app/page.tsx");
const menu = load("../components/admin/AdminAppShell.tsx");

const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const catalog = [
  { id: a, active: true, price: "49.99" },
  { id: b, active: true, price: "50.01" },
];
const valid = {
  slug: "moj-nowy-look", title: "Mój nowy zestaw na co dzień",
  occasion: "Na co dzień", style: "Minimalizm",
  intro: "Zestaw prostych ubrań do łączenia na co dzień, z neutralnymi dodatkami.",
  tip: "Sprawdź rozmiary w sklepie oraz długość nogawek przed zakupem.",
  excluded: "Buty, torba i koszt dostawy nie są wliczone.",
  whyItWorks: [
    "Kolory elementów tworzą spójne zestawienie.",
    "Fasony można nosić także z własną garderobą.",
  ],
  productIds: [a,b], published: true,
};
const result = (input, options = catalog) => validateOutfitInput(input, options);

test("auto budget uses exact cents and supported 100, 150, 200 steps", () => {
  assert.equal(recommendedBudget(99.99), 100);
  assert.equal(recommendedBudget(100), 100);
  assert.equal(recommendedBudget(100.01), 150);
  assert.equal(recommendedBudget(150.01), 200);
  assert.equal(recommendedBudget(200.01), 250);
  assert.equal(recommendedBudget(1000.01), 0);
  assert.equal(recommendedBudget(Number.NaN), 0);
});

test("server recalculates total from catalog, not from browser payload", () => {
  const checked = result({ ...valid, total: 1, maxBudget: 1 });
  assert.ok("value" in checked);
  assert.equal(checked.value.total, 100);
  assert.equal(checked.value.maxBudget, 100);
  assert.deepEqual(checked.value.productIds, [a,b]);
});

test("server rejects duplicate, missing or inactive products", () => {
  assert.ok("error" in result({ ...valid, productIds: [a,a] }));
  assert.ok("error" in result({ ...valid, productIds: [a,"00000000-0000-4000-8000-000000000003"] }));
  assert.ok("error" in result(valid, [{...catalog[0], active: false},catalog[1]]));
  assert.ok("error" in result(valid, [{...catalog[0], price: Number.NaN},catalog[1]]));
});

test("server rejects unsafe slugs, invalid descriptions and client published coercion", () => {
  assert.ok("error" in result({ ...valid, slug: "../../admin" }));
  assert.ok("error" in result({ ...valid, intro: "Za krótki opis" }));
  assert.ok("error" in result({ ...valid, published: "true" }));
  assert.ok("error" in result({ ...valid, whyItWorks: ["za krótko","też krótko"] }));
});

test("owner-only API checks session and role for every write with RLS and CSRF guard", () => {
  assert.match(api, /supabase\.auth\.getClaims\(\)/);
  assert.match(api, /admin\?\.role !== "owner"/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /createClient\(\)/);
  assert.match(api, /validateOutfitInput\(body, products\)/);
  assert.match(api, /LOOKS\.some\(\(look\) => look\.slug === outfit\.slug\)/);
  assert.match(api, /revalidatePath\("\/stylizacje"\)/);
  assert.doesNotMatch(api, /service_role|createAdminClient/);
  assert.match(api, /export async function POST/);
  assert.match(api, /export async function PATCH/);
  assert.match(api, /export async function DELETE/);
});

test("admin page is private and owner-gated while preserving legacy looks", () => {
  assert.match(admin, /supabase\.auth\.getClaims\(\)/);
  assert.match(admin, /admin\.role !== "owner"/);
  assert.match(admin, /force-dynamic/);
  assert.match(admin, /legacyCount=\{LOOKS\.length\}/);
  assert.match(admin, /from\("editorial_outfits"\)/);
  assert.match(menu, /href="\/admin\/stylizacje"/);
});

test("studio supports product selection, previews, drafts and publishing", () => {
  assert.match(studio, /const \[form, setForm\] = useState/);
  assert.match(studio, /recommendedBudget\(total\)/);
  assert.match(studio, /selected\.slice\(0, 2\)/);
  assert.match(studio, /<ProductPhoto/);
  assert.match(studio, /fetch\("\/api\/admin\/outfits"/);
  assert.match(studio, /void save\(false\)/);
  assert.match(studio, /void save\(true\)/);
  assert.match(studio, /router\.refresh\(\)/);
});

test("public site adds published complete outfits without losing editorial legacy", () => {
  assert.match(managed, /\.eq\("published", true\)/);
  assert.match(managed, /resolveLooks\(products, \[\.\.\.LOOKS,/);
  assert.match(managed, /amountCents > Math\.round\(maxBudget \* 100\)/);
  assert.match(resolver, /definitions: readonly LookConfig\[\] = LOOKS/);
  assert.match(listing, /getAllResolvedLooks/);
  assert.match(detail, /getAllResolvedLooks/);
  assert.match(sitemap, /getAllResolvedLooks/);
  assert.match(home, /getAllResolvedLooks/);
});

test("public affiliate click attribution remains intact", () => {
  assert.match(detail, /origin=outfit&look=/);
  assert.match(detail, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(detail, /LOOKS\.map\(\(look\) => \(\{ slug: look\.slug \}\)\)/);
});

test("all new JSX class names remain quoted", () => {
  for (const body of [admin, studio]) assert.doesNotMatch(body, /className="[^"\n>]*>/);
});
