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

      <section className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:py-14">
          <nav
            aria-label="Okruszki"
            className="flex flex-wrap items-center gap-2 text-sm text-stone-500"
          >
            <Link
              href="/"
              className="font-semibold transition hover:text-rose-600"
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
              className="font-semibold transition hover:text-rose-600"
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
              {category.name}
            </span>
          </nav>

          <div className="mt-7 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
              Moda i okazje
            </p>

            <h1 className="mt-2 text-balance text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>

            <p className="mt-4 text-pretty text-base leading-8 text-stone-600 sm:text-lg">
              {category.description}
            </p>

            <div className="mt-5 inline-flex items-center rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm">
              {getProductCountLabel(
                products.length
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
              Najnowsze
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Produkty z kategorii{" "}
              {category.name}
            </h2>
          </div>

          <Link
            href={`/okazje?category=${encodeURIComponent(
              category.name
            )}`}
            className="text-sm font-black text-rose-600 hover:text-rose-700"
          >
            Filtruj i sortuj →
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <section className="border-y border-stone-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
              O kategorii
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Jak wybierać{" "}
              {category.name.toLowerCase()}
              ?
            </h2>

            <p className="mt-4 text-base leading-8 text-stone-600">
              {category.intro}
            </p>

            <p className="mt-4 text-sm leading-7 text-stone-500">
              Trend za Mniej nie jest
              sprzedawcą produktów.
              Prezentujemy wybrane
              znaleziska i kierujemy
              użytkownika do zewnętrznego
              sklepu, gdzie można
              sprawdzić aktualną cenę,
              dostępność, rozmiary oraz
              warunki zakupu.
            </p>
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-rose-50/60 p-5 sm:p-6">
            <h2 className="text-lg font-black text-stone-900">
              Przed zakupem sprawdź
            </h2>

            <div className="mt-4 space-y-4">
              {category.tips.map(
                (
                  tip,
                  index
                ) => (
                  <div
                    key={tip}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-rose-700 shadow-sm">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-7 text-stone-600">
                      {tip}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col items-center justify-between gap-5 rounded-[28px] border border-stone-200 bg-white p-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-lg font-black">
                Szukasz czegoś innego?
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Zobacz wszystkie
                kategorie i najnowsze
                okazje.
              </p>
            </div>

            <Link
              href="/okazje"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-rose-50 px-6 font-black text-rose-700 transition hover:bg-rose-100 sm:w-auto"
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