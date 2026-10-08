import type {
  Metadata,
} from "next";

import Link from "next/link";

import CategoryExplorer, {
  type CategoryExplorerItem,
} from "@/components/CategoryExplorer";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  getCategorySeo,
} from "@/lib/categories";

import {
  getProducts,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const revalidate =
  60;

export const metadata: Metadata = {
  title:
    "Kategorie SHEIN – moda, dodatki, beauty i dom",

  description:
    "Przeglądaj kategorie produktów w Trend za Mniej. Sukienki, bluzy, swetry, buty, torebki, biżuteria, beauty, dom i inne wybrane okazje SHEIN.",

  alternates: {
    canonical:
      "/kategorie",
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
      "/kategorie",

    siteName:
      SITE_NAME,

    title:
      "Kategorie produktów | Trend za Mniej",

    description:
      "Znajdź interesującą kategorię i szybciej przejdź do wybranych produktów oraz okazji.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Kategorie produktów | Trend za Mniej",

    description:
      "Moda, dodatki, beauty, dom i inne kategorie produktów w jednym miejscu.",

    images: [
      "/opengraph-image",
    ],
  },
};

export default async function CategoriesPage() {
  const products =
    await getProducts();

  const categoryMap =
    new Map<
      string,
      {
        count: number;
        image: string;
      }
    >();

  for (
    const product
    of products
  ) {
    const categoryName =
      product.category.trim();

    if (
      !categoryName
    ) {
      continue;
    }

    const current =
      categoryMap.get(
        categoryName
      );

    if (
      current
    ) {
      current.count +=
        1;

      continue;
    }

    categoryMap.set(
      categoryName,
      {
        count:
          1,

        image:
          product.image,
      }
    );
  }

  const categories:
    CategoryExplorerItem[] =
    Array.from(
      categoryMap.entries()
    )
      .map(
        ([
          name,
          data,
        ]) => {
          const seo =
            getCategorySeo(
              name
            );

          return {
            name,

            slug:
              seo.slug,

            description:
              seo.description,

            count:
              data.count,

            image:
              data.image,
          };
        }
      )
      .sort(
        (
          first,
          second
        ) => {
          if (
            second.count !==
            first.count
          ) {
            return (
              second.count -
              first.count
            );
          }

          return first.name.localeCompare(
            second.name,
            "pl"
          );
        }
      );

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/kategorie`;

  const structuredData = {
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
          "Kategorie produktów",

        description:
          "Kategorie produktów i okazji dostępnych w Trend za Mniej.",

        inLanguage:
          SITE_LANGUAGE,

        isPartOf: {
          "@id":
            `${siteUrl}/#website`,
        },

        breadcrumb: {
          "@id":
            `${pageUrl}#breadcrumb`,
        },

        mainEntity: {
          "@id":
            `${pageUrl}#categories`,
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${pageUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Trend za Mniej",

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
              pageUrl,
          },
        ],
      },

      {
        "@type":
          "ItemList",

        "@id":
          `${pageUrl}#categories`,

        name:
          "Kategorie produktów",

        numberOfItems:
          categories.length,

        itemListElement:
          categories.map(
            (
              category,
              index
            ) => ({
              "@type":
                "ListItem",

              position:
                index +
                1,

              name:
                category.name,

              url:
                `${siteUrl}/kategoria/${category.slug}`,
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
          className="pointer-events-none absolute left-1/2 top-[-220px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-rose-100/60 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
          <nav
            aria-label="Okruszki"
            className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-xs font-semibold text-stone-400"
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

            <span className="text-stone-600">
              Kategorie
            </span>
          </nav>

          <div className="mx-auto mt-6 max-w-4xl text-center">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700">
                <span
                  aria-hidden="true"
                >
                  🛍️
                </span>

                Wszystko uporządkowane
                w jednym miejscu
              </span>
            </div>

            <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.03] tracking-[-0.05em] text-stone-900 sm:text-5xl lg:text-[58px]">
              Znajdź produkty
              według{" "}
              <span className="text-rose-600">
                kategorii
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
              Nie musisz przeglądać
              wszystkiego. Wybierz
              rodzaj produktu,
              który Cię interesuje,
              i od razu przejdź
              do odpowiednich
              znalezisk.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold text-stone-500">
              <span className="rounded-full bg-stone-100 px-3 py-2">
                {
                  categories.length
                }{" "}
                kategorii
              </span>

              <span className="rounded-full bg-stone-100 px-3 py-2">
                {
                  products.length
                }{" "}
                produktów
              </span>

              <span className="rounded-full bg-stone-100 px-3 py-2">
                Kategorie aktualizują
                się automatycznie
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Wybierz kategorię
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl">
              Czego szukasz?
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-500 sm:text-base">
              Możesz wyszukać
              kategorię po nazwie
              albo ograniczyć listę
              do ubrań, dodatków,
              beauty czy produktów
              do domu.
            </p>
          </div>

          <div className="mt-7">
            {categories.length >
            0 ? (
              <CategoryExplorer
                categories={
                  categories
                }
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
                <h2 className="text-xl font-black text-stone-900">
                  Brak kategorii
                  do wyświetlenia
                </h2>

                <p className="mt-2 text-sm leading-7 text-stone-500">
                  Kategorie pojawią
                  się tutaj po dodaniu
                  aktywnych produktów.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon="🔎"
              title="Wybierz kategorię"
            >
              Zacznij od rodzaju
              produktu zamiast
              przeglądać cały
              katalog.
            </InfoCard>

            <InfoCard
              icon="🏷️"
              title="Użyj filtrów"
            >
              Po wejściu do okazji
              możesz dodatkowo
              zawęzić produkty
              według ceny
              i sortowania.
            </InfoCard>

            <InfoCard
              icon="🔥"
              title="Sprawdź promocje"
            >
              Jeżeli nie szukasz
              konkretnej rzeczy,
              możesz przejść
              do aktualnych
              kampanii SHEIN.
            </InfoCard>
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="overflow-hidden rounded-[28px] bg-stone-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-300">
                  Inny sposób
                  szukania
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                  Wolisz zobaczyć
                  wszystkie produkty?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                  Przejdź do okazji
                  i skorzystaj
                  z wyszukiwarki,
                  ceny, kategorii
                  oraz sortowania.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
                <Link
                  href="/okazje"
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-500"
                >
                  Wszystkie produkty
                </Link>

                <Link
                  href="/promocje-shein"
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-stone-900 transition hover:bg-stone-100"
                >
                  Promocje SHEIN
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

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;

  title: string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg shadow-sm"
      >
        {icon}
      </span>

      <h3 className="mt-4 text-lg font-black text-stone-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-stone-500">
        {children}
      </p>
    </div>
  );
}