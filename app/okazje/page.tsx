import type {
  Metadata,
} from "next";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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
    params.category !== "all"
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
    "Przeglądaj modne produkty, promocje i okazje. Wyszukuj ubrania i dodatki w dobrych cenach.";

  if (category) {
    title =
      `${category} - modne okazje`;

    description =
      `Przeglądaj produkty z kategorii ${category} i znajdź modne okazje w dobrej cenie.`;
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
    params.category !== "all"
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

  const allowedSorts: ProductSort[] = [
    "newest",
    "price-asc",
    "price-desc",
  ];

  const sort: ProductSort =
    allowedSorts.includes(
      params.sort as ProductSort
    )
      ? (params.sort as ProductSort)
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
        ? {
            label:
              `Szukasz: ${query}`,
          }
        : null,

      category
        ? {
            label:
              category,
          }
        : null,

      maxPrice
        ? {
            label:
              `Do ${maxPrice} zł`,
          }
        : null,

      sort ===
      "price-asc"
        ? {
            label:
              "Cena: od najniższej",
          }
        : null,

      sort ===
      "price-desc"
        ? {
            label:
              "Cena: od najwyższej",
          }
        : null,
    ].filter(
      Boolean
    ) as {
      label: string;
    }[];

  const resultLabel =
    getResultLabel(
      products.length
    );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="border-b border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
                Trend za Mniej
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Wszystkie okazje
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
                Przeglądaj produkty,
                wyszukuj po nazwie,
                filtruj według
                kategorii i wybieraj
                oferty w swoim
                budżecie.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🛍️
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-500">
                  Znaleziono
                </p>

                <p className="font-black text-stone-900">
                  {
                    resultLabel
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
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

        {activeFilters.length >
          0 && (
          <section className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
                Aktywne
              </span>

              {activeFilters.map(
                (
                  filter,
                  index
                ) => (
                  <span
                    key={`${filter.label}-${index}`}
                    className="rounded-full border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm"
                  >
                    {
                      filter.label
                    }
                  </span>
                )
              )}

              <Link
                href="/okazje"
                className="rounded-full px-3 py-2 text-xs font-black text-stone-500 transition hover:bg-stone-100 hover:text-rose-700"
              >
                Wyczyść
              </Link>
            </div>
          </section>
        )}

        <section className="mt-7 sm:mt-9">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                Wyniki
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                {hasFilters
                  ? "Pasujące oferty"
                  : "Najnowsze znaleziska"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                {products.length >
                0
                  ? `${resultLabel}. Kliknij produkt, aby zobaczyć szczegóły i przejść do oferty sklepu.`
                  : "Nie znaleźliśmy produktów pasujących do wybranych filtrów."}
              </p>
            </div>

            {category && (
              <Link
                href={`/okazje?category=${encodeURIComponent(
                  category
                )}`}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700"
              >
                <span>
                  {
                    category
                  }
                </span>

                <span
                  aria-hidden="true"
                  className="text-rose-400"
                >
                  →
                </span>
              </Link>
            )}
          </div>

          {products.length >
          0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>

        {products.length >
          0 && (
          <section className="mt-10 rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-stone-900">
                  Nie znalazłeś
                  tego, czego
                  szukasz?
                </p>

                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Wyczyść filtry i
                  zobacz wszystkie
                  dostępne oferty.
                </p>
              </div>

              <Link
                href="/okazje"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-50 px-6 font-black text-rose-700 transition hover:bg-rose-100"
              >
                Pokaż wszystkie
              </Link>
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}

function EmptyResults() {
  return (
    <div className="mt-6 rounded-[28px] border border-dashed border-rose-200 bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-3xl">
        🔎
      </div>

      <h3 className="mt-5 text-2xl font-black">
        Brak pasujących ofert
      </h3>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500 sm:text-base">
        Spróbuj użyć innej frazy,
        zwiększyć limit ceny albo
        wybrać inną kategorię.
      </p>

      <Link
        href="/okazje"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        Wyczyść wszystkie filtry
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