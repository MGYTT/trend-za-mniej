import type {
  MetadataRoute,
} from "next";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  SHEIN_PROMOTIONS_UPDATED_AT,
} from "@/lib/shein-promotions";

import {
  supabase,
} from "@/lib/supabase";

import {
  getSiteUrl,
} from "@/lib/site";

import { getProducts } from "@/lib/products";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { STYLE_GUIDES } from "@/lib/poradniki";

export const revalidate =
  300;

type SitemapProductRow = {
  slug: string;

  category: string;

  created_at:
    | string
    | null;

  updated_at:
    | string
    | null;

  tiktok_featured:
    | boolean
    | null;

  tiktok_featured_at:
    | string
    | null;
};

function toValidDate(
  value:
    | string
    | null
    | undefined
) {
  if (
    !value
  ) {
    return undefined;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date;
}

function getProductDate(
  product:
    SitemapProductRow
) {
  return (
    toValidDate(
      product.updated_at
    ) ??
    toValidDate(
      product.created_at
    )
  );
}

function getLatestDate(
  dates:
    Array<
      Date |
      undefined
    >
) {
  let latest:
    Date |
    undefined;

  for (
    const date
    of dates
  ) {
    if (
      !date
    ) {
      continue;
    }

    if (
      !latest ||
      date >
        latest
    ) {
      latest =
        date;
    }
  }

  return latest;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "slug, category, created_at, updated_at, tiktok_featured, tiktok_featured_at"
      )
      .eq(
        "active",
        true
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (
    error
  ) {
    console.error(
      "Błąd generowania sitemap:",
      error
    );
  }

  const products =
    (
      data ??
      []
    ) as SitemapProductRow[];

  const promotionsUpdatedAt =
    toValidDate(
      SHEIN_PROMOTIONS_UPDATED_AT
    );

  const staticPages:
    MetadataRoute.Sitemap = [
      {
        url:
          siteUrl,
      },

      {
        url:
          `${siteUrl}/okazje`,
      },

      {
        url:
          `${siteUrl}/stylizacje`,
      },

      {
        url:
          `${siteUrl}/poradniki`,
      },

      {
        url:
          `${siteUrl}/kategorie`,
      },

      {
        url:
          `${siteUrl}/tiktok`,
      },

      {
        url:
          `${siteUrl}/kody-rabatowe`,
      },

      {
        url:
          `${siteUrl}/promocje-shein`,

        lastModified:
          promotionsUpdatedAt,
      },

      {
        url:
          `${siteUrl}/o-nas`,
      },

      {
        url:
          `${siteUrl}/afiliacja`,
      },

      {
        url:
          `${siteUrl}/kontakt`,
      },

      {
        url:
          `${siteUrl}/polityka-prywatnosci`,
      },
    ];

  const productPages:
    MetadataRoute.Sitemap =
    products.map(
      (
        product
      ) => ({
        url:
          `${siteUrl}/produkt/${product.slug}`,

        lastModified:
          getProductDate(
            product
          ),
      })
    );

  const categoryDates =
    new Map<
      string,
      Date |
      undefined
    >();

  for (
    const product
    of products
  ) {
    const category =
      product.category
        ?.trim();

    if (
      !category
    ) {
      continue;
    }

    const productDate =
      getProductDate(
        product
      );

    const existingDate =
      categoryDates.get(
        category
      );

    if (
      !existingDate ||
      (
        productDate &&
        productDate >
          existingDate
      )
    ) {
      categoryDates.set(
        category,
        productDate
      );
    }
  }

  const categoryPages:
    MetadataRoute.Sitemap =
    Array.from(
      categoryDates.entries()
    ).map(
      ([
        category,
        lastModified,
      ]) => ({
        url:
          `${siteUrl}/kategoria/${slugifyCategory(
            category
          )}`,

        lastModified,
      })
    );

  const tiktokProducts =
    products.filter(
      (
        product
      ) =>
        Boolean(
          product.tiktok_featured
        )
    );

  const latestTikTokDate =
    getLatestDate(
      tiktokProducts.flatMap(
        (
          product
        ) => [
          getProductDate(
            product
          ),

          toValidDate(
            product.tiktok_featured_at
          ),
        ]
      )
    );

  const tiktokPage =
    staticPages.find(
      (
        page
      ) =>
        page.url ===
        `${siteUrl}/tiktok`
    );

  if (
    tiktokPage &&
    latestTikTokDate
  ) {
    tiktokPage.lastModified =
      latestTikTokDate;
  }

  // Only include published, complete outfits that still fit their budgets.
  const lookPages: MetadataRoute.Sitemap = (await getAllResolvedLooks(await getProducts()))
    .filter((look) => look.available)
    .map((look) => ({ url: `${siteUrl}/stylizacje/${look.slug}` }));

  const guidePages: MetadataRoute.Sitemap = STYLE_GUIDES.map((guide) => ({
    url: `${siteUrl}/poradniki/${guide.slug}`,
  }));

  const { data: storeRows, error: storeError } = await supabase
    .from("extension_stores").select("slug,updated_at").eq("published", true);
  if (storeError) console.warn("Sitemap store catalog:", storeError.code);
  const merchantPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/kody-rabatowe/shein` },
    ...(storeRows ?? []).map((store) => ({
      url: `${siteUrl}/kody-rabatowe/${store.slug}`,
      lastModified: toValidDate(store.updated_at),
    })),
  ];

  return [
    ...merchantPages,
    ...lookPages,
    ...guidePages,
    ...staticPages,
    ...categoryPages,
    ...productPages,
  ];
}