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
} from "@/lib/categories";

import {
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
  const { slug } =
    await params;

  const categories =
    await getCategories();

  const category =
    findCategoryBySlug(
      categories,
      slug
    );

  if (!category) {
    return {
      title:
        "Kategoria nie istnieje",

      robots: {
        index: false,
        follow: false,
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
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      type:
        "website",

      locale:
        SITE_LANGUAGE,

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

          width: 1200,

          height: 630,

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
  const { slug } =
    await params;

  const categories =
    await getCategories();

  const category =
    findCategoryBySlug(
      categories,
      slug
    );

  if (!category) {
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
    products.length === 0
  ) {
    notFound();
  }

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

            position: 1,

            name:
              "Strona główna",

            item:
              siteUrl,
          },

          {
            "@type":
              "ListItem",

            position: 2,

            name:
              "Okazje",

            item:
              `${siteUrl}/okazje`,
          },

          {
            "@type":
              "ListItem",

            position: 3,

            name:
              category.name,

            item:
              categoryUrl,
          },
        ],
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

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Okruszki"
            className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold text-stone-400 sm:text-sm"
          >
            <Link
              href="/"
              className="transition hover:text-rose-600"
            >
              Strona główna
            </Link>

            <span
              aria-hidden="true"
              className="text-stone-300"
            >
              /
            </span>

            <Link
              href="/okazje"
              className="transition hover:text-rose-600"
            >
              Okazje
            </Link>

            <span
              aria-hidden="true"
              className="text-stone-300"
            >
              /
            </span>

            <span className="font-bold text-stone-700">
              {
                category.name
              }
            </span>
          </nav>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
                Kategoria
              </p>

              <h1 className="mt-1 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                {
                  category.name
                }
              </h1>

              <p className="mt-3 max-w-2xl text-pretty text-sm leading-7 text-stone-500 sm:text-base">
                {
                  category.description
                }
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-10 items-center rounded-full border border-stone-200 bg-stone-50 px-4 text-sm font-bold text-stone-600">
                {getProductCountLabel(
                  products.length
                )}
              </span>

              <Link
                href={`/okazje?category=${encodeURIComponent(
                  category.name
                )}`}
                className="inline-flex min-h-10 items-center rounded-full bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100"
              >
                Filtry i sortowanie
                →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-6 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Najnowsze
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
              Produkty:
              {" "}
              {
                category.name
              }
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Najnowsze oferty
              dodane do tej
              kategorii.
            </p>
          </div>

          <Link
            href="/okazje"
            className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
          >
            Wszystkie okazje →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              O kategorii
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
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
              Serwis nie jest
              sprzedawcą — zakup,
              płatność, dostawa,
              reklamacje i zwroty
              odbywają się
              bezpośrednio w sklepie,
              do którego prowadzi
              oferta.
            </p>

            <Link
              href="/o-nas"
              className="mt-5 inline-flex text-sm font-black text-rose-600 transition hover:text-rose-700"
            >
              Jak wybieramy okazje
              →
            </Link>
          </div>

          <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5 sm:p-6">
            <h2 className="text-lg font-black text-stone-900">
              Przed zakupem
            </h2>

            <p className="mt-1 text-sm leading-6 text-stone-500">
              Kilka rzeczy, które
              warto zawsze
              sprawdzić.
            </p>

            <div className="mt-5 space-y-4">
              {category.tips.map(
                (
                  tip,
                  index
                ) => (
                  <div
                    key={
                      tip
                    }
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-rose-700 shadow-sm">
                      {
                        index + 1
                      }
                    </span>

                    <p className="text-sm leading-7 text-stone-600">
                      {
                        tip
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <div className="flex flex-col items-center justify-between gap-5 rounded-[22px] border border-stone-200 bg-white p-5 text-center sm:flex-row sm:p-6 sm:text-left">
            <div>
              <p className="font-black text-stone-900">
                Szukasz czegoś
                innego?
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Przejdź do pełnego
                katalogu i skorzystaj
                z wyszukiwarki oraz
                filtrów.
              </p>
            </div>

            <Link
              href="/okazje"
              className="flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700 sm:w-auto"
            >
              Wszystkie okazje →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function getProductCountLabel(
  count: number
) {
  if (count === 1) {
    return "1 produkt";
  }

  const lastTwo =
    count % 100;

  const last =
    count % 10;

  if (
    lastTwo >= 12 &&
    lastTwo <= 14
  ) {
    return `${count} produktów`;
  }

  if (
    last >= 2 &&
    last <= 4
  ) {
    return `${count} produkty`;
  }

  return `${count} produktów`;
}