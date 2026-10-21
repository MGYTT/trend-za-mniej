import test from "node:test";
import assert from "node:assert/strict";
import { resolveClickAttribution } from "../lib/affiliate-attribution.ts";

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
