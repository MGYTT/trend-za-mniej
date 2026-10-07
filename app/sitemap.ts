import type {
  MetadataRoute,
} from "next";

import {
  supabase,
} from "@/lib/supabase";

import {
  getSiteUrl,
} from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  const {
    data: products,
    error,
  } = await supabase
    .from("products")
    .select(
      "slug, updated_at"
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

  const staticPages: MetadataRoute.Sitemap =
    [
      {
        url: siteUrl,
        changeFrequency:
          "daily",
        priority: 1,
      },

      {
        url: `${siteUrl}/okazje`,
        changeFrequency:
          "daily",
        priority: 0.9,
      },

      {
        url: `${siteUrl}/afiliacja`,
        changeFrequency:
          "yearly",
        priority: 0.3,
      },

      {
        url: `${siteUrl}/polityka-prywatnosci`,
        changeFrequency:
          "yearly",
        priority: 0.3,
      },

      {
        url: `${siteUrl}/kontakt`,
        changeFrequency:
          "monthly",
        priority: 0.4,
      },
    ];

  const productPages: MetadataRoute.Sitemap =
    (
      products ?? []
    ).map(
      (product) => ({
        url: `${siteUrl}/produkt/${product.slug}`,

        lastModified:
          product.updated_at
            ? new Date(
                product.updated_at
              )
            : undefined,

        changeFrequency:
          "weekly",

        priority: 0.8,
      })
    );

  return [
    ...staticPages,
    ...productPages,
  ];
}
