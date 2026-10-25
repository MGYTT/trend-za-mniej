import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";
import { LOOKS, resolveLooks, type LookConfig, type ResolvedLook } from "@/lib/stylizacje";

export type ManagedOutfitRow = {
  id: string;
  slug: string;
  title: string;
  occasion: string;
  style: string;
  intro: string;
  tip: string;
  why_it_works: string[];
  excluded: string;
  product_ids: string[];
  max_budget: number | string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export function managedOutfitConfig(row: ManagedOutfitRow, products: readonly Product[]): LookConfig | null {
  const byId = new Map(products.filter((p) => p.active).map((p) => [p.id, p]));
  const ids = row.product_ids;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 6 || new Set(ids).size !== ids.length) return null;
  const selected = ids.map((id) => byId.get(id));
  if (selected.some((p) => !p || !Number.isFinite(p.price) || p.price < 0)) return null;
  const amountCents = selected.reduce((total, p) => total + Math.round(p!.price * 100), 0);
  const maxBudget = Number(row.max_budget);
  if (!Number.isFinite(maxBudget) || amountCents > Math.round(maxBudget * 100)) return null;
  if (!row.slug || !row.title || !row.occasion || !row.style) return null;
  return {
    slug: row.slug, title: row.title, occasion: row.occasion, style: row.style,
    intro: row.intro, tip: row.tip, whyItWorks: row.why_it_works,
    excluded: row.excluded, maxBudget, productSlugs: selected.map((p) => p!.slug),
  };
}

/** Existing editorial sets remain available; published DB sets are added dynamically. */
export async function getAllResolvedLooks(products: Product[]): Promise<ResolvedLook[]> {
  const { data, error } = await supabase
    .from("editorial_outfits")
    .select("id,slug,title,occasion,style,intro,tip,why_it_works,excluded,product_ids,max_budget,published,created_at,updated_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Nie udało się pobrać zarządzanych stylizacji:", error.message);
    return resolveLooks(products);
  }
  const dynamic = ((data ?? []) as ManagedOutfitRow[])
    .map((row) => managedOutfitConfig(row, products))
    .filter((config): config is LookConfig => Boolean(config));
  // Reserve the legacy slugs so existing public URLs cannot be silently replaced.
  const legacySlugs = new Set(LOOKS.map((look) => look.slug));
  return resolveLooks(products, [...LOOKS, ...dynamic.filter((look) => !legacySlugs.has(look.slug))]);
}
