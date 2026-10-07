import type {
  Metadata,
} from "next";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

import {
  getCategories,
  getProducts,
  ProductSort,
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
        sort !==
          "newest"
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
      type:
        "website",

      locale:
        "pl_PL",

      url:
        "/okazje",

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
    params.q?.trim() ??
    "";

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
      : Number(maxPrice);

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

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/">
            <div>
              <p className="text-2xl font-black">
                Trend za Mniej
              </p>

              <p className="text-xs text-stone-500">
                Moda i okazje
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-bold text-stone-600 hover:text-rose-600 sm:block"
            >
              Strona główna
            </Link>

            <Link
              href="/okazje"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              🛍️ Okazje
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <p className="font-bold text-rose-600">
            🛍️ Trend za Mniej
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Wszystkie okazje
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Wyszukuj produkty,
            filtruj po cenie i
            przeglądaj najlepsze
            modne znaleziska.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <ProductFilters
          categories={
            categories
          }
          query={query}
          category={
            category
          }
          maxPrice={
            maxPrice
          }
          sort={sort}
        />

        <div className="mt-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">
              Wyniki
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Znaleziono{" "}
              {
                products.length
              }{" "}
              {products.length ===
              1
                ? "ofertę"
                : "ofert"}
            </h2>
          </div>

          {category && (
            <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">
              {category}
            </div>
          )}
        </div>

        {products.length >
        0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="mt-8 rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-20 text-center">
            <div className="text-5xl">
              🔎
            </div>

            <h3 className="mt-5 text-2xl font-black">
              Brak wyników
            </h3>

            <p className="mx-auto mt-2 max-w-md text-stone-500">
              Spróbuj zmienić
              wyszukiwaną frazę,
              kategorię albo limit
              ceny.
            </p>

            <Link
              href="/okazje"
              className="mt-6 inline-flex rounded-2xl bg-rose-50 px-6 py-3 font-bold text-rose-700 hover:bg-rose-100"
            >
              Wyczyść filtry
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}