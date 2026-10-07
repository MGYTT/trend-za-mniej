import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  getFeaturedProducts,
  getProducts,
  type Product,
} from "@/lib/products";

export const revalidate = 60;

type CategoryConfig = {
  name: string;
  emoji: string;
  description: string;
  href: string;
  count: number;
};

export default async function Home() {
  const [
    products,
    featuredProducts,
  ] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ]);

  const latestProducts =
    products.slice(0, 8);

  const hotProducts =
    featuredProducts.slice(
      0,
      6
    );

  const categories: CategoryConfig[] = [
    {
      name: "Swetry",
      emoji: "🧥",
      description:
        "Ciepłe modele na chłodniejsze dni",
      href: "/okazje?category=Swetry",
      count:
        countCategory(
          products,
          "Swetry"
        ),
    },
    {
      name: "Bluzy",
      emoji: "🧶",
      description:
        "Wygodne fasony na co dzień",
      href: "/okazje?category=Bluzy",
      count:
        countCategory(
          products,
          "Bluzy"
        ),
    },
    {
      name: "Topy",
      emoji: "👚",
      description:
        "Lekkie i modne propozycje",
      href: "/okazje?category=Topy",
      count:
        countCategory(
          products,
          "Topy"
        ),
    },
    {
      name: "Do 100 zł",
      emoji: "💸",
      description:
        "Znaleziska w dobrej cenie",
      href: "/okazje?maxPrice=100",
      count:
        products.filter(
          (product) =>
            product.price <= 100
        ).length,
    },
  ];

  const benefits = [
    {
      icon: "✨",
      title:
        "Wybrane produkty",
      text:
        "Bez przeglądania setek ofert",
    },
    {
      icon: "💰",
      title:
        "Cena od razu",
      text:
        "Widzisz ją już na kafelku",
    },
    {
      icon: "🛍️",
      title:
        "Szybkie przejście",
      text:
        "Kilka kliknięć do oferty sklepu",
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-black text-rose-700 shadow-sm backdrop-blur sm:text-sm">
              <span>
                ✨
              </span>

              Modne znaleziska
              w jednym miejscu
            </div>

            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Moda, która nie musi{" "}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                kosztować fortuny
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-stone-600 sm:mt-5 sm:text-lg sm:leading-8">
              Wybrane ubrania,
              dodatki i okazje bez
              przekopywania się
              przez setki produktów.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
              <Link
                href="/okazje"
                className="flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-3.5 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Zobacz okazje

                <span
                  aria-hidden="true"
                  className="ml-2"
                >
                  →
                </span>
              </Link>

              <a
                href="#kategorie"
                className="flex min-h-13 items-center justify-center rounded-2xl border border-stone-200 bg-white px-7 py-3.5 font-black text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
              >
                Kategorie
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-stone-500 sm:text-sm">
              <span>
                ✓ Bez konta
              </span>

              <span>
                ✓ Szybkie filtry
              </span>

              <span>
                ✓ Proste porównanie
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative rounded-[36px] border border-white bg-white/80 p-6 shadow-xl shadow-rose-100/60 backdrop-blur">
              <div className="absolute -right-3 -top-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-xs font-black text-white shadow-md">
                Trend za Mniej
              </div>

              <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-600">
                Jak to działa
              </p>

              <div className="mt-5 space-y-3">
                {benefits.map(
                  (benefit) => (
                    <div
                      key={
                        benefit.title
                      }
                      className="flex items-center gap-4 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-xl">
                        {
                          benefit.icon
                        }
                      </div>

                      <div>
                        <p className="font-black">
                          {
                            benefit.title
                          }
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
                          {
                            benefit.text
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatBox
                  value={
                    products.length
                  }
                  label="ofert"
                />

                <StatBox
                  value={
                    featuredProducts.length
                  }
                  label="gorących okazji"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="kategorie"
        className="scroll-mt-24 border-b border-stone-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <SectionHeading
            eyebrow="Szybki wybór"
            title="Czego szukasz?"
            description="Wybierz kategorię albo przejdź od razu do produktów w swoim budżecie."
            actionLabel="Wszystkie"
            actionHref="/okazje"
          />

          <MobileSwipeHint />

          <div className="horizontal-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {categories.map(
              (category) => (
                <Link
                  href={
                    category.href
                  }
                  key={
                    category.name
                  }
                  className="group min-w-[78vw] max-w-[285px] snap-start rounded-[26px] border border-stone-200 bg-stone-50 p-5 transition active:scale-[0.98] sm:min-w-0 sm:max-w-none sm:hover:-translate-y-1 sm:hover:border-rose-200 sm:hover:bg-rose-50/50 sm:hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      {
                        category.emoji
                      }
                    </div>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-stone-500 shadow-sm">
                      {getOfferCountLabel(
                        category.count
                      )}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {
                      category.name
                    }
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    {
                      category.description
                    }
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm font-black text-rose-600">
                    <span>
                      Zobacz
                    </span>

                    <span
                      aria-hidden="true"
                      className="transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              )
            )}

            <div
              aria-hidden="true"
              className="w-1 shrink-0 sm:hidden"
            />
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
          <SectionHeading
            eyebrow="🔥 Warto zobaczyć"
            title="Gorące okazje"
            description="Produkty, które warto sprawdzić w pierwszej kolejności."
            actionLabel="Zobacz wszystkie"
            actionHref="/okazje"
          />

          {hotProducts.length >
          0 ? (
            <>
              <MobileSwipeHint />

              <ProductRail
                products={
                  hotProducts
                }
              />

              <Link
                href="/okazje"
                className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-white font-black text-rose-700 sm:hidden"
              >
                Wszystkie okazje →
              </Link>
            </>
          ) : (
            <EmptyProducts />
          )}
        </div>
      </section>

      <section
        id="najnowsze"
        className="scroll-mt-24 border-y border-stone-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
          <SectionHeading
            eyebrow="✨ Ostatnio dodane"
            title="Najnowsze znaleziska"
            description="Świeżo dodane produkty w Trend za Mniej."
            actionLabel="Wszystkie nowości"
            actionHref="/okazje?sort=newest"
          />

          {latestProducts.length >
          0 ? (
            <>
              <MobileSwipeHint />

              <div className="horizontal-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
                {latestProducts.map(
                  (product) => (
                    <div
                      key={
                        product.id
                      }
                      className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                    >
                      <ProductCard
                        product={
                          product
                        }
                      />
                    </div>
                  )
                )}

                <div
                  aria-hidden="true"
                  className="w-1 shrink-0 sm:hidden"
                />
              </div>

              <Link
                href="/okazje?sort=newest"
                className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 font-black text-rose-700 sm:hidden"
              >
                Wszystkie nowości →
              </Link>
            </>
          ) : (
            <EmptyProducts />
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {benefits.map(
              (benefit) => (
                <div
                  key={
                    benefit.title
                  }
                  className="flex items-center gap-4 rounded-3xl border border-white bg-white/80 p-4 shadow-sm sm:block sm:p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-xl">
                    {
                      benefit.icon
                    }
                  </div>

                  <div>
                    <h3 className="font-black sm:mt-4">
                      {
                        benefit.title
                      }
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      {
                        benefit.text
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section
        id="o-nas"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
          <div className="grid gap-6 rounded-[30px] border border-stone-200 bg-stone-50 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
                O Trend za Mniej
              </p>

              <h2 className="mt-2 text-balance text-2xl font-black tracking-[-0.025em] sm:text-3xl">
                Mniej szukania,
                więcej ciekawych
                znalezisk
              </h2>

              <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-stone-600 sm:text-base">
                Zbieramy wybrane
                produkty w jednym
                miejscu, żeby można
                było szybko
                przeglądać je według
                kategorii i ceny.
              </p>

              <Link
                href="/okazje"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 font-black text-white transition hover:bg-rose-600"
              >
                Przejdź do okazji →
              </Link>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6">
              <p className="text-sm font-black">
                Informacja o afiliacji
              </p>

              <p className="mt-3 text-sm leading-7 text-stone-500">
                Część linków na
                stronie jest
                afiliacyjna. Możemy
                otrzymać prowizję od
                zakupu bez
                dodatkowych kosztów
                dla kupującego.
              </p>

              <p className="mt-3 text-sm leading-7 text-stone-500">
                Cena i dostępność
                mogą się zmieniać.
                Aktualne warunki
                zawsze sprawdź w
                sklepie.
              </p>

              <Link
                href="/afiliacja"
                className="mt-4 inline-flex text-sm font-black text-rose-600 hover:text-rose-700"
              >
                Więcej informacji →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ProductRail({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="horizontal-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:gap-5 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
      {products.map(
        (product) => (
          <div
            key={
              product.id
            }
            className="w-[78vw] max-w-[320px] shrink-0 snap-start lg:w-auto lg:max-w-none"
          >
            <ProductCard
              product={
                product
              }
            />
          </div>
        )
      )}

      <div
        aria-hidden="true"
        className="w-1 shrink-0 lg:hidden"
      />
    </div>
  );
}

function MobileSwipeHint() {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-400 sm:hidden">
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
        <path d="M5 12h14" />
        <path d="m15 8 4 4-4 4" />
      </svg>

      Przesuń palcem, aby
      zobaczyć więcej
    </div>
  );
}

function StatBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4">
      <p className="text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-stone-500">
        {label}
      </p>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="mt-6 rounded-[28px] border border-dashed border-rose-200 bg-rose-50/40 px-6 py-12 text-center">
      <div className="text-4xl">
        🛍️
      </div>

      <h3 className="mt-4 text-xl font-black">
        Wkrótce nowe okazje
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        Dodajemy kolejne
        znaleziska. Zajrzyj ponownie
        później.
      </p>
    </div>
  );
}

function countCategory(
  products: Product[],
  category: string
) {
  return products.filter(
    (product) =>
      product.category ===
      category
  ).length;
}

function getOfferCountLabel(
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