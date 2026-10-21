/**
 * Small, serializable outfit preview model.
 * No affiliate URLs or admin-only data is sent to the client.
 */
export type OutfitPreview = {
  slug: string;
  title: string;
  occasion: string;
  style: string;
  intro: string;
  total: number;
  maxBudget: number;
  productCount: number;
  photos: { id: string; image: string; alt: string }[];
};

export type OutfitFilters = {
  maxPrice: number | null;
  occasion: string | null;
};

export function filterOutfits(
  outfits: readonly OutfitPreview[],
  filters: OutfitFilters
): OutfitPreview[] {
  const maxCents =
    filters.maxPrice !== null && Number.isFinite(filters.maxPrice) && filters.maxPrice >= 0
      ? Math.round(filters.maxPrice * 100)
      : null;
  const occasion = filters.occasion?.trim() || null;

  return outfits.filter((outfit) => {
    if (!Number.isFinite(outfit.total) || outfit.total < 0) return false;
    if (maxCents !== null && Math.round(outfit.total * 100) > maxCents) return false;
    if (occasion !== null && outfit.occasion !== occasion) return false;
    return true;
  });
}

export function availableBudgets(outfits: readonly OutfitPreview[]): number[] {
  return [...new Set(outfits.map((outfit) => outfit.maxBudget))]
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
}

export function availableOccasions(outfits: readonly OutfitPreview[]): string[] {
  return [...new Set(outfits.map((outfit) => outfit.occasion.trim()))]
    .filter(Boolean);
}
