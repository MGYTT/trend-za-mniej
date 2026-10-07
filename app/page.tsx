import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";

import {
  getFeaturedProducts,
  getProducts,
} from "@/lib/products";

const categories = [
  {
    name: "Swetry",
    emoji: "🧥",
    description:
      "Ciepłe i modne modele",
    href: "/okazje?category=Swetry",
  },
  {
    name: "Bluzy",
    emoji: "🧶",
    description:
      "Wygodne modele na co dzień",
    href: "/okazje?category=Bluzy",
  },
  {
    name: "Topy",
    emoji: "👚",
    description:
      "Lekkie i modne fasony",
    href: "/okazje?category=Topy",
  },
  {
    name: "Do 100 zł",
    emoji: "💰",
    description:
      "Znaleziska w dobrej cenie",
    href: "/okazje?maxPrice=100",
  },
];

export const revalidate = 60;

export default async function Home() {
  const [
    products,
    featuredProducts,
  ] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ]);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <BrandLogo />

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link
              href="/okazje"
              className="transition hover:text-rose-600"
            >
              Wszystkie okazje
            </Link>

            <a
              href="#kategorie"
              className="transition hover:text-rose-600"
            >
              Kategorie
            </a>

            <a
              href="#najnowsze"
              className="transition hover:text-rose-600"
            >
              Najnowsze
            </a>

            <a
              href="#o-nas"
              className="transition hover:text-rose-600"
            >
              O nas
            </a>
          </nav>

          <Link
            href="/okazje"
            className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            🔥 Okazje
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <div className="inline-flex rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur">
            🔥 Codziennie nowe modne znaleziska
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Modne rzeczy{" "}
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              bez przepłacania
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
            Wyszukujemy ciekawe
            ubrania, dodatki i
            promocje, żebyś nie
            musiał przeglądać setek
            produktów.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/okazje"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              🔥 Zobacz wszystkie okazje
            </Link>

            <a
              href="#kategorie"
              className="rounded-full border border-rose-200 bg-white px-8 py-4 font-bold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 hover:shadow-md"
            >
              Przeglądaj kategorie
            </a>
          </div>
        </div>
      </section>

      <section
        id="kategorie"
        className="mx-auto max-w-7xl px-6 py-16"
      >
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
            Przeglądaj
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Popularne kategorie
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(
            (category) => (
              <Link
                href={
                  category.href
                }
                key={
                  category.name
                }
                className="group rounded-3xl border border-rose-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-3xl transition group-hover:scale-110">
                  {
                    category.emoji
                  }
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {
                    category.name
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {
                    category.description
                  }
                </p>

                <p className="mt-4 text-sm font-bold text-rose-600">
                  Zobacz oferty →
                </p>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
              🔥 Trend za Mniej
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Gorące okazje
            </h2>
          </div>

          <Link
            href="/okazje"
            className="font-bold text-rose-600 hover:text-rose-700"
          >
            Zobacz wszystkie →
          </Link>
        </div>

        {featuredProducts.length >
        0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map(
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
          <EmptyProducts />
        )}
      </section>

      <section
        id="najnowsze"
        className="bg-gradient-to-b from-white to-rose-50/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
                ✨ Nowości
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Najnowsze znaleziska
              </h2>
            </div>

            <Link
              href="/okazje"
              className="font-bold text-rose-600 hover:text-rose-700"
            >
              Wszystkie produkty →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products
                .slice(0, 6)
                .map(
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
            <EmptyProducts />
          )}
        </div>
      </section>

      <section
        id="o-nas"
        className="border-t border-rose-100 bg-white"
      >
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">
            ✨
          </div>

          <h2 className="mt-5 text-3xl font-black md:text-4xl">
            O Trend za Mniej
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-600">
            Wyszukujemy modne
            produkty, promocje i
            ciekawe okazje zakupowe.
          </p>

          <div className="mt-8 rounded-3xl border border-rose-100 bg-rose-50/50 p-6 text-sm leading-6 text-stone-600">
            <strong className="text-stone-800">
              Informacja o afiliacji:
            </strong>{" "}
            część linków na stronie
            to linki afiliacyjne.
            Możemy otrzymać prowizję
            od zakupu bez dodatkowych
            kosztów dla kupującego.
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function EmptyProducts() {
  return (
    <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-16 text-center">
      <div className="text-5xl">
        🛍️
      </div>

      <h3 className="mt-4 text-xl font-bold">
        Wkrótce nowe okazje
      </h3>
    </div>
  );
}
