/**
 * Click counts are not orders or unique visitors.
 * Summaries only use server-provided aggregated rows.
 */
export type SourceStatRow = {
  source_type: string;
  outfit_slug: string | null;
  clicks: number | string;
};

export type OutfitClickRow = { slug: string; clicks: number };

export function summarizeAffiliateSources(rows: readonly SourceStatRow[]) {
  let outfitClicks = 0;
  let productClicks = 0;
  let unknownClicks = 0;
  const countsByOutfit = new Map<string, number>();

  for (const row of rows) {
    const numeric = Number(row.clicks);
    if (!Number.isFinite(numeric) || numeric < 0) continue;
    const count = Math.trunc(numeric);

    if (row.source_type === "outfit" && row.outfit_slug) {
      outfitClicks += count;
      countsByOutfit.set(
        row.outfit_slug,
        (countsByOutfit.get(row.outfit_slug) ?? 0) + count
      );
    } else if (row.source_type === "product") {
      productClicks += count;
    } else {
      unknownClicks += count;
    }
  }

  const knownClicks = outfitClicks + productClicks;
  return {
    outfitClicks,
    productClicks,
    unknownClicks,
    knownClicks,
    outfitShareOfKnown:
      knownClicks > 0 ? Math.round((outfitClicks / knownClicks) * 100) : 0,
    outfitRanking: Array.from(countsByOutfit, ([slug, clicks]) => ({
      slug,
      clicks,
    })).sort((a, b) => b.clicks - a.clicks || a.slug.localeCompare(b.slug)),
  };
}
