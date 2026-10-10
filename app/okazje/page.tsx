import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { slugifyCategory } from "@/lib/categories";
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
    page?: string;
  }>;
};

type CatalogState = {
  query: string;
  category: string;
  maxPrice: string;
  sort: ProductSort;
};

const PRODUCTS_PER_PAGE = 24;

export const revalidate = 60;

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

  const page =
    parsePage(
      params.page
    );

  const hasFilters =
    Boolean(
      query
    ) ||
    Boolean(
      category
    ) ||
    Boolean(
      maxPrice
    ) ||
    Boolean(
      sort &&
      sort !==
        "newest"
    ) ||
    page >
      1;

  let title =
    "Wszystkie okazje";

  let description =
    "Przeglądaj wybrane ubrania, dodatki i modne okazje. Wyszukuj produkty według kategorii, ceny i najnowszych znalezisk.";

  if (
    category
  ) {
    title =
      `${category} - modne okazje`;

    description =
      `Przeglądaj produkty z kategorii ${category} i znajdź ciekawe oferty w swoim budżecie.`;
  }

  if (
    query
  ) {
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
    allProducts,
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

  const totalResults =
    allProducts.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalResults /
          PRODUCTS_PER_PAGE
      )
    );

  const requestedPage =
    parsePage(
      params.page
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages
    );

  const pageStart =
    (
      currentPage -
      1
    ) *
    PRODUCTS_PER_PAGE;

  const products =
    allProducts.slice(
      pageStart,
      pageStart +
        PRODUCTS_PER_PAGE
    );

  const state:
    CatalogState = {
    query,
    category,
    maxPrice,
    sort,
  };

  const hasFilters =
    Boolean(
      query
    ) ||
    Boolean(
      category
    ) ||
    Boolean(
      maxPrice
    ) ||
    sort !==
      "newest";

  const advancedFilterCount =
    [
      category,

      maxPrice,

      sort !==
      "newest"
        ? sort
        : "",
    ].filter(
      Boolean
    ).length;

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/okazje`;

  const structuredData =
    !hasFilters &&
    requestedPage ===
      1
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

              itemListElement:
                [
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
                totalResults,

              itemListOrder:
                "https://schema.org/ItemListOrderDescending",

              itemListElement:
                allProducts
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
    "Wszystkie produkty";

  let pageSubtitle =
    "Przeglądaj spokojnie. Filtry są dostępne tylko wtedy, gdy ich potrzebujesz.";

  if (
    category
  ) {
    pageTitle =
      category;

    pageSubtitle =
      `Wybrane produkty z kategorii ${category}.`;
  }

  if (
    query
  ) {
    pageTitle =
      `Wyniki dla „${query}”`;

    pageSubtitle =
      "Możesz doprecyzować wyniki kategorią, budżetem albo kolejnością.";
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-24 text-stone-950 lg:pb-0">
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

      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

                Katalog Trend za Mniej
              </div>

              <h1 className="mt-4 max-w-3xl text-balance text-[34px] font-black leading-[1.02] tracking-[-0.05em] text-stone-950 sm:text-[44px] lg:text-[52px]">
                Przeglądaj okazje

                <span className="text-stone-400">
                  {" "}
                  bez chaosu.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base sm:leading-8">
                Wyszukaj konkretną
                rzecz albo po prostu
                przewijaj. Cena,
                kategoria
                i najważniejsze
                informacje są zawsze
                w tym samym miejscu.
              </p>
            </div>

            <div className="flex flex-col gap-2 min-[460px]:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/promocje-shein"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-stone-950 px-4 text-xs font-black text-white transition hover:bg-black"
              >
                <span
                  aria-hidden="true"
                >
                  🔥
                </span>

                Promocje SHEIN
              </Link>

              <Link
                href="/kategorie"
                className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-white px-4 text-xs font-black text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
              >
                Wszystkie kategorie
              </Link>
            </div>
          </div>

          <div className="horizontal-scroll -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <QuickLink
              href="/okazje"
              label="Wszystkie"
              active={
                !hasFilters
              }
            />

            <QuickLink
              href="/okazje?maxPrice=50"
              label="Do 50 zł"
              active={
                maxPrice ===
                  "50" &&
                !query &&
                !category &&
                sort ===
                  "newest"
              }
            />

            <QuickLink
              href="/okazje?maxPrice=100"
              label="Do 100 zł"
              active={
                maxPrice ===
                  "100" &&
                !query &&
                !category &&
                sort ===
                  "newest"
              }
            />

            <QuickLink
              href="/okazje?sort=price-asc"
              label="Najtańsze"
              active={
                sort ===
                  "price-asc" &&
                !query &&
                !category &&
                !maxPrice
              }
            />

            <QuickLink
              href="/okazje?sort=newest"
              label="Najnowsze"
              active={
                sort ===
                  "newest" &&
                !query &&
                !category &&
                !maxPrice
              }
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <CatalogControls
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
          advancedFilterCount={
            advancedFilterCount
          }
        />

        <section className="mt-5 sm:mt-7">
          <div className="flex flex-col gap-4 rounded-[22px] border border-black/[0.06] bg-white p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Wyniki
              </p>

              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-stone-950 sm:text-2xl">
                {
                  pageTitle
                }
              </h2>

              <p className="mt-1 text-xs leading-5 text-stone-400 sm:text-sm">
                {
                  pageSubtitle
                }
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-[14px] bg-[#f7f7f8] px-3.5 py-2.5 text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
                  Znaleziono
                </p>

                <p className="mt-0.5 text-sm font-black text-stone-800">
                  {getResultLabel(
                    totalResults
                  )}
                </p>
              </div>

              {hasFilters && (
                <Link
                  href="/okazje"
                  className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-white px-3.5 text-[11px] font-black text-stone-500 transition hover:bg-stone-50 hover:text-rose-600"
                >
                  Wyczyść
                </Link>
              )}
            </div>
          </div>

          {hasFilters && (
            <div className="horizontal-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {query && (
                <ActiveFilter
                  label={`„${query}”`}
                  href={buildOffersHref({
                    ...state,

                    query:
                      "",
                  })}
                />
              )}

              {category && (
                <ActiveFilter
                  label={
                    category
                  }
                  href={buildOffersHref({
                    ...state,

                    category:
                      "",
                  })}
                />
              )}

              {safeMaxPrice && (
                <ActiveFilter
                  label={`Do ${safeMaxPrice} zł`}
                  href={buildOffersHref({
                    ...state,

                    maxPrice:
                      "",
                  })}
                />
              )}

              {sort ===
                "price-asc" && (
                <ActiveFilter
                  label="Cena: od najniższej"
                  href={buildOffersHref({
                    ...state,

                    sort:
                      "newest",
                  })}
                />
              )}

              {sort ===
                "price-desc" && (
                <ActiveFilter
                  label="Cena: od najwyższej"
                  href={buildOffersHref({
                    ...state,

                    sort:
                      "newest",
                  })}
                />
              )}
            </div>
          )}

          {category && (
            <div className="mt-3 flex justify-end">
              <Link
                href={`/kategoria/${slugifyCategory(
                  category
                )}`}
                className="text-[11px] font-black text-rose-600 transition hover:text-rose-700"
              >
                Zobacz stronę kategorii →
              </Link>
            </div>
          )}

          {totalResults >
          0 ? (
            <>
              <div className="mt-5 flex items-center justify-between gap-4 px-1">
                <p className="text-[11px] font-semibold text-stone-400">
                  {getRangeLabel(
                    pageStart,
                    products.length,
                    totalResults
                  )}
                </p>

                {totalPages >
                  1 && (
                  <p className="text-[11px] font-black text-stone-500">
                    Strona{" "}
                    {
                      currentPage
                    }{" "}
                    z{" "}
                    {
                      totalPages
                    }
                  </p>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

              {totalPages >
                1 && (
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  state={
                    state
                  }
                />
              )}

              <div className="mt-8 rounded-[24px] border border-black/[0.06] bg-white p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-black text-stone-950">
                      Chcesz zobaczyć coś innego?
                    </p>

                    <p className="mt-1 max-w-2xl text-xs leading-6 text-stone-500">
                      Przejdź do kategorii
                      albo sprawdź aktualne
                      kampanie SHEIN —
                      bez dokładania kolejnych
                      warstw filtrów.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 min-[460px]:flex-row">
                    <Link
                      href="/kategorie"
                      className="flex min-h-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-[#fafafa] px-4 text-xs font-black text-stone-600 transition hover:bg-stone-100"
                    >
                      Kategorie
                    </Link>

                    <Link
                      href="/promocje-shein"
                      className="flex min-h-11 items-center justify-center rounded-[14px] bg-stone-950 px-4 text-xs font-black text-white transition hover:bg-rose-600"
                    >
                      🔥 Promocje SHEIN
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyResults
              query={
                query
              }
            />
          )}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

function CatalogControls({
  categories,
  query,
  category,
  maxPrice,
  sort,
  advancedFilterCount,
}: {
  categories:
    string[];

  query:
    string;

  category:
    string;

  maxPrice:
    string;

  sort:
    ProductSort;

  advancedFilterCount:
    number;
}) {
  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-3 shadow-[0_12px_35px_rgba(28,25,23,0.05)] sm:p-4">
      <div className="lg:hidden">
        <form
          action="/okazje"
          method="get"
          className="flex gap-2"
        >
          {category && (
            <input
              type="hidden"
              name="category"
              value={
                category
              }
            />
          )}

          {maxPrice && (
            <input
              type="hidden"
              name="maxPrice"
              value={
                maxPrice
              }
            />
          )}

          {sort !==
            "newest" && (
            <input
              type="hidden"
              name="sort"
              value={
                sort
              }
            />
          )}

          <div className="relative min-w-0 flex-1">
            <SearchIcon />

            <input
              type="search"
              name="q"
              defaultValue={
                query
              }
              placeholder="Czego szukasz?"
              aria-label="Szukaj produktu"
              className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] py-2 pl-11 pr-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>

          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-[15px] bg-stone-950 px-4 text-sm font-black text-white active:scale-[0.98]"
          >
            Szukaj
          </button>
        </form>

        <details
          className="group mt-2"
          open={
            advancedFilterCount >
            0
          }
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[14px] border border-black/[0.07] bg-[#fafafa] px-3.5 text-xs font-black text-stone-700 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <FilterIcon />

              Filtry i sortowanie

              {advancedFilterCount >
                0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[9px] font-black text-white">
                  {
                    advancedFilterCount
                  }
                </span>
              )}
            </span>

            <ChevronIcon />
          </summary>

          <form
            action="/okazje"
            method="get"
            className="mt-2 rounded-[18px] bg-[#f7f7f8] p-3.5"
          >
            {query && (
              <input
                type="hidden"
                name="q"
                value={
                  query
                }
              />
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <FilterField
                label="Kategoria"
                htmlFor="mobile-category"
              >
                <select
                  id="mobile-category"
                  name="category"
                  defaultValue={
                    category ||
                    "all"
                  }
                  className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-white px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50"
                >
                  <option value="all">
                    Wszystkie
                  </option>

                  {categories.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
                </select>
              </FilterField>

              <FilterField
                label="Budżet"
                htmlFor="mobile-price"
              >
                <select
                  id="mobile-price"
                  name="maxPrice"
                  defaultValue={
                    maxPrice
                  }
                  className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-white px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50"
                >
                  <option value="">
                    Dowolna
                  </option>

                  <option value="50">
                    Do 50 zł
                  </option>

                  <option value="100">
                    Do 100 zł
                  </option>

                  <option value="150">
                    Do 150 zł
                  </option>

                  <option value="200">
                    Do 200 zł
                  </option>
                </select>
              </FilterField>

              <FilterField
                label="Sortowanie"
                htmlFor="mobile-sort"
              >
                <select
                  id="mobile-sort"
                  name="sort"
                  defaultValue={
                    sort
                  }
                  className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-white px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50"
                >
                  <option value="newest">
                    Najnowsze
                  </option>

                  <option value="price-asc">
                    Cena rosnąco
                  </option>

                  <option value="price-desc">
                    Cena malejąco
                  </option>
                </select>
              </FilterField>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="flex min-h-11 flex-1 items-center justify-center rounded-[14px] bg-stone-950 px-4 text-sm font-black text-white"
              >
                Pokaż wyniki
              </button>

              {advancedFilterCount >
                0 && (
                <Link
                  href={
                    query
                      ? `/okazje?q=${encodeURIComponent(
                          query
                        )}`
                      : "/okazje"
                  }
                  className="flex min-h-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-white px-4 text-xs font-black text-stone-500"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>
        </details>
      </div>

      <form
        action="/okazje"
        method="get"
        className="hidden lg:grid lg:grid-cols-[minmax(260px,1.45fr)_minmax(170px,0.85fr)_minmax(150px,0.72fr)_minmax(180px,0.82fr)_auto] lg:items-end lg:gap-3"
      >
        <FilterField
          label="Szukaj produktu"
          htmlFor="desktop-search"
        >
          <div className="relative">
            <SearchIcon />

            <input
              id="desktop-search"
              name="q"
              type="search"
              defaultValue={
                query
              }
              placeholder="Np. sukienka, sweter, torebka..."
              className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] py-2 pl-11 pr-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>
        </FilterField>

        <FilterField
          label="Kategoria"
          htmlFor="desktop-category"
        >
          <select
            id="desktop-category"
            name="category"
            defaultValue={
              category ||
              "all"
            }
            className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
          >
            <option value="all">
              Wszystkie
            </option>

            {categories.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {
                    item
                  }
                </option>
              )
            )}
          </select>
        </FilterField>

        <FilterField
          label="Budżet"
          htmlFor="desktop-price"
        >
          <select
            id="desktop-price"
            name="maxPrice"
            defaultValue={
              maxPrice
            }
            className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
          >
            <option value="">
              Dowolna
            </option>

            <option value="50">
              Do 50 zł
            </option>

            <option value="100">
              Do 100 zł
            </option>

            <option value="150">
              Do 150 zł
            </option>

            <option value="200">
              Do 200 zł
            </option>
          </select>
        </FilterField>

        <FilterField
          label="Sortuj"
          htmlFor="desktop-sort"
        >
          <select
            id="desktop-sort"
            name="sort"
            defaultValue={
              sort
            }
            className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
          >
            <option value="newest">
              Najnowsze
            </option>

            <option value="price-asc">
              Cena: od najniższej
            </option>

            <option value="price-desc">
              Cena: od najwyższej
            </option>
          </select>
        </FilterField>

        <button
          type="submit"
          className="flex min-h-12 items-center justify-center rounded-[15px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200"
        >
          Zastosuj
        </button>
      </form>
    </section>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label:
    string;

  htmlFor:
    string;

  children:
    ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={
          htmlFor
        }
        className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-stone-400"
      >
        {
          label
        }
      </label>

      {
        children
      }
    </div>
  );
}

function QuickLink({
  href,
  label,
  active = false,
}: {
  href:
    string;

  label:
    string;

  active?:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className={[
        "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-black transition",

        active
          ? "border-stone-950 bg-stone-950 text-white"
          : "border-black/[0.07] bg-[#fafafa] text-stone-600 hover:bg-stone-100 hover:text-stone-950",
      ].join(
        " "
      )}
    >
      {
        label
      }
    </Link>
  );
}

function ActiveFilter({
  label,
  href,
}: {
  label:
    string;

  href:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      aria-label={`Usuń filtr: ${label}`}
      className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 text-[10px] font-black text-rose-700 transition hover:bg-rose-100"
    >
      {
        label
      }

      <span
        aria-hidden="true"
        className="text-sm leading-none text-rose-400"
      >
        ×
      </span>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  state,
}: {
  currentPage:
    number;

  totalPages:
    number;

  state:
    CatalogState;
}) {
  const pages =
    getVisiblePages(
      currentPage,
      totalPages
    );

  return (
    <nav
      aria-label="Stronicowanie produktów"
      className="mt-8 flex flex-col items-center gap-3"
    >
      <div className="flex max-w-full items-center gap-1 rounded-[18px] border border-black/[0.06] bg-white p-1.5 shadow-sm">
        <PaginationArrow
          direction="previous"
          disabled={
            currentPage <=
            1
          }
          href={buildOffersHref(
            state,
            currentPage -
              1
          )}
        />

        {pages.map(
          (
            page,
            index
          ) =>
            page ===
            null ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 min-w-6 items-center justify-center text-xs font-black text-stone-300 sm:min-w-8"
              >
                …
              </span>
            ) : (
              <Link
                key={
                  page
                }
                href={buildOffersHref(
                  state,
                  page
                )}
                aria-current={
                  page ===
                  currentPage
                    ? "page"
                    : undefined
                }
                className={[
                  "flex h-10 min-w-9 items-center justify-center rounded-[12px] px-2 text-xs font-black transition sm:min-w-10",

                  page ===
                  currentPage
                    ? "bg-stone-950 text-white"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-950",
                ].join(
                  " "
                )}
              >
                {
                  page
                }
              </Link>
            )
        )}

        <PaginationArrow
          direction="next"
          disabled={
            currentPage >=
            totalPages
          }
          href={buildOffersHref(
            state,
            currentPage +
              1
          )}
        />
      </div>

      <p className="text-[10px] font-semibold text-stone-400">
        Filtry zostaną zachowane po zmianie strony.
      </p>
    </nav>
  );
}

function PaginationArrow({
  direction,
  disabled,
  href,
}: {
  direction:
    | "previous"
    | "next";

  disabled:
    boolean;

  href:
    string;
}) {
  const symbol =
    direction ===
    "previous"
      ? "←"
      : "→";

  const label =
    direction ===
    "previous"
      ? "Poprzednia strona"
      : "Następna strona";

  if (
    disabled
  ) {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-9 items-center justify-center rounded-[12px] text-stone-200 sm:w-10"
      >
        {
          symbol
        }
      </span>
    );
  }

  return (
    <Link
      href={
        href
      }
      aria-label={
        label
      }
      className="flex h-10 w-9 items-center justify-center rounded-[12px] text-sm font-black text-stone-500 transition hover:bg-stone-100 hover:text-stone-950 sm:w-10"
    >
      {
        symbol
      }
    </Link>
  );
}

function EmptyResults({
  query,
}: {
  query:
    string;
}) {
  return (
    <div className="mt-5 rounded-[26px] border border-black/[0.06] bg-white px-5 py-14 text-center sm:px-8 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f4f4f5] text-stone-500">
        <SearchLargeIcon />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-stone-950 sm:text-2xl">
        Nie znaleźliśmy pasujących produktów
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
        {query
          ? `Nie ma teraz produktów pasujących do „${query}”. Spróbuj prostszej frazy albo usuń część filtrów.`
          : "Spróbuj zwiększyć budżet, zmienić kategorię albo wrócić do wszystkich produktów."}
      </p>

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/okazje"
          className="flex min-h-11 items-center justify-center rounded-[14px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-black"
        >
          Pokaż wszystkie
        </Link>

        <Link
          href="/promocje-shein"
          className="flex min-h-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-white px-5 text-sm font-black text-stone-700 transition hover:bg-stone-50"
        >
          Promocje SHEIN
        </Link>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function SearchLargeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />

      <path d="M7 12h10" />

      <path d="M10 18h4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function buildOffersHref(
  state:
    CatalogState,
  page =
    1
) {
  const params =
    new URLSearchParams();

  if (
    state.query
  ) {
    params.set(
      "q",
      state.query
    );
  }

  if (
    state.category
  ) {
    params.set(
      "category",
      state.category
    );
  }

  if (
    state.maxPrice
  ) {
    params.set(
      "maxPrice",
      state.maxPrice
    );
  }

  if (
    state.sort !==
    "newest"
  ) {
    params.set(
      "sort",
      state.sort
    );
  }

  if (
    page >
    1
  ) {
    params.set(
      "page",
      String(
        page
      )
    );
  }

  const search =
    params.toString();

  return search
    ? `/okazje?${search}`
    : "/okazje";
}

function getVisiblePages(
  currentPage:
    number,
  totalPages:
    number
): Array<
  number |
  null
> {
  if (
    totalPages <=
    7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (
        _,
        index
      ) =>
        index +
        1
    );
  }

  if (
    currentPage <=
    4
  ) {
    return [
      1,
      2,
      3,
      4,
      5,
      null,
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages -
      3
  ) {
    return [
      1,
      null,
      totalPages -
        4,
      totalPages -
        3,
      totalPages -
        2,
      totalPages -
        1,
      totalPages,
    ];
  }

  return [
    1,
    null,
    currentPage -
      1,
    currentPage,
    currentPage +
      1,
    null,
    totalPages,
  ];
}

function parsePage(
  value:
    string |
    undefined
) {
  const parsed =
    Number(
      value
    );

  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <
      1
  ) {
    return 1;
  }

  return Math.floor(
    parsed
  );
}

function getRangeLabel(
  pageStart:
    number,
  pageCount:
    number,
  totalResults:
    number
) {
  if (
    totalResults ===
    0
  ) {
    return "Brak wyników";
  }

  return `Pokazujemy ${pageStart + 1}–${pageStart + pageCount} z ${totalResults}`;
}

function getResultLabel(
  count:
    number
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