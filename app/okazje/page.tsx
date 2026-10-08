import type {
  Metadata,
} from "next";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  getCategories,
  getProducts,
  type ProductSort,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export const revalidate =
  60;

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params =
    await searchParams;

  const query =
    params.q?.trim() ??
    "";

  const category =
    params.category &&
    params.category !==
      "all"
      ? params.category
      : "";

  const maxPrice =
    params.maxPrice ??
    "";

  const sort =
    params.sort ??
    "";

  const hasFilters =
    Boolean(query) ||
    Boolean(category) ||
    Boolean(maxPrice) ||
    Boolean(
      sort &&
      sort !==
        "newest"
    );

  let title =
    "Wszystkie okazje";

  let description =
    "Przeglądaj wybrane ubrania, dodatki i modne okazje. Wyszukuj produkty według kategorii, ceny i najnowszych znalezisk.";

  if (category) {
    title =
      `${category} - modne okazje`;

    description =
      `Przeglądaj produkty z kategorii ${category} i znajdź ciekawe oferty w swoim budżecie.`;
  }

  if (query) {
    title =
      `Wyniki dla „${query}”`;

    description =
      `Wyniki wyszukiwania dla frazy „${query}” w Trend za Mniej.`;
  }

  return {
    title,

    description,

    alternates: {
      canonical:
        "/okazje",
    },

    robots: {
      index:
        !hasFilters,

      follow:
        true,

      googleBot: {
        index:
          !hasFilters,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type:
        "website",

      locale:
        "pl_PL",

      url:
        "/okazje",

      siteName:
        SITE_NAME,

      title,

      description,

      images: [
        {
          url:
            "/opengraph-image",

          width:
            1200,

          height:
            630,

          alt:
            "Trend za Mniej - okazje",
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: [
        "/opengraph-image",
      ],
    },
  };
}

export default async function OffersPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const query =
    params.q?.trim() ??
    "";

  const category =
    params.category &&
    params.category !==
      "all"
      ? params.category
      : "";

  const maxPrice =
    params.maxPrice ??
    "";

  const parsedMaxPrice =
    maxPrice
      ? Number(
          maxPrice
        )
      : undefined;

  const safeMaxPrice =
    typeof parsedMaxPrice ===
        "number" &&
      Number.isFinite(
        parsedMaxPrice
      ) &&
      parsedMaxPrice >
        0
      ? parsedMaxPrice
      : undefined;

  const allowedSorts:
    ProductSort[] = [
    "newest",
    "price-asc",
    "price-desc",
  ];

  const sort:
    ProductSort =
    allowedSorts.includes(
      params.sort as
        ProductSort
    )
      ? (
          params.sort as
            ProductSort
        )
      : "newest";

  const [
    products,
    categories,
  ] =
    await Promise.all([
      getProducts({
        query,

        category:
          category ||
          undefined,

        maxPrice:
          safeMaxPrice,

        sort,
      }),

      getCategories(),
    ]);

  const hasFilters =
    Boolean(
      query ||
      category ||
      maxPrice ||
      sort !==
        "newest"
    );

  const resultLabel =
    getResultLabel(
      products.length
    );

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/okazje`;

  const structuredData =
    !hasFilters
      ? {
          "@context":
            "https://schema.org",

          "@graph": [
            {
              "@type":
                "CollectionPage",

              "@id":
                `${pageUrl}#webpage`,

              url:
                pageUrl,

              name:
                "Wszystkie okazje",

              description:
                "Wybrane ubrania, dodatki i modne okazje w Trend za Mniej.",

              inLanguage:
                SITE_LANGUAGE,

              isPartOf: {
                "@id":
                  `${siteUrl}/#website`,
              },

              breadcrumb: {
                "@id":
                  `${pageUrl}#breadcrumb`,
              },

              mainEntity: {
                "@id":
                  `${pageUrl}#products`,
              },
            },

            {
              "@type":
                "BreadcrumbList",

              "@id":
                `${pageUrl}#breadcrumb`,

              itemListElement: [
                {
                  "@type":
                    "ListItem",

                  position:
                    1,

                  name:
                    "Strona główna",

                  item:
                    siteUrl,
                },

                {
                  "@type":
                    "ListItem",

                  position:
                    2,

                  name:
                    "Okazje",

                  item:
                    pageUrl,
                },
              ],
            },

            {
              "@type":
                "ItemList",

              "@id":
                `${pageUrl}#products`,

              name:
                "Najnowsze okazje",

              numberOfItems:
                products.length,

              itemListOrder:
                "https://schema.org/ItemListOrderDescending",

              itemListElement:
                products
                  .slice(
                    0,
                    50
                  )
                  .map(
                    (
                      product,
                      index
                    ) => ({
                      "@type":
                        "ListItem",

                      position:
                        index +
                        1,

                      url:
                        `${siteUrl}/produkt/${product.slug}`,

                      name:
                        product.name,

                      image:
                        product.image,
                    })
                  ),
            },
          ],
        }
      : null;

  let pageTitle =
    "Wszystkie okazje";

  if (category) {
    pageTitle =
      category;
  }

  if (query) {
    pageTitle =
      `Wyniki dla „${query}”`;
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
            Okazje
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-[-0.035em] text-stone-900 sm:text-4xl">
            Znajdź coś dla siebie
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Przeglądaj wybrane
            produkty i zawęź wyniki
            tylko wtedy, gdy tego
            potrzebujesz.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ProductFilters
              categories={
                categories
              }
              query={
                query
              }
              category={
                category
              }
              maxPrice={
                maxPrice
              }
              sort={
                sort
              }
            />
          </aside>

          <section className="min-w-0">
            <div className="flex min-h-12 items-end justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black tracking-[-0.025em] text-stone-900 sm:text-2xl">
                  {
                    pageTitle
                  }
                </h2>

                <p className="mt-1 text-sm text-stone-400">
                  {
                    resultLabel
                  }
                </p>
              </div>

              {category && (
                <Link
                  href={`/kategoria/${slugifyCategory(
                    category
                  )}`}
                  className="hidden shrink-0 text-xs font-black text-rose-600 transition hover:text-rose-700 sm:inline-flex"
                >
                  O kategorii →
                </Link>
              )}
            </div>

            {products.length >
            0 ? (
              <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
                {products.map(
                  (
                    product
                  ) => (
                    <ProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyResults
                query={
                  query
                }
              />
            )}
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function EmptyResults({
  query,
}: {
  query: string;
}) {
  return (
    <div className="mt-5 rounded-[20px] border border-stone-200 bg-white px-5 py-12 text-center sm:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-xl">
        🔎
      </div>

      <h3 className="mt-4 text-xl font-black text-stone-900">
        Brak wyników
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
        {query
          ? `Nie znaleźliśmy produktów dla „${query}”. Spróbuj krótszej frazy albo zmień filtry.`
          : "Spróbuj zmienić kategorię, cenę lub pozostałe filtry."}
      </p>

      <Link
        href="/okazje"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-rose-600"
      >
        Pokaż wszystkie
      </Link>
    </div>
  );
}

function getResultLabel(
  count: number
) {
  if (
    count ===
    1
  ) {
    return "1 oferta";
  }

  const lastTwo =
    count %
    100;

  const last =
    count %
    10;

  if (
    lastTwo >=
      12 &&
    lastTwo <=
      14
  ) {
    return `${count} ofert`;
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return `${count} oferty`;
  }

  return `${count} ofert`;
}