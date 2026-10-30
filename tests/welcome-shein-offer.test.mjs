import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const home = read("../app/page.tsx");
const welcome = read("../components/WelcomeSheinOffer.tsx");
const card = read("../components/WelcomeSheinOfferCard.tsx");
const defaults = read("../lib/welcome-shein-settings.ts");
const publicSettings = read("../lib/welcome-shein-public.ts");
const globals = read("../app/globals.css");

test("the home page renders the offer only when publicly enabled, not on other routes", () => {
  assert.match(home, /import WelcomeSheinOffer from "@\/components\/WelcomeSheinOffer";/);
  assert.match(home, /getPublicWelcomeSheinOffer/);
  assert.match(home, /<HomeLanding looks=\{looks\} products=\{selectedProducts\} \/>/);
  assert.match(home, /\{welcomeOffer && <WelcomeSheinOffer settings=\{welcomeOffer\} \/>\}/);
  assert.match(publicSettings, /\.eq\("enabled", true\)/);
  assert.match(welcome, /^"use client";/);
});

test("offer stays delayed and dismissible, and visit version changes only on explicit reset", () => {
  assert.doesNotMatch(welcome, /localStorage|sessionStorage/);
  assert.match(welcome, /shownInThisTab/);
  assert.match(welcome, /window\.setTimeout\(\(\) => \{/);
  assert.match(welcome, /SHOW_AFTER_MS = settings\.delaySeconds \* 1000/);
  assert.match(publicSettings, /SHEIN_WELCOME_VERIFIED/);
  assert.match(welcome, /window\.clearTimeout\(timer\)/);
  assert.match(welcome, /aria-modal="false"/);
  assert.match(welcome, /max-h-\[min\(80dvh,680px\)\]/);
  assert.match(card, /Zamknij ofertę powitalną/);
  assert.match(welcome, /event\.key === "Escape"/);
  assert.match(globals, /@keyframes welcomeFadeIn/);
  assert.doesNotMatch(welcome, /fixed inset-0.*bg-(?:black|stone)/);
});

test("original user-supplied campaign is unchanged and affiliate disclosure cannot be removed by admin", () => {
  assert.match(defaults, /campaignCode: "SBNSL5D"/);
  assert.match(defaults, /affiliateUrl: "https:\/\/onelink\.shein\.com\/58\/66hx4q3nwzrl"/);
  assert.match(defaults, /discountPercent: 60/);
  assert.match(defaults, /kwalifikujących się nowych użytkowników/);
  assert.match(defaults, /Wysokość zniżki, kwalifikacja konta i pozostałe warunki zależą od SHEIN/);
  assert.match(defaults, /nie gwarantuje rabatu w koszyku/);
  assert.match(card, /WELCOME_AFFILIATE_DISCLOSURE/);
  assert.match(card, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(card, /target="_blank"/);
  assert.match(card, /settings\.affiliateUrl/);
  assert.doesNotMatch(card, /gwarantowany kupon|100% działające kody/i);
});

test("copy button uses live campaign code, and admin preview never opens an outbound link", () => {
  assert.match(welcome, /navigator\.clipboard\.writeText\(settings\.campaignCode\)/);
  assert.match(welcome, /document\.execCommand\("copy"\)/);
  assert.match(card, /disabled=\{preview\}/);
  assert.match(card, /settings\.dismissLabel/);
  assert.match(card, /settings\.campaignCode/);
  assert.match(card, /settings\.discountPercent/);
  assert.match(card, /settings\.headline/);
  assert.match(card, /settings\.ctaLabel/);
});
