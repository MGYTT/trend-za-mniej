import { NextResponse } from "next/server";

import {
  getProductById,
} from "@/lib/products";

import { supabase } from "@/lib/supabase";

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

  const { error } = await supabase
    .from("affiliate_clicks")
    .insert({
      product_id:
        product.id,
    });

  if (error) {
    console.error(
      "Nie udało się zapisać kliknięcia:",
      error
    );
  }

  return NextResponse.redirect(
    product.affiliateUrl,
    302
  );
}