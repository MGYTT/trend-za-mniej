import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const create = read("../app/admin/nowa-oferta/page.tsx");
const edit = read("../app/admin/edytuj/[id]/page.tsx");
const navigator = read("../components/admin/AdminDesktopFormNavigator.tsx");
const shared = read("../components/admin/AdminFormShell.tsx");
const preview = read("../components/admin/ProductPreview.tsx");
const css = read("../app/globals.css");
const shell = read("../components/admin/AdminAppShell.tsx");

test("both forms share a four-step desktop navigator", () => {
  for (const page of [create, edit]) {
    assert.match(page, /import AdminDesktopFormNavigator/);
    assert.match(page, /<AdminDesktopFormNavigator/);
    assert.match(page, /hidden min-w-0 xl:block/);
    assert.match(page, /xl:grid-cols-\[minmax\(0,1fr\)_340px\]/);
    assert.match(page, /2xl:grid-cols-\[minmax\(0,1fr\)_390px\]/);
  }
  assert.match(navigator, /steps\.map\(\(step, index\) =>/);
  assert.match(navigator, /href=\{"#" \+ step\.id\}/);
  assert.match(navigator, /aria-label="Przejdź do sekcji formularza"/);
});

test("new product navigator uses real readiness flags, not fabricated indicators", () => {
  assert.match(create, /mode="create"/);
  assert.match(create, /formId="new-product-form"/);
  for (const [id, flag] of [
    ["section-basic", "basicComplete"],
    ["section-price", "priceComplete"],
    ["section-image", "imageComplete"],
    ["section-link", "linkComplete"],
  ]) {
    assert.ok(create.includes(`{ id: "${id}", title:`));
    assert.ok(create.includes(`complete: ${flag}`));
  }
  assert.match(create, /disabled=\{duplicateCheck\.status === "blocked"\}/);
  assert.match(navigator, /role="progressbar"/);
  assert.match(navigator, /aria-valuenow=\{percent\}/);
});

test("edit steps show genuinely changed sections and link to existing targets", () => {
  assert.match(edit, /mode="edit"/);
  assert.match(edit, /formId="edit-product-form"/);
  for (const [id, flag] of [
    ["edit-section-basic", "basic"],
    ["edit-section-price", "price"],
    ["edit-section-image", "image"],
    ["edit-section-link", "publication"],
  ]) {
    assert.ok(edit.includes(`id="${id}"`));
    assert.ok(edit.includes(`complete: changedSections.${flag}`));
  }
  assert.match(edit, /<section id=\{id\}/);
  assert.match(edit, /disabled=\{!hasChanges\}/);
  assert.match(edit, /resetChanges/);
});

test("sticky desktop action submits the same form, preserving existing validation", () => {
  assert.match(navigator, /type="submit" form=\{formId\}/);
  assert.match(navigator, /disabled=\{busy \|\| disabled\}/);
  assert.match(create, /id="new-product-form"/);
  assert.match(create, /onSubmit=\{\s*handleSubmit/);
  assert.match(edit, /id="edit-product-form"/);
  assert.match(edit, /onSubmit=\{\s*handleSubmit/);
  assert.match(create, /<PublishConfirmation/);
  assert.match(create, /duplicateCheck\s*\.status ===\s*"blocked"/);
  assert.match(edit, /!hasChanges/);
});

test("original tablet and mobile actions remain available, without desktop duplicates", () => {
  for (const page of [create, edit]) {
    assert.match(page, /fixed inset-x-0 bottom-0 z-\[70\]/);
    assert.match(page, /backdrop-blur-xl lg:hidden/);
    assert.match(page, /lg:block xl:hidden/);
    assert.match(page, /xl:hidden/);
    assert.match(page, /<MobilePreview/);
  }
  assert.match(shell, /!immersiveRoute && \(/);
});

test("the desktop preview and quality checks remain in their own scrollable rail", () => {
  for (const page of [create, edit]) {
    assert.match(page, /admin-desktop-editor-sidebar sticky top-20 space-y-4 overflow-y-auto/);
    assert.match(page, /<ProductPreview/);
    assert.match(page, /<OfferQualityChecks/);
  }
  assert.match(css, /\.admin-desktop-editor-sidebar \{/);
  assert.match(css, /max-height: calc\(100dvh - 104px\)/);
  assert.match(css, /overscroll-behavior-y: contain/);
  assert.match(preview, /To tylko podgląd/);
});

test("desktop forms get a larger but bounded workspace", () => {
  assert.match(shared, /xl:max-w-\[1440px\]/);
  assert.match(shared, /xl:rounded-\[26px\]/);
  assert.match(shared, /xl:bg-white/);
  assert.match(css, /@media \(min-width: 1280px\)/);
  assert.match(navigator, /hidden overflow-hidden.*xl:block/);
});

test("affiliate disclosures, ownership, upload and conflict checks are preserved", () => {
  assert.match(create, /createDuplicateCandidate/);
  assert.match(create, /findSimilarProducts/);
  assert.match(create, /publishProduct/);
  assert.match(edit, /\.from\(\s*"products"\s*\)/);
  assert.match(create, /MAX_FILE_SIZE/);
  assert.match(edit, /MAX_FILE_SIZE/);
  assert.match(create, /createClient/);
  assert.match(edit, /createClient/);
});

test("JSX class attributes and navigation tags remain well formed", () => {
  for (const file of [create, edit, navigator, shared]) {
    assert.doesNotMatch(file, /className="[^"\n>]*>/);
  }
  assert.equal((navigator.match(/<a key=/g) ?? []).length, 1);
});
