import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  formatPrice,
  getFeaturedProducts,
  getProducts,
  type Product,
} from "@/lib/products";

export const revalidate = 60;

type CategoryCard = {
  name: string;
  icon: string;
  description: string;
  count: number;
  href: string;
};

const CATEGORY_ICONS: Record<
  string,
  string
> = {
  Swetry: "🧥",
  Bluzy: "🧶",
  Topy: "👚",
  Koszule: "👔",
  Kardigany: "🧥",
  Sukienki: "👗",
  Spodnie: "👖",
  Spódnice: "✨",
  Buty: "👟",
  Torebki: "👜",
  Biżuteria: "💎",
  Akcesoria: "🕶️",
  "Akcesoria kosmetyczne":
    "🧴",
  Uroda: "✨",
  "Dom i lifestyle": "🏠",
};

const CATEGORY_DESCRIPTIONS: Record<
  string,
  string
> = {
  Swetry:
    "Modele na chłodniejsze dni",
  Bluzy:
    "Wygodne fasony na co dzień",
  Topy:
    "Lekkie propozycje do stylizacji",
  Koszule:
    "Casualowe i klasyczne fasony",
  Kardigany:
    "Warstwowe stylizacje na co dzień",
  Sukienki:
    "Modele na co dzień i okazje",
  Spodnie:
    "Różne fasony i wygodne kroje",
  Spódnice:
    "Modne fasony do wielu stylizacji",
  Buty:
    "Modele do codziennych zestawów",
  Torebki:
    "Praktyczne i modne dodatki",
  Biżuteria:
    "Drobne dodatki do stylizacji",
  Akcesoria:
    "Wybrane modne dodatki",
  "Akcesoria kosmetyczne":
    "Przydatne kosmetyczne akcesoria",
  Uroda:
    "Kosmetyczne znaleziska",
  "Dom i lifestyle":
    "Praktyczne rzeczy na co dzień",
};

export default async function Home() {
  const [
    products,
    featuredProducts,
  ] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ]);

  const hotProducts =
    featuredProducts.slice(
      0,
      8
    );

  const latestProducts =
    products.slice(
      0,
      8
    );

  const categoryNames = [
    ...new Set(
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    ),
  ];

  const categories: CategoryCard[] =
    categoryNames
      .map(
        (
          category
        ): CategoryCard => ({
          name:
            category,

          icon:
            CATEGORY_ICONS[
              category
            ] ?? "✨",

          description:
            CATEGORY_DESCRIPTIONS[
              category
            ] ??
            "Wybrane modne znaleziska",

          count:
            products.filter(
              (product) =>
                product.category ===
                category
            ).length,

          href:
            `/kategoria/${slugifyCategory(
              category
            )}`,
        })
      )
      .sort(
        (a, b) =>
          b.count -
          a.count
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

      <CategorySection
        categories={
          categories
        }
      />

      <ProductSection
        eyebrow="Warto sprawdzić"
        title="Gorące okazje"
        description="Wybrane produkty, które warto zobaczyć w pierwszej kolejności."
        products={
          hotProducts
        }
        href="/okazje"
        emptyText="Wkrótce pojawią się tutaj wyróżnione okazje."
      />

      <ProductSection
        id="najnowsze"
        eyebrow="Ostatnio dodane"
        title="Najnowsze znaleziska"
        description="Świeżo dodane produkty dostępne w Trend za Mniej."
        products={
          latestProducts
        }
        href="/okazje?sort=newest"
        alternate
        emptyText="Wkrótce pojawią się tutaj nowe produkty."
      />

      <WhyUs />

      <AboutSection />

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
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 sm:text-sm">
            <span>
              ✨
            </span>

            Moda i okazje w jednym
            miejscu
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
            Modne okazje bez{" "}
            <span className="text-rose-600">
              przekopywania setek ofert
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
            Wybrane ubrania, dodatki
            i ciekawe znaleziska.
            Wyszukaj produkt albo
            przejdź od razu do
            interesującej Cię kategorii.
          </p>

          <form
            action="/okazje"
            method="get"
            className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
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
                placeholder="Czego szukasz?"
                aria-label="Szukaj produktów"
                className="min-h-[54px] w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-4 text-base outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </div>

            <button
              type="submit"
              className="min-h-[54px] rounded-2xl bg-rose-600 px-7 font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
            >
              Szukaj
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <QuickLink
              href="/kategoria/swetry"
            >
              Swetry
            </QuickLink>

            <QuickLink
              href="/kategoria/bluzy"
            >
              Bluzy
            </QuickLink>

            <QuickLink
              href="/kategoria/topy"
            >
              Topy
            </QuickLink>

            <QuickLink
              href="/okazje?maxPrice=50"
            >
              Do 50 zł
            </QuickLink>

            <QuickLink
              href="/okazje?maxPrice=100"
            >
              Do 100 zł
            </QuickLink>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-stone-400 sm:text-sm">
            <span>
              {productsCount}{" "}
              {getProductWord(
                productsCount
              )}
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block"
            />

            <span>
              Bez zakładania konta
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block"
            />

            <span>
              Szybkie filtrowanie
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      {children}
    </Link>
  );
}

function CategorySection({
  categories,
}: {
  categories: CategoryCard[];
}) {
  return (
    <section
      id="kategorie"
      className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
    >
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <SectionHeader
          eyebrow="Kategorie"
          title="Przeglądaj po kategorii"
          description="Przejdź bezpośrednio do produktów, które Cię interesują."
          href="/okazje"
          linkLabel="Wszystkie okazje"
        />

        {categories.length >
        0 ? (
          <>
            <div className="mt-6 hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
              {categories.map(
                (category) => (
                  <CategoryTile
                    key={
                      category.name
                    }
                    category={
                      category
                    }
                  />
                )
              )}
            </div>

            <div className="horizontal-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:hidden">
              {categories.map(
                (category) => (
                  <div
                    key={
                      category.name
                    }
                    className="w-[72vw] max-w-[270px] shrink-0 snap-start"
                  >
                    <CategoryTile
                      category={
                        category
                      }
                    />
                  </div>
                )
              )}

              <div className="w-1 shrink-0" />
            </div>
          </>
        ) : (
          <EmptyBox>
            Kategorie pojawią się po
            dodaniu pierwszych
            produktów.
          </EmptyBox>
        )}
      </div>
    </section>
  );
}

function CategoryTile({
  category,
}: {
  category: CategoryCard;
}) {
  return (
    <Link
      href={
        category.href
      }
      className="group flex h-full items-center gap-4 rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl transition group-hover:bg-rose-50">
        {
          category.icon
        }
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate font-black text-stone-900">
            {
              category.name
            }
          </h3>

          <span
            aria-hidden="true"
            className="shrink-0 text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-500"
          >
            →
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-stone-500">
          {
            category.description
          }
        </p>

        <p className="mt-2 text-[11px] font-bold text-rose-600">
          {getOfferCountLabel(
            category.count
          )}
        </p>
      </div>
    </Link>
  );
}

function ProductSection({
  id,
  eyebrow,
  title,
  description,
  products,
  href,
  emptyText,
  alternate = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  href: string;
  emptyText: string;
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
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
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
          linkLabel="Zobacz wszystkie"
        />

        {products.length >
        0 ? (
          <>
            <div className="mt-6 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
              {products.map(
                (product) => (
                  <HomeProductCard
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

            <div className="horizontal-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:hidden">
              {products.map(
                (product) => (
                  <div
                    key={
                      product.id
                    }
                    className="w-[72vw] max-w-[285px] shrink-0 snap-start"
                  >
                    <HomeProductCard
                      product={
                        product
                      }
                    />
                  </div>
                )
              )}

              <div className="w-1 shrink-0" />
            </div>

            <Link
              href={
                href
              }
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:hidden"
            >
              Zobacz wszystkie →
            </Link>
          </>
        ) : (
          <EmptyBox>
            {emptyText}
          </EmptyBox>
        )}
      </div>
    </section>
  );
}

function HomeProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <article className="group h-full overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz produkt: ${product.shortName}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={
              product.image
            }
            alt={
              product.name
            }
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-rose-700 shadow-sm backdrop-blur sm:text-[11px]">
              🔥 Gorąca
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-rose-600">
            {
              product.category
            }
          </p>

          <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:text-lg">
            {
              product.shortName
            }
          </h3>

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xl font-black tracking-tight text-stone-900 sm:text-2xl">
                {formatPrice(
                  product.price
                )}
              </span>

              {product.oldPrice !==
                null && (
                <span className="text-xs font-semibold text-stone-400 line-through">
                  {formatPrice(
                    product.oldPrice
                  )}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-sm font-black text-rose-600">
              <span>
                Zobacz produkt
              </span>

              <span
                aria-hidden="true"
                className="transition group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function WhyUs() {
  const items = [
    {
      icon: "✓",
      title:
        "Wybrane ręcznie",
      description:
        "Nie publikujemy automatycznie całego katalogu sklepu.",
    },

    {
      icon: "zł",
      title:
        "Cena od razu",
      description:
        "Najważniejszą informację widzisz bez otwierania produktu.",
    },

    {
      icon: "↗",
      title:
        "Szybkie przejście",
      description:
        "Z produktu możesz od razu przejść do aktualnej oferty sklepu.",
    },
  ];

  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-3 md:grid-cols-3">
          {items.map(
            (item) => (
              <div
                key={
                  item.title
                }
                className="flex items-start gap-4 rounded-[22px] border border-stone-200 bg-white p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-700">
                  {
                    item.icon
                  }
                </div>

                <div>
                  <h2 className="font-black text-stone-900">
                    {
                      item.title
                    }
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    {
                      item.description
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="o-nas"
      className="scroll-mt-24 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 rounded-[26px] border border-stone-200 bg-stone-50 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
              Trend za Mniej
            </p>

            <h2 className="mt-2 max-w-2xl text-balance text-2xl font-black tracking-[-0.03em] sm:text-3xl">
              Mniej szukania.
              Więcej ciekawych
              znalezisk.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
              Produkty wybieramy
              ręcznie i zbieramy w
              jednym miejscu. Cena
              widoczna przy ofercie
              jest ceną z chwili
              publikacji lub
              aktualizacji.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/o-nas"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 font-black text-white transition hover:bg-rose-600"
              >
                Jak wybieramy okazje
                →
              </Link>

              <Link
                href="/afiliacja"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
              >
                O afiliacji
              </Link>
            </div>
          </div>

          <div className="rounded-[22px] border border-stone-200 bg-white p-5">
            <p className="text-sm font-black text-stone-900">
              Przed zakupem
            </p>

            <div className="mt-4 space-y-3">
              <CheckItem>
                Sprawdź aktualną
                cenę w sklepie.
              </CheckItem>

              <CheckItem>
                Zweryfikuj rozmiar
                i dostępność.
              </CheckItem>

              <CheckItem>
                Promocje i kupony
                mogą zmieniać się
                w czasie.
              </CheckItem>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckItem({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm leading-6 text-stone-500">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-black text-green-700">
        ✓
      </span>

      <p>
        {children}
      </p>
    </div>
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
        <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
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

function EmptyBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[22px] border border-dashed border-stone-200 bg-white px-6 py-10 text-center text-sm leading-6 text-stone-500">
      {children}
    </div>
  );
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

function getProductWord(
  count: number
) {
  if (count === 1) {
    return "produkt";
  }

  const lastTwo =
    count % 100;

  const last =
    count % 10;

  if (
    lastTwo >= 12 &&
    lastTwo <= 14
  ) {
    return "produktów";
  }

  if (
    last >= 2 &&
    last <= 4
  ) {
    return "produkty";
  }

  return "produktów";
}