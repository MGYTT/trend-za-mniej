/**
 * Privacy-respecting attribution of an external affiliate click.
 *
 * Only known, curated outfits containing the clicked product may claim the
 * "outfit" source. Arbitrary query parameters are discarded.
 * This is directional analytics, not proof of purchase.
 */
export type ClickAttribution = {
  sourceType: "outfit" | "product" | "unknown";
  outfitSlug: string | null;
};

export type OutfitDefinition = {
  slug: string;
  productSlugs: readonly string[];
};

export function resolveClickAttribution(
  params: URLSearchParams,
  productSlug: string,
  outfits: readonly OutfitDefinition[]
): ClickAttribution {
  const unknown: ClickAttribution = {
    sourceType: "unknown",
    outfitSlug: null,
  };

  // Ambiguous parameters must not be counted as reliable attribution.
  const origins = params.getAll("origin");
  if (origins.length !== 1) return unknown;

  const lookSlugs = params.getAll("look");
  if (origins[0] === "product") {
    return lookSlugs.length === 0
      ? { sourceType: "product", outfitSlug: null }
      : unknown;
  }

  if (origins[0] === "outfit" && lookSlugs.length === 1) {
    const slug = lookSlugs[0];
    if (
      slug.length <= 100 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
      outfits.some(
        (outfit) =>
          outfit.slug === slug &&
          outfit.productSlugs.includes(productSlug)
      )
    ) {
      return { sourceType: "outfit", outfitSlug: slug };
    }
  }

  return unknown;
}
