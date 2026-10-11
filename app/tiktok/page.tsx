import type {
  Metadata,
} from "next";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  getTikTokProducts,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

type Props = {
  searchParams:
    Promise<{
      q?: string;
      category?: string;
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

  const hasFilters =
    Boolean(
      query
    ) ||
    Boolean(
      category
    );

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/tiktok`;

  const title =
    "Produkty z naszych TikToków";

  const description =
    "Produkty pokazywane przez Trend za Mniej na TikToku zebrane w jednym miejscu. Znajdź produkt z filmu bez przeszukiwania całego katalogu.";

  return {
    title,

    description,

    alternates: {
      canonical:
        pageUrl,
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
        SITE_LANGUAGE,

      url:
        pageUrl,

      siteName:
        SITE_NAME,

      title:
        `${title} | ${SITE_NAME}`,

      description,

      images: [
        {
          url:
            `${siteUrl}/opengraph-image`,

          width:
            1200,

          height:
            630,

          alt:
            "Trend za Mniej - produkty z TikToka",
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        `${title} | ${SITE_NAME}`,

      description,

      images: [
        `${siteUrl}/opengraph-image`,
      ],
    },
  };
}

export default async function TikTokPage({
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

  const products =
    await getTikTokProducts({
      query,

      category:
        category ||
        undefined,
    });

  const allTikTokProducts =
    query ||
    category
      ? await getTikTokProducts()
      : products;

  const categories =
    [
      ...new Set(
        allTikTokProducts.map(
          (
            product
          ) =>
            product.category
        )
      ),
    ].sort(
      (
        first,
        second
      ) =>
        first.localeCompare(
          second,
          "pl"
        )
    );

  const hasFilters =
    Boolean(
      query
    ) ||
    Boolean(
      category
    );

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/tiktok`;

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
                "Produkty z naszych TikToków",

              description:
                "Produkty aktualnie prezentowane przez Trend za Mniej w materiałach na TikToku.",

              inLanguage:
                SITE_LANGUAGE,

              isPartOf: {
                "@id":
                  `${siteUrl}/#website`,
              },

              mainEntity: {
                "@id":
                  `${pageUrl}#products`,
              },
            },

            {
              "@type":
                "ItemList",

              "@id":
                `${pageUrl}#products`,

              name:
                "Produkty z TikToka",

              numberOfItems:
                products.length,

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

  return (
    <main className="min-h-screen bg-white pb-24 text-stone-900 lg:pb-0">
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
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

                Produkty z naszych materiałów
              </div>

              <h1 className="mt-4 max-w-4xl text-balance text-[34px] font-black leading-[1.02] tracking-[-0.05em] text-stone-900 sm:text-[44px] lg:text-[52px]">
                Produkty z naszych
                TikToków

                <span className="text-rose-600">
                  {" "}
                  w jednym miejscu.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base sm:leading-8">
                Widziałeś produkt
                w naszym materiale?
                Tutaj znajdziesz rzeczy,
                które aktualnie pokazujemy,
                bez przeszukiwania całego
                katalogu i wracania
                do konkretnego filmu.
              </p>

              <div className="mt-6 flex flex-col gap-2 min-[460px]:flex-row">
                <a
                  href="#produkty"
                  className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  Zobacz produkty
                </a>

                <Link
                  href="/okazje"
                  className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  Wszystkie okazje
                </Link>
              </div>
            </div>

            <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Aktualnie promujemy
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[44px] font-black leading-none tracking-[-0.055em] text-stone-900">
                    {
                      allTikTokProducts.length
                    }
                  </p>

                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    {getProductCountLabel(
                      allTikTokProducts.length
                    )}
                  </p>
                </div>

                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-rose-600 shadow-sm">
                  <TikTokProductsIcon />
                </span>
              </div>

              <div className="mt-5 border-t border-stone-200 pt-4">
                <p className="text-[11px] leading-5 text-stone-500">
                  Nowo dodane produkty
                  pojawiają się tutaj
                  automatycznie po
                  oznaczeniu ich w panelu
                  administratora.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-[18px] border border-stone-200 bg-stone-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-white text-xs font-black text-rose-600 shadow-sm">
              i
            </span>

            <div>
              <p className="text-xs font-black text-stone-800">
                Informacja afiliacyjna
              </p>

              <p className="mt-1 max-w-5xl text-[11px] leading-5 text-stone-500 sm:text-xs sm:leading-6">
                Trend za Mniej nie jest
                sklepem. Część linków ma
                charakter afiliacyjny
                i możemy otrzymać prowizję
                po zakupie. Cena,
                dostępność, rozmiary
                i promocje mogą zmienić się
                po przejściu do sklepu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="produkty"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <form
            action="/tiktok"
            method="get"
            className="rounded-[22px] border border-stone-200 bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
              <div>
                <label
                  htmlFor="tiktok-search"
                  className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-stone-500"
                >
                  Szukaj produktu
                </label>

                <div className="relative">
                  <SearchIcon />

                  <input
                    id="tiktok-search"
                    type="search"
                    name="q"
                    defaultValue={
                      query
                    }
                    placeholder="Np. szczoteczka, torebka, sukienka..."
                    className="min-h-12 w-full rounded-[15px] border border-stone-200 bg-stone-50 py-2 pl-11 pr-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tiktok-category"
                  className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-stone-500"
                >
                  Kategoria
                </label>

                <select
                  id="tiktok-category"
                  name="category"
                  defaultValue={
                    category ||
                    "all"
                  }
                  className="min-h-12 w-full rounded-[15px] border border-stone-200 bg-stone-50 px-3 text-sm font-bold text-stone-800 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
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
              </div>

              <button
                type="submit"
                className="flex min-h-12 items-center justify-center rounded-[15px] bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
              >
                Pokaż
              </button>
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                  Aktywne filtry
                </p>

                {query && (
                  <ActiveFilter>
                    „
                    {
                      query
                    }
                    ”
                  </ActiveFilter>
                )}

                {category && (
                  <ActiveFilter>
                    {
                      category
                    }
                  </ActiveFilter>
                )}

                <Link
                  href="/tiktok"
                  className="ml-auto inline-flex min-h-8 items-center rounded-full px-3 text-[10px] font-black text-stone-500 transition hover:bg-stone-50 hover:text-rose-600"
                >
                  Wyczyść
                </Link>
              </div>
            )}
          </form>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Z naszych TikToków
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl">
                {hasFilters
                  ? "Pasujące produkty"
                  : "Aktualnie promowane produkty"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
                {hasFilters
                  ? "Produkty pasujące do wyszukiwania i wybranej kategorii."
                  : "Wszystkie rzeczy, które aktualnie pokazujemy w naszych materiałach."}
              </p>
            </div>

            <div className="w-fit rounded-[14px] bg-stone-50 px-3.5 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
                Znaleziono
              </p>

              <p className="mt-0.5 text-sm font-black text-stone-800">
                {products.length ===
                allTikTokProducts.length
                  ? getResultLabel(
                      products.length
                    )
                  : `${getResultLabel(
                      products.length
                    )} z ${allTikTokProducts.length}`}
              </p>
            </div>
          </div>

          {products.length >
          0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
            <EmptyState
              hasFilters={
                hasFilters
              }
            />
          )}

          {products.length >
            0 && (
            <div className="mt-8 rounded-[22px] border border-stone-200 bg-stone-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-stone-900">
                    Nie widzisz produktu
                    z filmu?
                  </p>

                  <p className="mt-1 max-w-2xl text-xs leading-6 text-stone-500">
                    Sprawdź pełny katalog.
                    Produkt może nadal być
                    dostępny na stronie,
                    nawet jeśli nie jest już
                    aktualnie promowany
                    na TikToku.
                  </p>
                </div>

                <Link
                  href="/okazje"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[14px] bg-stone-900 px-5 text-xs font-black text-white transition hover:bg-stone-800"
                >
                  Wszystkie okazje →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ActiveFilter({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-rose-100 bg-rose-50 px-3 text-[10px] font-black text-rose-700">
      {
        children
      }
    </span>
  );
}

function EmptyState({
  hasFilters,
}: {
  hasFilters:
    boolean;
}) {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-stone-200 bg-stone-50 px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-white text-stone-500 shadow-sm">
        <SearchLargeIcon />
      </div>

      <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-stone-900">
        {hasFilters
          ? "Nie znaleźliśmy pasującego produktu"
          : "Brak aktualnie promowanych produktów"}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-stone-500">
        {hasFilters
          ? "Spróbuj krótszej frazy, wybierz inną kategorię albo wyczyść filtry."
          : "Gdy produkt zostanie oznaczony w panelu administratora jako promowany na TikToku, pojawi się tutaj automatycznie."}
      </p>

      <Link
        href={
          hasFilters
            ? "/tiktok"
            : "/okazje"
        }
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700"
      >
        {hasFilters
          ? "Wyczyść filtry"
          : "Przejdź do katalogu"}
      </Link>
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
      className="h-5 w-5"
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

function TikTokProductsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7h12v13H6z" />

      <path d="M9 7a3 3 0 0 1 6 0" />

      <path d="M9 12h6" />

      <path d="M9 16h4" />
    </svg>
  );
}

function getResultLabel(
  count:
    number
) {
  if (
    count ===
    1
  ) {
    return "1 produkt";
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
    return `${count} produktów`;
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return `${count} produkty`;
  }

  return `${count} produktów`;
}

function getProductCountLabel(
  count:
    number
) {
  if (
    count ===
    1
  ) {
    return "promowany produkt";
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
    return "promowanych produktów";
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return "promowane produkty";
  }

  return "promowanych produktów";
}