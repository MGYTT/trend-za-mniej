import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const home = read("../app/page.tsx");
const welcome = read("../components/WelcomeSheinOffer.tsx");
const globals = read("../app/globals.css");

test("home-only welcome offer is mounted without changing homepage editorial content", () => {
  assert.match(home, /import WelcomeSheinOffer from "@\/components\/WelcomeSheinOffer";/);
  assert.match(home, /<HomeLanding looks=\{looks\} products=\{selectedProducts\} \/>/);
  assert.match(home, /<WelcomeSheinOffer \/>/);
  assert.match(welcome, /^"use client";/);
});

test("offer opens once per browser, not as an immediate SEO-obscuring interstitial", () => {
  assert.match(welcome, /window\.localStorage\.getItem\(VISIT_KEY\)/);
  assert.match(welcome, /window\.localStorage\.setItem\(VISIT_KEY, "seen"\)/);
  assert.match(welcome, /window\.setTimeout\(\(\) => \{/);
  assert.match(welcome, /SHOW_AFTER_MS = 10_000/);
  assert.match(welcome, /window\.clearTimeout\(timer\)/);
  assert.match(welcome, /aria-modal="false"/);
  assert.doesNotMatch(welcome, /fixed inset-0.*bg-(?:black|stone)/);
  assert.match(welcome, /max-h-\[min\(80dvh,680px\)\]/);
  assert.match(welcome, /Zamknij ofertę powitalną/);
  assert.match(welcome, /event\.key === "Escape"/);
  assert.match(globals, /@keyframes welcomeFadeIn/);
});

test("promotion uses only user supplied code and affiliate URL, with truthful disclosures", () => {
  assert.match(welcome, /const CAMPAIGN_CODE = "SBNSL5D";/);
  assert.match(welcome, /const CAMPAIGN_URL = "https:\/\/onelink\.shein\.com\/58\/66hx4q3nwzrl";/);
  assert.match(welcome, /Do/);
  assert.match(welcome, /60%/);
  assert.match(welcome, /kwalifikujących się nowych użytkowników/);
  assert.match(welcome, /Wysokość zniżki, kwalifikacja konta i pozostałe warunki zależą od SHEIN/);
  assert.match(welcome, /nie gwarantuje rabatu w koszyku/);
  assert.match(welcome, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(welcome, /target="_blank"/);
  assert.doesNotMatch(welcome, /zweryfikowan(?:a|y)\s+kupon|gwarantowan(?:y|a)\s+rabat/);
});

test("visitor can copy campaign code or dismiss without navigating away", () => {
  assert.match(welcome, /navigator\.clipboard\.writeText\(CAMPAIGN_CODE\)/);
  assert.match(welcome, /document\.execCommand\("copy"\)/);
  assert.match(welcome, /setOpen\(false\)/);
  assert.match(welcome, /Nie teraz, przeglądaj stylizacje/);
});
