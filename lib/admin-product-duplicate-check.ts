import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  areAffiliateUrlsEquivalent,
  createDuplicateCandidate,
  extractSheinProductIdentity,
  findSimilarProducts,
  type ComparableProduct,
  type ProductDuplicateCheck,
} from "@/lib/product-duplicate";

import {
  resolveSheinProductIdentityForAdmin,
} from "@/lib/resolve-shein-product-client";

const DUPLICATE_SELECT =
  "id, slug, name, short_name, category, image_url, affiliate_url, shein_product_key, price, active";

const MAX_SIMILARITY_CANDIDATES =
  1000;

type DuplicateProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  category: string;
  image_url: string;
  affiliate_url: string;

  shein_product_key:
    | string
    | null;

  price:
    | number
    | string;

  active: boolean;
};

function toComparableProduct(
  row:
    DuplicateProductRow
): ComparableProduct {
  return {
    id:
      row.id,

    slug:
      row.slug,

    name:
      row.name,

    shortName:
      row.short_name,

    category:
      row.category,

    imageUrl:
      row.image_url,

    affiliateUrl:
      row.affiliate_url,

    sheinProductKey:
      row.shein_product_key,

    price:
      row.price,

    active:
      row.active,
  };
}

function withoutExcludedProduct(
  products:
    ComparableProduct[],
  excludeProductId?: string
) {
  if (
    !excludeProductId
  ) {
    return products;
  }

  return products.filter(
    (
      product
    ) =>
      product.id !==
      excludeProductId
  );
}

export async function checkAdminProductDuplicate({
  supabase,
  sourceText,
  affiliateUrl,
  name,
  shortName,
  category,
  price,
  excludeProductId,
}: {
  supabase:
    SupabaseClient;

  sourceText:
    string;

  affiliateUrl:
    string;

  name:
    string;

  shortName:
    string;

  category:
    string;

  price?:
    | number
    | string
    | null;

  excludeProductId?:
    string;
}): Promise<ProductDuplicateCheck> {
  const immediateIdentity =
    extractSheinProductIdentity(
      `${sourceText}\n${affiliateUrl}`
    );

  let identity =
    immediateIdentity;

  try {
    const resolved =
      await resolveSheinProductIdentityForAdmin({
        sourceText,
        affiliateUrl,
      });

    if (
      resolved
    ) {
      identity =
        resolved;
    }
  } catch (
    error
  ) {
    console.warn(
      "Nie udało się rozwinąć tożsamości produktu SHEIN:",
      error
    );
  }

  if (
    identity
  ) {
    let request =
      supabase
        .from(
          "products"
        )
        .select(
          DUPLICATE_SELECT
        )
        .eq(
          "shein_product_key",
          identity.key
        )
        .limit(
          1
        );

    if (
      excludeProductId
    ) {
      request =
        request.neq(
          "id",
          excludeProductId
        );
    }

    const {
      data,
      error,
    } =
      await request;

    if (
      error
    ) {
      throw error;
    }

    const row =
      (
        data ??
        []
      )[0] as
        | DuplicateProductRow
        | undefined;

    if (
      row
    ) {
      return {
        status:
          "blocked",

        identity,

        exactMatch:
          createDuplicateCandidate(
            toComparableProduct(
              row
            ),
            100,
            [
              "to samo ID produktu SHEIN",
            ]
          ),

        similarMatches:
          [],

        blockingReason:
          "shein-key",
      };
    }
  }

  const {
    data:
      candidatesData,

    error:
      candidatesError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        DUPLICATE_SELECT
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .limit(
        MAX_SIMILARITY_CANDIDATES
      );

  if (
    candidatesError
  ) {
    throw candidatesError;
  }

  const comparable =
    withoutExcludedProduct(
      (
        (
          candidatesData ??
          []
        ) as
          DuplicateProductRow[]
      ).map(
        toComparableProduct
      ),
      excludeProductId
    );

  if (
    identity
  ) {
    const historicalMatch =
      comparable.find(
        (
          product
        ) => {
          if (
            product.sheinProductKey ===
            identity?.key
          ) {
            return true;
          }

          const derived =
            extractSheinProductIdentity(
              product.affiliateUrl
            );

          return (
            derived?.key ===
            identity?.key
          );
        }
      );

    if (
      historicalMatch
    ) {
      return {
        status:
          "blocked",

        identity,

        exactMatch:
          createDuplicateCandidate(
            historicalMatch,
            100,
            [
              "to samo ID produktu SHEIN",
            ]
          ),

        similarMatches:
          [],

        blockingReason:
          "shein-key",
      };
    }
  }

  const cleanAffiliateUrl =
    affiliateUrl.trim();

  if (
    cleanAffiliateUrl
  ) {
    const affiliateMatch =
      comparable.find(
        (
          product
        ) =>
          areAffiliateUrlsEquivalent(
            cleanAffiliateUrl,
            product.affiliateUrl
          )
      );

    if (
      affiliateMatch
    ) {
      return {
        status:
          "blocked",

        identity,

        exactMatch:
          createDuplicateCandidate(
            affiliateMatch,
            99,
            [
              "ten sam link SHEIN po normalizacji",
            ]
          ),

        similarMatches:
          [],

        blockingReason:
          "affiliate-url",
      };
    }
  }

  const similarMatches =
    findSimilarProducts({
      name,
      shortName,
      category,
      price,
      products:
        comparable,
      limit:
        4,
    });

  return {
    status:
      similarMatches.length >
      0
        ? "warning"
        : "clear",

    identity,

    exactMatch:
      null,

    similarMatches,

    blockingReason:
      null,
  };
}