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
  const origin = params.get("origin");
  if (origin === "product") {
    return { sourceType: "product", outfitSlug: null };
  }

  if (origin === "outfit") {
    const slug = params.get("look");
    if (
      slug &&
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

  return { sourceType: "unknown", outfitSlug: null };
}
