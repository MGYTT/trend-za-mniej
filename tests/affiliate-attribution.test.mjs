import test from "node:test";
import assert from "node:assert/strict";
import { resolveClickAttribution } from "../lib/affiliate-attribution.ts";
import { LOOKS } from "../lib/stylizacje.ts";

const outfits = [
  { slug: "streetwear-do-100-zl", productSlugs: ["sweter", "jeansy"] },
  { slug: "casual-do-150-zl", productSlugs: ["top", "spodnie"] },
];

test("Prawidłowe kliknięcie zapisuje konkretną stylizację", () => {
  assert.deepEqual(
    resolveClickAttribution(new URLSearchParams("origin=outfit&look=streetwear-do-100-zl"), "jeansy", outfits),
    { sourceType: "outfit", outfitSlug: "streetwear-do-100-zl" }
  );
});
test("Nie można przypisać innego produktu do obcej stylizacji", () => {
  assert.deepEqual(
    resolveClickAttribution(new URLSearchParams("origin=outfit&look=streetwear-do-100-zl"), "top", outfits),
    { sourceType: "unknown", outfitSlug: null }
  );
});
test("Nieznany lub wadliwy slug zostaje odrzucony", () => {
  for (const look of ["fake", "../danger", "", "streetwear-do-100-zl%0A"]) {
    assert.equal(
      resolveClickAttribution(new URLSearchParams({origin: "outfit", look}), "jeansy", outfits).sourceType,
      "unknown"
    );
  }
});
test("Kliknięcie z karty produktu ma osobne źródło", () => {
  assert.deepEqual(
    resolveClickAttribution(new URLSearchParams("origin=product"), "jeansy", outfits),
    { sourceType: "product", outfitSlug: null }
  );
});
test("Dotychczasowe linki bez parametrów zachowują źródło unknown", () => {
  assert.deepEqual(
    resolveClickAttribution(new URLSearchParams(), "jeansy", outfits),
    { sourceType: "unknown", outfitSlug: null }
  );
});

test("repeated origin or look parameters cannot claim an attribution source", () => {
  for (const query of [
    "origin=product&origin=outfit",
    "origin=product&look=streetwear-do-100-zl",
    "origin=outfit&look=streetwear-do-100-zl&look=casual-do-150-zl",
    "origin=outfit&origin=outfit&look=streetwear-do-100-zl",
  ]) {
    assert.deepEqual(
      resolveClickAttribution(new URLSearchParams(query), "jeansy", outfits),
      { sourceType: "unknown", outfitSlug: null },
      query
    );
  }
});

test("every published outfit configuration attributes all its actual products", () => {
  assert.equal(LOOKS.length, 5);
  for (const look of LOOKS) {
    for (const productSlug of look.productSlugs) {
      assert.deepEqual(
        resolveClickAttribution(
          new URLSearchParams({ origin: "outfit", look: look.slug }),
          productSlug,
          LOOKS
        ),
        { sourceType: "outfit", outfitSlug: look.slug },
        `${look.slug} / ${productSlug}`
      );
    }
  }
});

test("outfits do not claim catalog products absent from their composition", () => {
  for (const look of LOOKS) {
    assert.deepEqual(
      resolveClickAttribution(
        new URLSearchParams({ origin: "outfit", look: look.slug }),
        "non-existing-product-slug",
        LOOKS
      ),
      { sourceType: "unknown", outfitSlug: null }
    );
  }
});
