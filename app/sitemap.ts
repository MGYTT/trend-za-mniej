import type {
  MetadataRoute,
} from "next";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  supabase,
} from "@/lib/supabase";

import {
  getSiteUrl,
} from "@/lib/site";

type SitemapProductRow = {
  slug: string;
  category: string;
  updated_at:
    | string
    | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .select(
        "slug, category, updated_at"
      )
      .eq(
        "active",
        true
      )
      .order(
        "updated_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    console.error(
      "Błąd generowania sitemap:",
      error
    );
  }

  const products =
    (data ??
      []) as SitemapProductRow[];

  const staticPages: MetadataRoute.Sitemap =
    [
      {
        url:
          siteUrl,

        changeFrequency:
          "daily",

        priority:
          1,
      },

      {
        url:
          `${siteUrl}/okazje`,

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          `${siteUrl}/o-nas`,

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },

      {
        url:
          `${siteUrl}/afiliacja`,

        changeFrequency:
          "yearly",

        priority:
          0.3,
      },

      {
        url:
          `${siteUrl}/kontakt`,

        changeFrequency:
          "monthly",

        priority:
          0.4,
      },

      {
        url:
          `${siteUrl}/polityka-prywatnosci`,

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },
    ];

  const productPages: MetadataRoute.Sitemap =
    products.map(
      (product) => ({
        url:
          `${siteUrl}/produkt/${product.slug}`,

        lastModified:
          product.updated_at
            ? new Date(
                product.updated_at
              )
            : undefined,

        changeFrequency:
          "weekly",

        priority:
          0.8,
      })
    );

  const categoryDates =
    new Map<
      string,
      Date | undefined
    >();

  for (
    const product
    of products
  ) {
    const category =
      product.category?.trim();

    if (!category) {
      continue;
    }

    const currentDate =
      categoryDates.get(
        category
      );

    const productDate =
      product.updated_at
        ? new Date(
            product.updated_at
          )
        : undefined;

    if (
      !currentDate ||
      (
        productDate &&
        productDate >
          currentDate
      )
    ) {
      categoryDates.set(
        category,
        productDate
      );
    }
  }

  const categoryPages: MetadataRoute.Sitemap =
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

        changeFrequency:
          "daily",

        priority:
          0.85,
      })
    );

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
  ];
}