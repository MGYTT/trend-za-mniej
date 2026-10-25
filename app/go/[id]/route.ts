import {
  NextResponse,
} from "next/server";

import {
  getProductById,
  getProducts,
} from "@/lib/products";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const requestedUrl = new URL(request.url);
  const requestedLook = requestedUrl.searchParams.get("origin") === "outfit"
    ? requestedUrl.searchParams.get("look") : null;

  let verifiedLook: string | null = null;
  if (requestedLook && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedLook) && requestedLook.length <= 120) {
    try {
      const looks = await getAllResolvedLooks(await getProducts());
      const matchedLook = looks.find((look) =>
        look.slug === requestedLook && look.available &&
        look.products.some((item) => item.id === product.id)
      );
      if (matchedLook) verifiedLook = matchedLook.slug;
    } catch (error) {
      console.error("Nie udało się zweryfikować źródła stylizacji:", error);
    }
  }

  try {
    const supabase =
      createAdminClient();

    const { error } =
      await supabase
        .from(
          "affiliate_clicks"
        )
        .insert({
          product_id: product.id,
          source: verifiedLook ? "outfit" : "product",
          outfit_slug: verifiedLook,
        });

    if (error) {
      console.error(
        "Nie udało się zapisać kliknięcia:",
        error
      );
    }
  } catch (error) {
    console.error(
      "Błąd zapisywania kliknięcia:",
      error
    );
  }

  const response = NextResponse.redirect(
    product.affiliateUrl,
    302
  );
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}