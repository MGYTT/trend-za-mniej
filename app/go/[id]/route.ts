import {
  NextResponse,
} from "next/server";

import {
  getProductById,
} from "@/lib/products";

import {
  createAdminClient,
} from "@/lib/supabase/admin";
import { resolveClickAttribution } from "@/lib/affiliate-attribution";
import { LOOKS } from "@/lib/stylizacje";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { id } =
    await context.params;

  const product =
    await getProductById(id);

  if (!product) {
    return NextResponse.redirect(
      new URL("/", request.url),
      302
    );
  }

  try {
    const supabase = createAdminClient();
    const attribution = resolveClickAttribution(
      new URL(request.url).searchParams,
      product.slug,
      LOOKS
    );

    const { error } = await supabase
      .from("affiliate_clicks")
      .insert({
        product_id: product.id,
        source_type: attribution.sourceType,
        outfit_slug: attribution.outfitSlug,
      });

    if (error?.code === "PGRST204" || error?.code === "42703") {
      // Graceful compatibility before the one-time SQL upgrade is applied.
      const fallback = await supabase
        .from("affiliate_clicks")
        .insert({ product_id: product.id });

      if (fallback.error) {
        console.error("Błąd zapisania kliknięcia:", fallback.error);
      }
    } else if (error) {
      console.error("Błąd zapisania kliknięcia:", error);
    }
  } catch (error) {
    console.error("Błąd zapisywania kliknięcia:", error);
  }

  return NextResponse.redirect(
    product.affiliateUrl,
    302
  );
}