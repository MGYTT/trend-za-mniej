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
    params.q?.trim() ?? "";

  const category =
    params.category &&
    params.category !==
      "all"
      ? params.category
      : "";

  const maxPrice =
    params.maxPrice ?? "";

  const sort =
    params.sort ?? "";

  const hasFilters =
    Boolean(query) ||
    Boolean(category) ||
    Boolean(maxPrice) ||
    Boolean(
      sort &&
        sort !== "newest"
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

      follow: true,
    },

    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: "/okazje",
      title,
      description,
    },
  };
}

export default async function OffersPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const query =
    params.q?.trim() ?? "";

  const category =
    params.category &&
    params.category !==
      "all"
      ? params.category
      : "";

  const maxPrice =
    params.maxPrice ?? "";

  const parsedMaxPrice =
    maxPrice === ""
      ? undefined
      : Number(
          maxPrice
        );

  const allowedSorts: ProductSort[] =
    [
      "newest",
      "price-asc",
      "price-desc",
    ];

  const sort: ProductSort =
    allowedSorts.includes(
      params.sort as ProductSort
    )
      ? (
          params.sort as ProductSort
        )
      : "newest";

  const [
    products,
    categories,
  ] = await Promise.all([
    getProducts({
      query,

      category:
        category ||
        undefined,

      maxPrice:
        parsedMaxPrice,

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

  const activeFilters =
    [
      query
        ? `Szukasz: ${query}`
        : null,

      category ||
        null,

      maxPrice
        ? `Do ${maxPrice} zł`
        : null,

      sort ===
      "price-asc"
        ? "Cena: od najniższej"
        : null,

      sort ===
      "price-desc"
        ? "Cena: od najwyższej"
        : null,
    ].filter(
      Boolean
    ) as string[];

  const resultLabel =
    getResultLabel(
      products.length
    );

  const quickCategories =
    categories.slice(
      0,
      7
    );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                Trend za Mniej
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                Wszystkie okazje
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                Wyszukuj, filtruj
                i przeglądaj wybrane
                produkty w jednym
                miejscu.
              </p>
            </div>

            <div className="w-fit rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600">
              {resultLabel}
            </div>
          </div>

          {quickCategories.length >
            0 && (
            <div className="horizontal-scroll -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <Link
                href="/okazje"
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                  !category
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:text-rose-700",
                ].join(
                  " "
                )}
              >
                Wszystkie
              </Link>

              {quickCategories.map(
                (item) => (
                  <Link
                    key={
                      item
                    }
                    href={`/okazje?category=${encodeURIComponent(
                      item
                    )}`}
                    className={[
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                      category ===
                      item
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:text-rose-700",
                    ].join(
                      " "
                    )}
                  >
                    {item}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
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

            <div className="mt-4 hidden rounded-[22px] border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-500 lg:block">
              <p className="font-black text-stone-900">
                Szukasz konkretnej
                kategorii?
              </p>

              <p className="mt-1">
                Dedykowane strony
                kategorii zawierają
                również dodatkowe
                informacje i najnowsze
                produkty.
              </p>

              {category && (
                <Link
                  href={`/kategoria/${slugifyCategory(
                    category
                  )}`}
                  className="mt-3 inline-flex font-black text-rose-600 hover:text-rose-700"
                >
                  Zobacz stronę
                  kategorii →
                </Link>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                  Wyniki
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                  {hasFilters
                    ? "Pasujące produkty"
                    : "Najnowsze znaleziska"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {products.length >
                  0
                    ? `${resultLabel}.`
                    : "Brak produktów spełniających wybrane kryteria."}
                </p>
              </div>

              {category && (
                <Link
                  href={`/kategoria/${slugifyCategory(
                    category
                  )}`}
                  className="inline-flex w-fit min-h-10 items-center rounded-full bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                >
                  {category} →
                </Link>
              )}
            </div>

            {activeFilters.length >
              0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeFilters.map(
                  (
                    filter
                  ) => (
                    <span
                      key={
                        filter
                      }
                      className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600"
                    >
                      {filter}
                    </span>
                  )
                )}

                <Link
                  href="/okazje"
                  className="rounded-full px-3 py-1.5 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                >
                  Wyczyść
                </Link>
              </div>
            )}

            {products.length >
            0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {products.map(
                  (product) => (
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
              <EmptyResults />
            )}

            {products.length >
              0 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[22px] border border-stone-200 bg-white p-5 text-center sm:flex-row sm:text-left">
                <div>
                  <p className="font-black">
                    Chcesz zobaczyć
                    więcej?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Usuń filtry i wróć
                    do pełnej listy
                    ofert.
                  </p>
                </div>

                <Link
                  href="/okazje"
                  className="flex min-h-11 w-full shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:w-auto"
                >
                  Wszystkie okazje
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function EmptyResults() {
  return (
    <div className="mt-6 rounded-[22px] border border-dashed border-stone-200 bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl">
        🔎
      </div>

      <h3 className="mt-4 text-xl font-black sm:text-2xl">
        Nic nie znaleźliśmy
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
        Spróbuj innej frazy,
        kategorii albo zwiększ
        maksymalną cenę.
      </p>

      <Link
        href="/okazje"
        className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 font-black text-white transition hover:bg-rose-700"
      >
        Wyczyść filtry
      </Link>
    </div>
  );
}

function getResultLabel(
  count: number
) {
  if (count === 1) {
    return "1 oferta";
  }

  const lastTwo =
    count % 100;

  const last =
    count % 10;

  if (
    lastTwo >= 12 &&
    lastTwo <= 14
  ) {
    return `${count} ofert`;
  }

  if (
    last >= 2 &&
    last <= 4
  ) {
    return `${count} oferty`;
  }

  return `${count} ofert`;
}