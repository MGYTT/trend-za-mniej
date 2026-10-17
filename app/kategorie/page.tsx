
import type { Metadata } from "next";
import Link from "next/link";

import CategoryExplorer, {
  type CategoryExplorerItem,
} from "@/components/CategoryExplorer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import { getCategorySeo } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kategorie produktów i okazji",
  description:
    "Przeglądaj kategorie produktów w Trend za Mniej. Ubrania, buty, torebki, biżuteria, uroda i inne znaleziska w jednym miejscu.",

  alternates: {
    canonical: "/kategorie",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/kategorie",
    siteName: SITE_NAME,
    title: "Kategorie produktów | Trend za Mniej",
    description:
      "Wybierz kategorię i znajdź interesujące produkty.",
    images: ["/opengraph-image"],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kategorie produktów",
    description:
      "Odkrywaj ubrania, dodatki i inne znaleziska.",
    images: ["/opengraph-image"],
  },
};

export default async function CategoriesPage() {
  const products = await getProducts();

  const categoryMap = new Map<
    string,
    {
      count: number;
      image: string;
    }
  >();

  for (const product of products) {
    const name = product.category?.trim();

    if (!name) continue;

    const current = categoryMap.get(name);

    if (current) {
      current.count += 1;

      if (!current.image && product.image?.trim()) {
        current.image = product.image.trim();
      }
    } else {
      categoryMap.set(name, {
        count: 1,
        image: product.image?.trim() || "",
      });
    }
  }

  const categories: CategoryExplorerItem[] =
    [...categoryMap.entries()]
      .map(([name, data]) => {
        const seo = getCategorySeo(name);

        return {
          name,
          slug: seo.slug,
          description: seo.description,
          count: data.count,
          image: data.image,
        };
      })
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.name.localeCompare(b.name, "pl")
      );

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/kategorie`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Kategorie produktów",
        inLanguage: SITE_LANGUAGE,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${pageUrl}#categories`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Start",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Kategorie",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#categories`,
        name: "Kategorie produktów",
        numberOfItems: categories.length,
        itemListElement: categories.map(
          (category, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: category.name,
            url:
              `${siteUrl}/kategoria/${category.slug}`,
          })
        ),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-900 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <SiteHeader />

      {/* NAGŁÓWEK */}

      <header className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-rose-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-7 pt-6 sm:px-6 sm:pb-11 sm:pt-10">
          <nav
            aria-label="Okruszki"
            className="flex items-center gap-2 text-xs font-semibold text-stone-500"
          >
            <Link
              href="/"
              className="hover:text-rose-700"
            >
              Start
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="text-stone-800"
            >
              Kategorie
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                Znajdź swój styl
              </span>

              <h1 className="mt-3 text-balance text-[clamp(2.1rem,5vw,3.7rem)] font-black leading-[1.08] tracking-[-0.05em] text-stone-950">
                Wszystko zaczyna się od{" "}
                <span className="text-rose-600">
                  dobrej kategorii.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                Wybierz ubrania, dodatki, beauty
                albo produkty do domu. Pokażemy
                Ci znaleziska z wybranego działu.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <strong className="block text-xl font-black text-stone-950">
                  {categories.length}
                </strong>

                <span className="text-xs font-semibold text-stone-500">
                  kategorii
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <strong className="block text-xl font-black text-stone-950">
                  {products.length}
                </strong>

                <span className="text-xs font-semibold text-stone-500">
                  produktów
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WYSZUKIWANIE KATEGORII */}

      <section
        id="lista-kategorii"
        aria-labelledby="categories-heading"
        className="scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                Odkrywaj
              </p>

              <h2
                id="categories-heading"
                className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
              >
                Czego szukasz?
              </h2>

              <p className="mt-2 text-sm text-stone-600">
                Wyszukaj dział lub wybierz
                rodzaj produktów.
              </p>
            </div>

            <Link
              href="/okazje"
              className="inline-flex min-h-10 items-center text-sm font-extrabold text-rose-700 hover:text-rose-800"
            >
              Wszystkie produkty →
            </Link>
          </div>

          {categories.length > 0 ? (
            <CategoryExplorer categories={categories} />
          ) : (
            <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-black">
                Brak kategorii do wyświetlenia
              </h3>

              <p className="mt-2 text-sm leading-7 text-stone-600">
                Kategorie pojawią się po dodaniu
                aktywnych produktów do katalogu.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* DODATKOWA NAWIGACJA */}

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11">
          <div className="flex flex-col gap-5 rounded-[24px] bg-stone-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-300">
                Jeszcze więcej inspiracji
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                Nie wiesz, od czego zacząć?
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-7 text-stone-300">
                Zajrzyj do pełnego katalogu
                albo sprawdź kampanie SHEIN.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/okazje"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-500"
              >
                Zobacz produkty
              </Link>

              <Link
                href="/promocje-shein"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-extrabold text-stone-900 transition hover:bg-rose-50"
              >
                Promocje SHEIN
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
