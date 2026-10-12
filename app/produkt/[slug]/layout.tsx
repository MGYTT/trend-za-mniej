import type {
  ReactNode,
} from "react";

import {
  permanentRedirect,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase";

type Props = {
  children: ReactNode;

  params:
    Promise<{
      slug: string;
    }>;
};

export default async function ProductSlugLayout({
  children,
  params,
}: Props) {
  const {
    slug,
  } = await params;

  const {
    data:
      currentProduct,

    error:
      currentProductError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "id"
      )
      .eq(
        "slug",
        slug
      )
      .eq(
        "active",
        true
      )
      .maybeSingle();

  if (
    currentProductError
  ) {
    console.error(
      "Nie udało się sprawdzić aktualnego adresu produktu:",
      currentProductError
    );
  }

  if (
    currentProduct
  ) {
    return children;
  }

  const {
    data:
      redirectRow,

    error:
      redirectError,
  } =
    await supabase
      .from(
        "product_slug_redirects"
      )
      .select(
        "product_id"
      )
      .eq(
        "old_slug",
        slug
      )
      .maybeSingle();

  if (
    redirectError
  ) {
    console.error(
      "Nie udało się sprawdzić historii adresu produktu:",
      redirectError
    );

    return children;
  }

  if (
    !redirectRow
  ) {
    return children;
  }

  const {
    data:
      targetProduct,

    error:
      targetError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "slug"
      )
      .eq(
        "id",
        redirectRow.product_id
      )
      .eq(
        "active",
        true
      )
      .maybeSingle();

  if (
    targetError
  ) {
    console.error(
      "Nie udało się odczytać docelowego adresu produktu:",
      targetError
    );

    return children;
  }

  if (
    targetProduct?.slug &&
    targetProduct.slug !==
      slug
  ) {
    permanentRedirect(
      `/produkt/${targetProduct.slug}`
    );
  }

  return children;
}