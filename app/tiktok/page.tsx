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

  const title =
    "Produkty z naszych TikToków";

  const description =
    "Wszystkie produkty, które aktualnie pokazujemy i promujemy w materiałach Trend za Mniej na TikToku, zebrane w jednym miejscu.";

  return {
    title,

    description,

    alternates: {
      canonical:
        "/tiktok",
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
        "/tiktok",

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
            "Trend za Mniej - produkty z TikToka",
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
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="inline-flex min-h-8 items-center gap-2 rounded-full bg-stone-950 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />

                Z naszych materiałów
              </div>

              <h1 className="mt-4 max-w-4xl text-balance text-[36px] font-black leading-[1.01] tracking-[-0.055em] text-stone-950 sm:text-[48px] lg:text-[60px]">
                Widziałeś produkt
                na naszym TikToku?

                <span className="text-stone-400">
                  {" "}
                  Znajdziesz go tutaj.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base sm:leading-8">
                Zebraliśmy w jednym
                miejscu produkty,
                które aktualnie
                pokazujemy w naszych
                materiałach. Nie musisz
                przeszukiwać całego
                katalogu ani wracać
                do konkretnego filmu.
              </p>
            </div>

            <div className="rounded-[24px] border border-black/[0.06] bg-[#f7f7f8] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Aktualnie na stronie
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black tracking-[-0.05em] text-stone-950">
                    {
                      allTikTokProducts.length
                    }
                  </p>

                  <p className="mt-1 text-xs font-semibold text-stone-400">
                    {getProductCountLabel(
                      allTikTokProducts.length
                    )}
                  </p>
                </div>

                <Link
                  href="/okazje"
                  className="inline-flex min-h-10 items-center justify-center rounded-[13px] bg-white px-3.5 text-[11px] font-black text-stone-700 shadow-sm transition hover:text-rose-600"
                >
                  Wszystkie okazje →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-[22px] border border-amber-100 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-xs font-black text-amber-700 shadow-sm">
                i
              </span>

              <div className="min-w-0">
                <p className="text-xs font-black text-amber-950">
                  Informacja afiliacyjna
                </p>

                <p className="mt-1 max-w-4xl text-[11px] leading-5 text-amber-900/75 sm:text-xs sm:leading-6">
                  Trend za Mniej nie jest
                  sklepem. Pokazujemy
                  wybrane produkty i możemy
                  otrzymać prowizję za
                  kwalifikujący się zakup
                  po przejściu przez nasz
                  link. Cena, dostępność,
                  rozmiary i promocje mogą
                  zmienić się w sklepie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <form
          action="/tiktok"
          method="get"
          className="rounded-[24px] border border-black/[0.06] bg-white p-3 shadow-[0_12px_35px_rgba(28,25,23,0.04)] sm:p-4"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
            <div>
              <label
                htmlFor="tiktok-search"
                className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-stone-400"
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
                  className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] py-2 pl-11 pr-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tiktok-category"
                className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-stone-400"
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
                className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] px-3 text-sm font-bold text-stone-800 outline-none transition focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
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
              className="flex min-h-12 items-center justify-center rounded-[15px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-rose-600"
            >
              Pokaż
            </button>
          </div>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-stone-400">
                Aktywne filtry
              </p>

              {query && (
                <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-700">
                  „
                  {
                    query
                  }
                  ”
                </span>
              )}

              {category && (
                <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-700">
                  {
                    category
                  }
                </span>
              )}

              <Link
                href="/tiktok"
                className="ml-auto text-[10px] font-black text-stone-500 transition hover:text-rose-600"
              >
                Wyczyść
              </Link>
            </div>
          )}
        </form>

        <div className="mt-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
              Z TikToka
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl">
              {hasFilters
                ? "Pasujące produkty"
                : "Najnowsze promowane produkty"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-stone-400 sm:text-sm">
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
      </section>

      <section className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-5 rounded-[26px] bg-stone-950 p-6 text-white sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-300">
                Chcesz więcej?
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                Zobacz cały katalog
                Trend za Mniej
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
                Na tej stronie pokazujemy
                tylko aktualnie promowane
                produkty. Pełny katalog
                znajdziesz w sekcji okazji.
              </p>
            </div>

            <Link
              href="/okazje"
              className="flex min-h-12 items-center justify-center rounded-[16px] bg-white px-6 text-sm font-black text-stone-950 transition hover:bg-rose-50 md:min-w-[210px]"
            >
              Wszystkie produkty →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function EmptyState({
  hasFilters,
}: {
  hasFilters:
    boolean;
}) {
  return (
    <div className="mt-5 rounded-[26px] border border-dashed border-black/[0.08] bg-white px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-stone-100 text-stone-500">
        <SearchLargeIcon />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-stone-950">
        {hasFilters
          ? "Nie znaleźliśmy pasującego produktu"
          : "Tu za chwilę pojawią się produkty z naszych TikToków"}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-stone-500">
        {hasFilters
          ? "Spróbuj krótszej frazy, wybierz inną kategorię albo wyczyść filtry."
          : "Gdy oznaczymy produkt w panelu administratora jako promowany na TikToku, automatycznie pojawi się na tej stronie."}
      </p>

      <Link
        href={
          hasFilters
            ? "/tiktok"
            : "/okazje"
        }
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[14px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-rose-600"
      >
        {hasFilters
          ? "Wyczyść filtry"
          : "Zobacz wszystkie okazje"}
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