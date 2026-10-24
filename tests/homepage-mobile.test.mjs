import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../components/HomeLanding.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/SiteFooter.tsx", import.meta.url), "utf8");
const bottomNav = readFileSync(new URL("../components/MobileBottomNav.tsx", import.meta.url), "utf8");

test("mobile sections and shell use safe horizontal margins", () => {
  assert.equal((home.match(/max-w-7xl px-6 py-12 sm:px-8/g) ?? []).length, 7);
  assert.match(home, /gap-9 px-6 pb-12 pt-11/);
  assert.match(header, /gap-2 px-5 sm:px-6/);
  assert.match(footer, /max-w-7xl px-6 py-10/);
  assert.match(bottomNav, /grid-cols-4 gap-1 px-2\.5 pt-1\.5/);
  assert.doesNotMatch(home, /max-w-7xl px-4/);
});

test("hero text, action targets and search adapt to narrow mobile screens", () => {
  assert.match(home, /text-\[clamp\(2\.25rem,8\.2vw,5\.5rem\)\]/);
  assert.match(home, /min-\[480px\]:flex/);
  assert.match(home, /min-h-12 w-full items-center/);
  assert.match(home, /px-2 text-base sm:px-3/);
  assert.match(home, /min-\[440px\]:flex-row/);
});

test("mobile product cards use a compact row below 380px", () => {
  assert.match(home, /grid-cols-1 gap-3 min-\[380px\]:grid-cols-2/);
  assert.match(home, /flex-row min-\[380px\]:flex-col/);
  assert.match(home, /min-\[380px\]:aspect-\[4\/5\]/);
});

test("section landmarks reference real headings", () => {
  const labelledBy = [...home.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
  const literalIds = [...home.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const componentIds = [...home.matchAll(/<SectionHeading id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(componentIds.length, 6);
  assert.ok(home.includes("<h2 id={id}"));
  for (const id of labelledBy) assert.ok(literalIds.includes(id) || componentIds.includes(id), id);
});

test("responsive markup retains matching JSX attribute quotes", () => {
  assert.doesNotMatch(home, /className="[^"\n>]*>/);
});
