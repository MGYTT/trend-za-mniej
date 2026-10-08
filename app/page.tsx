import type {
  ReactNode,
} from "react";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  getFeaturedProducts,
  getProducts,
  type Product,
} from "@/lib/products";

export const revalidate =
  60;

type HomeCategory = {
  name: string;
  href: string;
};

export default async function Home() {
  const [
    products,
    featuredProducts,
  ] =
    await Promise.all([
      getProducts(),
      getFeaturedProducts(),
    ]);

  const hotProducts =
    (
      featuredProducts.length >
      0
        ? featuredProducts
        : products
    ).slice(
      0,
      4
    );

  const latestProducts =
    products.slice(
      0,
      4
    );

  const categoryNames = [
    ...new Set(
      products
        .map(
          (
            product
          ) =>
            product.category
        )
        .filter(
          Boolean
        )
    ),
  ];

  const categories:
    HomeCategory[] =
    categoryNames
      .map(
        (
          category
        ) => ({
          name:
            category,

          href:
            `/kategoria/${slugifyCategory(
              category
            )}`,
        })
      )
      .slice(
        0,
        8
      );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <Hero
        productsCount={
          products.length
        }
      />

      <CategoryBar
        categories={
          categories
        }
      />

      <ProductSection
        eyebrow="Wybrane dla Ciebie"
        title="Gorące okazje"
        description="Produkty, które warto sprawdzić w pierwszej kolejności."
        products={
          hotProducts
        }
        href="/okazje"
        linkLabel="Wszystkie okazje"
      />

      <ProductSection
        id="najnowsze"
        eyebrow="Ostatnio dodane"
        title="Najnowsze znaleziska"
        description="Najświeższe produkty dodane do Trend za Mniej."
        products={
          latestProducts
        }
        href="/okazje?sort=newest"
        linkLabel="Zobacz więcej"
        alternate
      />

      <SimpleInfo />

      <SiteFooter />
    </main>
  );
}

function Hero({
  productsCount,
}: {
  productsCount: number;
}) {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600 sm:text-sm">
            Trend za Mniej
          </p>

          <h1 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.045em] text-stone-900 sm:text-5xl lg:text-[58px]">
            Znajdź modne rzeczy{" "}
            <span className="text-rose-600">
              bez długiego szukania
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
            Wybrane ubrania,
            dodatki i ciekawe
            okazje zebrane w
            jednym miejscu.
          </p>

          <form
            action="/okazje"
            method="get"
            className="mx-auto mt-7 max-w-2xl"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
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

                <input
                  type="search"
                  name="q"
                  placeholder="Szukaj np. swetra, bluzy, sukienki..."
                  aria-label="Szukaj produktów"
                  className="min-h-[56px] w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-4 text-base outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <button
                type="submit"
                className="min-h-[56px] rounded-2xl bg-rose-600 px-7 font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
              >
                Szukaj
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col justify-center gap-2 min-[420px]:flex-row">
            <Link
              href="/okazje"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Zobacz wszystkie okazje
            </Link>

            <Link
              href="/okazje?maxPrice=50"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Okazje do 50 zł
            </Link>
          </div>

          <div className="mt-6 text-xs font-semibold text-stone-400 sm:text-sm">
            {productsCount}{" "}
            {getProductWord(
              productsCount
            )}{" "}
            dostępnych teraz
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryBar({
  categories,
}: {
  categories:
    HomeCategory[];
}) {
  if (
    categories.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="kategorie"
      className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
    >
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <p className="shrink-0 text-sm font-black text-stone-900">
            Popularne kategorie
          </p>

          <Link
            href="/okazje"
            className="hidden shrink-0 text-xs font-black text-rose-600 transition hover:text-rose-700 sm:block"
          >
            Wszystkie →
          </Link>
        </div>

        <div className="horizontal-scroll -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map(
            (
              category
            ) => (
              <Link
                key={
                  category.name
                }
                href={
                  category.href
                }
                className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                {
                  category.name
                }
              </Link>
            )
          )}

          <Link
            href="/okazje"
            className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-rose-100 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 sm:hidden"
          >
            Wszystkie →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  id,
  eyebrow,
  title,
  description,
  products,
  href,
  linkLabel,
  alternate = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  href: string;
  linkLabel: string;
  alternate?: boolean;
}) {
  return (
    <section
      id={id}
      className={[
        "scroll-mt-24 border-b border-stone-200",
        alternate
          ? "bg-white"
          : "bg-stone-50",
      ].join(
        " "
      )}
    >
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <SectionHeader
          eyebrow={
            eyebrow
          }
          title={
            title
          }
          description={
            description
          }
          href={
            href
          }
          linkLabel={
            linkLabel
          }
        />

        {products.length >
        0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
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

            <Link
              href={
                href
              }
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:hidden"
            >
              {
                linkLabel
              }{" "}
              →
            </Link>
          </>
        ) : (
          <EmptyBox>
            Brak produktów
            do wyświetlenia.
          </EmptyBox>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          {description}
        </p>
      </div>

      <Link
        href={
          href
        }
        className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function SimpleInfo() {
  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <div className="grid gap-4 rounded-[24px] border border-stone-200 bg-white p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-xl font-black tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Znajdź produkt.
              Sprawdź szczegóły.
              Zdecyduj.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
              Trend za Mniej zbiera
              wybrane produkty w
              jednym miejscu.
              Aktualną cenę,
              dostępność i warianty
              zawsze sprawdzisz
              bezpośrednio w sklepie.
            </p>
          </div>

          <Link
            href="/okazje"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white transition hover:bg-rose-700 md:min-w-[190px]"
          >
            Przeglądaj okazje
          </Link>
        </div>
      </div>
    </section>
  );
}

function EmptyBox({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[20px] border border-dashed border-stone-200 bg-white px-5 py-10 text-center text-sm leading-6 text-stone-500">
      {children}
    </div>
  );
}

function getProductWord(
  count: number
) {
  if (
    count ===
    1
  ) {
    return "produkt";
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
    return "produktów";
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return "produkty";
  }

  return "produktów";
}