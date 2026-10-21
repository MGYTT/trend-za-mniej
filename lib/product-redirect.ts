import "server-only";

import { supabase } from "@/lib/supabase";

/**
 * Look up the current canonical slug for an active product.
 * Historical slugs live in public.product_slug_redirects and are
 * readable by anonymous visitors only if the target product is active.
 *
 * Important: this is only called when /produkt/[slug] no longer
 * matches an active product. New/current slugs remain unchanged.
 */
export async function getCurrentSlugForOldProductSlug(
  oldSlug: string
): Promise<string | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(oldSlug)) {
    return null;
  }

  const { data: redirectRow, error: lookupError } = await supabase
    .from("product_slug_redirects")
    .select("product_id")
    .eq("old_slug", oldSlug)
    .maybeSingle();

  if (lookupError) {
    console.error("Błąd wyszukiwania starego adresu produktu:", lookupError);
    return null;
  }

  if (!redirectRow) return null;

  const { data: target, error: targetError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", redirectRow.product_id)
    .eq("active", true)
    .maybeSingle();

  if (targetError) {
    console.error("Błąd pobierania nowego adresu produktu:", targetError);
    return null;
  }

  if (!target?.slug || target.slug === oldSlug) {
    return null;
  }

  return target.slug;
}
