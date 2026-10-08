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
    );

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

  if (
    category
  ) {
    pageTitle =
      category;
  }

  if (
    query
  ) {
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

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                Produkty i okazje
              </p>

              <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl lg:text-5xl">
                Znajdź coś dla
                siebie{" "}
                <span className="text-rose-600">
                  w kilka sekund
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                Wyszukaj konkretny
                produkt albo wybierz
                kategorię, budżet
                lub najnowsze
                znaleziska.
              </p>
            </div>

            <Link
              href="/promocje-shein"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800 lg:min-w-[210px]"
            >
              <span
                aria-hidden="true"
              >
                🔥
              </span>

              Promocje SHEIN
            </Link>
          </div>

          <div className="horizontal-scroll -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <QuickLink
              href="/okazje"
              icon="✨"
              label="Wszystkie"
              active={
                !hasFilters
              }
            />

            <QuickLink
              href="/okazje?maxPrice=50"
              icon="💸"
              label="Do 50 zł"
              active={
                maxPrice ===
                  "50" &&
                !query &&
                !category
              }
            />

            <QuickLink
              href="/okazje?maxPrice=100"
              icon="🏷️"
              label="Do 100 zł"
              active={
                maxPrice ===
                  "100" &&
                !query &&
                !category
              }
            />

            <QuickLink
              href="/okazje?sort=newest"
              icon="🆕"
              label="Najnowsze"
              active={
                sort ===
                  "newest" &&
                !query &&
                !category &&
                !maxPrice
              }
            />

            <QuickLink
              href="/promocje-shein"
              icon="🎟️"
              label="Kody i promocje"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 hidden lg:block">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                Zawęź wyniki
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-400">
                Użyj filtrów tylko,
                jeśli chcesz znaleźć
                coś bardziej
                konkretnego.
              </p>
            </div>

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

            <div className="mt-4 hidden rounded-[18px] border border-stone-200 bg-white p-4 lg:block">
              <p className="text-xs font-black text-stone-800">
                Nie wiesz,
                czego szukasz?
              </p>

              <p className="mt-1 text-[11px] leading-5 text-stone-500">
                Sprawdź aktualne
                kampanie i kolekcje
                SHEIN.
              </p>

              <Link
                href="/promocje-shein"
                className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:bg-rose-100"
              >
                Zobacz promocje →
              </Link>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="rounded-[20px] border border-stone-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                    Wyniki
                  </p>

                  <h2 className="mt-1 truncate text-xl font-black tracking-[-0.025em] text-stone-900 sm:text-2xl">
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

                {hasFilters && (
                  <Link
                    href="/okazje"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-xs font-black text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Wyczyść wszystkie
                    filtry
                  </Link>
                )}
              </div>

              {hasFilters && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                  {query && (
                    <ActiveFilter>
                      Szukasz: „
                      {
                        query
                      }
                      ”
                    </ActiveFilter>
                  )}

                  {category && (
                    <ActiveFilter>
                      Kategoria:{" "}
                      {
                        category
                      }
                    </ActiveFilter>
                  )}

                  {safeMaxPrice && (
                    <ActiveFilter>
                      Do{" "}
                      {
                        safeMaxPrice
                      }{" "}
                      zł
                    </ActiveFilter>
                  )}

                  {sort ===
                    "price-asc" && (
                    <ActiveFilter>
                      Cena: od
                      najniższej
                    </ActiveFilter>
                  )}

                  {sort ===
                    "price-desc" && (
                    <ActiveFilter>
                      Cena: od
                      najwyższej
                    </ActiveFilter>
                  )}
                </div>
              )}
            </div>

            {category && (
              <div className="mt-3 flex justify-end">
                <Link
                  href={`/kategoria/${slugifyCategory(
                    category
                  )}`}
                  className="text-xs font-black text-rose-600 transition hover:text-rose-700"
                >
                  Dowiedz się więcej
                  o kategorii →
                </Link>
              </div>
            )}

            {products.length >
            0 ? (
              <>
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

                <div className="mt-8 rounded-[22px] border border-stone-200 bg-white p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-black text-stone-900">
                        Nie znalazłeś
                        nic dla siebie?
                      </p>

                      <p className="mt-1 text-xs leading-6 text-stone-500">
                        Sprawdź kampanie
                        SHEIN — część
                        z nich prowadzi
                        do dużych
                        kolekcji
                        i bestsellerów.
                      </p>
                    </div>

                    <Link
                      href="/promocje-shein"
                      className="flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-5 text-xs font-black text-white transition hover:bg-rose-600"
                    >
                      🔥 Zobacz promocje
                    </Link>
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
      </div>

      <SiteFooter />
    </main>
  );
}

function QuickLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className={[
        "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-black transition",
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-200 bg-stone-50 text-stone-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700",
      ].join(
        " "
      )}
    >
      <span
        aria-hidden="true"
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function ActiveFilter({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full bg-rose-50 px-3 text-[10px] font-black text-rose-700">
      {children}
    </span>
  );
}

function EmptyResults({
  query,
}: {
  query: string;
}) {
  return (
    <div className="mt-5 rounded-[22px] border border-stone-200 bg-white px-5 py-12 text-center sm:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-xl">
        🔎
      </div>

      <h3 className="mt-4 text-xl font-black text-stone-900">
        Nie znaleźliśmy
        pasujących produktów
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
        {query
          ? `Nie ma obecnie produktów pasujących do „${query}”. Spróbuj krótszej frazy, zmień filtry albo zobacz wszystkie okazje.`
          : "Spróbuj zwiększyć budżet, zmienić kategorię lub wyczyścić filtry."}
      </p>

      <div className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/okazje"
          className="flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800"
        >
          Pokaż wszystkie
        </Link>

        <Link
          href="/promocje-shein"
          className="flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          🔥 Promocje SHEIN
        </Link>
      </div>
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