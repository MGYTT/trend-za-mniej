import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { preparePromotionDraft } from "../lib/promotion-draft-assistant.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const outfit = read("../components/admin/AdminOutfitStudio.tsx");
const coupon = read("../components/admin/AdminCouponStudio.tsx");
const shein = read("../components/admin/AdminSheinCampaignStudio.tsx");
const seo = read("../components/admin/PromotionSeoPreview.tsx");

test("mobile outfit card titles get a full-width row separate from actions", () => {
  assert.match(outfit, /grid min-w-0 w-full grid-cols-1 gap-3/);
  assert.match(outfit, /sm:grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.match(outfit, /\[overflow-wrap:normal\] \[word-break:normal\]/);
  assert.match(outfit, /flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end/);
  assert.match(outfit, /min-w-0 w-full space-y-4/);
  assert.match(outfit, /w-full grid-cols-1 items-start/);
});

test("merchant draft picks only explicitly supplied code and expiry, never verifies offer", () => {
  const draft = preparePromotionDraft({
    channel: "merchant", storeName: "Example Shop", code: "",
    rawText: "Kod: JESIEN20. Kod rabatowy 20% w koszyku na swetry. Ważny do 2026-11-30.",
  });
  assert.equal(draft.code, "JESIEN20");
  assert.equal(draft.offerType, "coupon");
  assert.equal(draft.validUntil, "2026-11-30");
  assert.match(draft.title, /JESIEN20/);
  assert.match(draft.description, /20%/);
  assert.ok(draft.keywords.length > 0);
  assert.ok(draft.seoDescription.length <= 155);
  assert.ok(draft.seoTitle.length <= 65);
  assert.ok(draft.warnings.some((warning) => warning.includes("Wysokość rabatu")));
  assert.ok(!("verified" in draft));
  assert.ok(!("published" in draft));
});

test("SHEIN search campaigns stay campaigns even when raw text says coupon", () => {
  const draft = preparePromotionDraft({
    channel: "shein", storeName: "SHEIN", code: "",
    rawText: "Kod: SBNSL5D. Kupon rabatowy 60% dla nowych użytkowników. Wyszukaj kod w aplikacji.",
  });
  assert.equal(draft.code, "SBNSL5D");
  assert.equal(draft.offerType, "campaign");
  assert.equal(draft.category, "new-users");
  assert.equal(draft.validUntil, null);
  assert.match(draft.note, /nie gwarantuje rabatu/);
  assert.ok(draft.warnings.some((warning) => warning.includes("Kupon do koszyka")));
});

test("ambiguous code is not silently published as verified coupon", () => {
  const draft = preparePromotionDraft({
    channel: "merchant", storeName: "Sklep", code: "TEST123",
    rawText: "Nowości w sklepie. Sprawdź nasze wybrane oferty sezonowe.",
    requestedType: "coupon",
  });
  assert.equal(draft.offerType, "campaign");
  assert.equal(draft.validUntil, null);
  assert.ok(draft.warnings.some((warning) => warning.includes("daty")));
});

test("admin editors offer explicit draft button, SEO review and unchanged verified publishing guard", () => {
  for (const source of [coupon, shein]) {
    assert.match(source, /preparePromotionDraft\(/);
    assert.match(source, /<PromotionSeoPreview draft=\{seoDraft\} \/>/);
    assert.match(source, /sourceDescription/);
    assert.match(source, /fillFromSource/);
    assert.match(source, /published: false/);
    assert.match(source, /void save\(false\)/);
    assert.match(source, /void save\(true\)/);
  }
  assert.match(coupon, /verified: false/);
  assert.match(coupon, /!form\.verified/);
  assert.match(coupon, /Sprawdziłem kod, zasady promocji/);
  assert.match(shein, /codeKind: "campaign"/);
  assert.match(shein, /Link i działanie kodu wymagają sprawdzenia/);
  assert.match(seo, /nie osobne tagi meta/);
  assert.match(seo, /bez sprawdzania oferty na żywo/);
});
