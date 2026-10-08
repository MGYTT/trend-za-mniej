import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  findCategoryBySlug,
  getCategorySeo,
} from "@/lib/categories";

import {
  formatPrice,
  getCategories,
  getProducts,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate =
  300;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const categories =
    await getCategories();

  const category =
    findCategoryBySlug(
      categories,
      slug
    );

  if (
    !category
  ) {
    return {
      title:
        "Kategoria nie istnieje",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const canonical =
    `/kategoria/${category.slug}`;

  return {
    title:
      category.title,

    description:
      category.description,

    alternates: {
      canonical,
    },

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

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
        canonical,

      siteName:
        SITE_NAME,

      title:
        `${category.title} | ${SITE_NAME}`,

      description:
        category.description,

      images: [
        {
          url:
            "/opengraph-image",

          width:
            1200,

          height:
            630,

          alt:
            `${category.name} - Trend za Mniej`,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        `${category.title} | ${SITE_NAME}`,

      description:
        category.description,

      images: [
        "/opengraph-image",
      ],
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const {
    slug,
  } =
    await params;

  const categories =
    await getCategories();

  const category =
    findCategoryBySlug(
      categories,
      slug
    );

  if (
    !category
  ) {
    notFound();
  }

  const products =
    await getProducts({
      category:
        category.name,

      sort:
        "newest",
    });

  if (
    products.length ===
    0
  ) {
    notFound();
  }

  const otherCategories =
    categories
      .filter(
        (
          name
        ) =>
          name !==
          category.name
      )
      .map(
        (
          name
        ) =>
          getCategorySeo(
            name
          )
      )
      .slice(
        0,
        10
      );

  const lowestPrice =
    Math.min(
      ...products.map(
        (
          product
        ) =>
          product.price
      )
    );

  const featuredCount =
    products.filter(
      (
        product
      ) =>
        product.featured
    ).length;

  const categoryQuery =
    encodeURIComponent(
      category.name
    );

  const siteUrl =
    getSiteUrl();

  const categoryUrl =
    `${siteUrl}/kategoria/${category.slug}`;

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${categoryUrl}#webpage`,

        url:
          categoryUrl,

        name:
          category.title,

        description:
          category.description,

        inLanguage:
          SITE_LANGUAGE,

        isPartOf: {
          "@id":
            `${siteUrl}/#website`,
        },

        about: {
          "@type":
            "Thing",

          name:
            category.name,
        },

        breadcrumb: {
          "@id":
            `${categoryUrl}#breadcrumb`,
        },

        mainEntity: {
          "@id":
            `${categoryUrl}#products`,
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${categoryUrl}#breadcrumb`,

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
              "Kategorie",

            item:
              `${siteUrl}/kategorie`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              category.name,

            item:
              categoryUrl,
          },
        ],
      },

      {
        "@type":
          "ItemList",

        "@id":
          `${categoryUrl}#products`,

        name:
          `Produkty: ${category.name}`,

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
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
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

      <SiteHeader />

      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-150px] top-[-180px] h-[360px] w-[360px] rounded-full bg-rose-100/60 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-10">
          <nav
            aria-label="Okruszki"
            className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold text-stone-400 sm:text-sm"
          >
            <Link
              href="/"
              className="transition hover:text-rose-600"
            >
              Start
            </Link>

            <span
              aria-hidden="true"
            >
              /
            </span>

            <Link
              href="/kategorie"
              className="transition hover:text-rose-600"
            >
              Kategorie
            </Link>

            <span
              aria-hidden="true"
            >
              /
            </span>

            <span className="font-bold text-stone-700">
              {
                category.name
              }
            </span>
          </nav>

          <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                Kategoria
              </p>

              <h1 className="mt-2 text-balance text-4xl font-black leading-[1.04] tracking-[-0.05em] text-stone-900 sm:text-5xl">
                {
                  category.name
                }
              </h1>

              <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-stone-500 sm:text-base">
                {
                  category.description
                }
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <StatPill>
                  {
                    getProductCountLabel(
                      products.length
                    )
                  }
                </StatPill>

                <StatPill>
                  od{" "}
                  {
                    formatPrice(
                      lowestPrice
                    )
                  }
                </StatPill>

                {featuredCount >
                  0 && (
                  <StatPill>
                    🔥{" "}
                    {
                      featuredCount
                    }{" "}
                    wyróżnionych
                  </StatPill>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={`/okazje?category=${categoryQuery}`}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
              >
                Filtry i sortowanie
              </Link>

              <Link
                href="/kategorie"
                className="flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Wszystkie kategorie
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400">
            Szybkie wybory
          </p>

          <div className="horizontal-scroll -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <QuickFilter
              href={`/okazje?category=${categoryQuery}`}
              icon="✨"
              label="Wszystkie"
            />

            <QuickFilter
              href={`/okazje?category=${categoryQuery}&maxPrice=50`}
              icon="💸"
              label="Do 50 zł"
            />

            <QuickFilter
              href={`/okazje?category=${categoryQuery}&maxPrice=100`}
              icon="🏷️"
              label="Do 100 zł"
            />

            <QuickFilter
              href={`/okazje?category=${categoryQuery}&sort=price-asc`}
              icon="↗"
              label="Najtańsze"
            />

            <QuickFilter
              href={`/okazje?category=${categoryQuery}&sort=newest`}
              icon="🆕"
              label="Najnowsze"
            />

            <QuickFilter
              href="/promocje-shein"
              icon="🔥"
              label="Promocje SHEIN"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Najnowsze znaleziska
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
              {
                category.name
              }
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Produkty dodane
              do tej kategorii,
              od najnowszych.
            </p>
          </div>

          <Link
            href={`/okazje?category=${categoryQuery}`}
            className="inline-flex min-h-10 items-center text-sm font-black text-rose-600 transition hover:text-rose-700"
          >
            Pokaż z filtrami →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

        <div className="mt-8 flex justify-center">
          <Link
            href={`/okazje?category=${categoryQuery}`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 text-sm font-black text-white transition hover:bg-rose-600"
          >
            Zobacz {
              category.name.toLowerCase()
            } z filtrami
          </Link>
        </div>
      </section>

      {otherCategories.length >
        0 && (
        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                  Odkrywaj dalej
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
                  Inne kategorie
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                  Jeśli chcesz
                  zobaczyć coś
                  innego, przejdź
                  bezpośrednio do
                  kolejnej kategorii.
                </p>
              </div>

              <Link
                href="/kategorie"
                className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
              >
                Wszystkie →
              </Link>
            </div>

            <div className="horizontal-scroll -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {otherCategories.map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item.slug
                    }
                    href={`/kategoria/${item.slug}`}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 text-sm font-black text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {
                      item.name
                    }

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                )
              )}

              <Link
                href="/kategorie"
                className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 sm:hidden"
              >
                Wszystkie kategorie
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:gap-14">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Warto wiedzieć
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
              Jak wybierać{" "}
              {
                category.name.toLowerCase()
              }
              ?
            </h2>

            <p className="mt-4 text-base leading-8 text-stone-600">
              {
                category.intro
              }
            </p>

            <p className="mt-4 text-sm leading-7 text-stone-500">
              Produkty w Trend za
              Mniej są wybierane
              i dodawane ręcznie.
              Pokazujemy cenę
              zapisaną przy
              publikacji, ale
              aktualną cenę,
              rozmiary, warianty
              i dostępność należy
              potwierdzić
              bezpośrednio
              w SHEIN.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/o-nas"
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
              >
                Jak wybieramy okazje
              </Link>

              <Link
                href="/afiliacja"
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
              >
                Jak działa afiliacja
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-lg">
                ✓
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-600">
                  Przed zakupem
                </p>

                <h3 className="text-lg font-black text-stone-900">
                  Sprawdź kilka rzeczy
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {category.tips.map(
                (
                  tip,
                  index
                ) => (
                  <TipItem
                    key={
                      tip
                    }
                    number={
                      index +
                      1
                    }
                  >
                    {tip}
                  </TipItem>
                )
              )}
            </div>

            <Link
              href="/promocje-shein"
              className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-rose-50 px-5 text-center text-sm font-black text-rose-700 transition hover:bg-rose-100"
            >
              🔥 Sprawdź też promocje
              SHEIN
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="overflow-hidden rounded-[28px] bg-stone-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-300">
                  Szukaj po swojemu
                </p>

                <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                  Potrzebujesz
                  dokładniejszych
                  filtrów?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                  Przejdź do wszystkich
                  okazji i ustaw cenę,
                  kategorię oraz
                  kolejność produktów.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
                <Link
                  href={`/okazje?category=${categoryQuery}`}
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-500"
                >
                  Filtruj {
                    category.name.toLowerCase()
                  }
                </Link>

                <Link
                  href="/kategorie"
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-stone-900 transition hover:bg-stone-100"
                >
                  Inna kategoria
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function StatPill({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="inline-flex min-h-9 items-center rounded-full border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-600">
      {children}
    </span>
  );
}

function QuickFilter({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={
        href
      }
      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-xs font-black text-stone-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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

function TipItem({
  number,
  children,
}: {
  number: number;

  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-50 text-[10px] font-black text-rose-700">
        {number}
      </span>

      <p className="text-sm leading-7 text-stone-600">
        {children}
      </p>
    </div>
  );
}

function getProductCountLabel(
  count: number
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