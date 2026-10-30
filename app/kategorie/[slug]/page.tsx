
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import {
  findCategoryBySlug,
} from "@/lib/categories";

import {
  getCategories,
  getProducts,
  formatPrice,
  type Product,
  type ProductSort,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const revalidate = 60;

const PAGE_SIZE = 16;

type SearchParams = {
  q?: string | string[];
  maxPrice?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<SearchParams>;
};

type Filters = {
  query: string;
  maxPrice: string;
  sort: ProductSort;
};

function one(
  value: string | string[] | undefined
) {
  if (typeof value === "string") {
    return value;
  }

  return Array.isArray(value)
    ? value[0] ?? ""
    : "";
}

function readFilters(params: SearchParams): {
  filters: Filters;
  page: number;
} {
  const query = one(params.q)
    .trim()
    .slice(0, 120);

  const priceRaw = one(params.maxPrice).trim();
  const price = Number(priceRaw);

  const maxPrice =
    /^\d+$/.test(priceRaw) &&
    Number.isFinite(price) &&
    price > 0 &&
    price <= 10000
      ? String(price)
      : "";

  const sortRaw = one(params.sort);

  const sort: ProductSort =
    sortRaw === "price-asc" ||
    sortRaw === "price-desc"
      ? sortRaw
      : "newest";

  const pageRaw = one(params.page);
  const pageNumber = Number(pageRaw);

  const page =
    /^\d+$/.test(pageRaw) &&
    Number.isSafeInteger(pageNumber) &&
    pageNumber > 0
      ? Math.min(pageNumber, 100000)
      : 1;

  return {
    filters: {
      query,
      maxPrice,
      sort,
    },
    page,
  };
}

function hasFilters(filters: Filters) {
  return Boolean(
    filters.query ||
    filters.maxPrice ||
    filters.sort !== "newest"
  );
}

function categoryHref(
  slug: string,
  filters: Filters,
  page = 1
) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  const base = `/kategoria/${slug}`;

  return search ? `${base}?${search}` : base;
}

function productCount(count: number) {
  if (count === 1) return "1 produkt";

  const lastTwo = count % 100;
  const last = count % 10;

  if (
    (lastTwo < 12 || lastTwo > 14) &&
    last >= 2 &&
    last <= 4
  ) {
    return `${count} produkty`;
  }

  return `${count} produktów`;
}

/* ======================================================
   SEO
====================================================== */

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { filters, page } = readFilters(
    await searchParams
  );

  const categories = await getCategories();

  const category = findCategoryBySlug(
    categories,
    slug
  );

  if (!category) {
    return {
      title: "Kategoria nie istnieje",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    `/kategoria/${category.slug}`;

  const filtered =
    hasFilters(filters) || page > 1;

  return {
    title: category.title,
    description: category.description,

    alternates: {
      canonical,
    },

    robots: {
      index: !filtered,
      follow: true,
    },

    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: canonical,
      siteName: SITE_NAME,
      title: `${category.title} | ${SITE_NAME}`,
      description: category.description,
      images: ["/opengraph-image"],
    },

    twitter: {
      card: "summary_large_image",
      title: `${category.title} | ${SITE_NAME}`,
      description: category.description,
      images: ["/opengraph-image"],
    },
  };
}

/* ======================================================
   STRONA POJEDYNCZEJ KATEGORII
====================================================== */

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;

  const { filters, page: requestedPage } =
    readFilters(await searchParams);

  const categories = await getCategories();

  const category = findCategoryBySlug(
    categories,
    slug
  );

  if (!category) {
    notFound();
  }

  const products = await getProducts({
    category: category.name,
    query: filters.query || undefined,
    maxPrice: filters.maxPrice
      ? Number(filters.maxPrice)
      : undefined,
    sort: filters.sort,
  });

  const total = products.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages
  );

  const start =
    (currentPage - 1) * PAGE_SIZE;

  const visibleProducts = products.slice(
    start,
    start + PAGE_SIZE
  );

  const categoryBase =
    `/kategoria/${category.slug}`;

  const siteUrl = getSiteUrl();

  const categoryUrl =
    `${siteUrl}${categoryBase}`;

  const filtered =
    hasFilters(filters) || requestedPage > 1;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#webpage`,
        url: categoryUrl,
        name: category.title,
        description: category.description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        breadcrumb: {
          "@id": `${categoryUrl}#breadcrumb`,
        },
        ...(!filtered
          ? {
              mainEntity: {
                "@id": `${categoryUrl}#products`,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${categoryUrl}#breadcrumb`,
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
            item: `${siteUrl}/kategorie`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
      ...(!filtered
        ? [
            {
              "@type": "ItemList",
              "@id": `${categoryUrl}#products`,
              name: `Produkty: ${category.name}`,
              numberOfItems: total,
              itemListElement: visibleProducts.map(
                (product, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: product.name,
                  url:
                    `${siteUrl}/produkt/${product.slug}`,
                  image: product.image,
                })
              ),
            },
          ]
        : []),
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

      {/* NAGŁÓWEK KATEGORII */}

      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-6 sm:pb-9 sm:pt-8">
          <nav
            aria-label="Okruszki"
            className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold text-stone-500"
          >
            <Link
              href="/"
              className="hover:text-rose-700"
            >
              Start
            </Link>

            <span aria-hidden="true">/</span>

            <Link
              href="/kategorie"
              className="hover:text-rose-700"
            >
              Kategorie
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="text-stone-800"
            >
              {category.name}
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                Kategoria produktów
              </p>

              <h1 className="mt-3 text-[clamp(2.1rem,5vw,3.7rem)] font-black leading-tight tracking-[-0.05em] text-stone-950">
                {category.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                {category.intro}
              </p>
            </div>

            <Link
              href="/kategorie"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-extrabold text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              ← Wszystkie kategorie
            </Link>
          </div>
        </div>
      </header>

      {/* FILTRY */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
        <section
          aria-labelledby="category-filters-heading"
          className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="category-filters-heading"
              className="text-base font-black text-stone-900"
            >
              Znajdź swój produkt
            </h2>

            {hasFilters(filters) && (
              <Link
                href={categoryBase}
                className="text-xs font-extrabold text-rose-700 hover:text-rose-800"
              >
                Wyczyść filtry
              </Link>
            )}
          </div>

          <form
            action={categoryBase}
            method="get"
            className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] lg:items-end"
          >
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <label
                htmlFor="category-search"
                className="mb-1.5 block text-xs font-extrabold text-stone-600"
              >
                Szukaj w kategorii
              </label>

              <input
                id="category-search"
                type="search"
                name="q"
                maxLength={120}
                defaultValue={filters.query}
                placeholder="Np. oversize, czarny, elegancki..."
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100 sm:text-sm"
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="category-price"
                className="mb-1.5 block text-xs font-extrabold text-stone-600"
              >
                Budżet
              </label>

              <select
                id="category-price"
                name="maxPrice"
                defaultValue={filters.maxPrice}
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-2 text-sm font-semibold text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 sm:px-3"
              >
                <option value="">Dowolny</option>
                <option value="50">Do 50 zł</option>
                <option value="100">Do 100 zł</option>
                <option value="150">Do 150 zł</option>
                <option value="200">Do 200 zł</option>
                <option value="300">Do 300 zł</option>

                {filters.maxPrice &&
                  ![
                    "50",
                    "100",
                    "150",
                    "200",
                    "300",
                  ].includes(filters.maxPrice) && (
                    <option value={filters.maxPrice}>
                      Do {filters.maxPrice} zł
                    </option>
                  )}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="category-sort"
                className="mb-1.5 block text-xs font-extrabold text-stone-600"
              >
                Sortowanie
              </label>

              <select
                id="category-sort"
                name="sort"
                defaultValue={filters.sort}
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-2 text-sm font-semibold text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 sm:px-3"
              >
                <option value="newest">
                  Najnowsze
                </option>

                <option value="price-asc">
                  Najtańsze
                </option>

                <option value="price-desc">
                  Najdroższe
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="col-span-2 min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700 lg:col-span-1"
            >
              Pokaż produkty
            </button>
          </form>

          {/* SZYBKIE BUDŻETY */}

          <div className="horizontal-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
            <FilterShortcut
              label="Wszystkie ceny"
              active={!filters.maxPrice}
              href={categoryHref(category.slug, {
                ...filters,
                maxPrice: "",
              })}
            />

            <FilterShortcut
              label="Do 50 zł"
              active={filters.maxPrice === "50"}
              href={categoryHref(category.slug, {
                ...filters,
                maxPrice: "50",
              })}
            />

            <FilterShortcut
              label="Do 100 zł"
              active={filters.maxPrice === "100"}
              href={categoryHref(category.slug, {
                ...filters,
                maxPrice: "100",
              })}
            />

            <FilterShortcut
              label="Do 200 zł"
              active={filters.maxPrice === "200"}
              href={categoryHref(category.slug, {
                ...filters,
                maxPrice: "200",
              })}
            />
          </div>
        </section>

        {/* LICZNIK WYNIKÓW */}

        <section
          aria-labelledby="category-results-heading"
          className="mt-7"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                Znaleziska
              </p>

              <h2
                id="category-results-heading"
                className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
              >
                {filters.query
                  ? `Wyniki dla „${filters.query}”`
                  : "Produkty w kategorii"}
              </h2>

              <p
                aria-live="polite"
                className="mt-1 text-sm text-stone-600"
              >
                {total === 0
                  ? "Brak pasujących produktów"
                  : `Pokazujemy ${
                      start + 1
                    }–${
                      start + visibleProducts.length
                    } z ${productCount(total)}`}
              </p>
            </div>

            <Link
              href="/okazje"
              className="text-sm font-extrabold text-rose-700 hover:text-rose-800"
            >
              Pełny katalog →
            </Link>
          </div>

          {/* AKTYWNE FILTRY */}

          {hasFilters(filters) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.query && (
                <ActiveFilter
                  label={`Szukane: ${filters.query}`}
                  href={categoryHref(
                    category.slug,
                    {
                      ...filters,
                      query: "",
                    }
                  )}
                />
              )}

              {filters.maxPrice && (
                <ActiveFilter
                  label={`Do ${filters.maxPrice} zł`}
                  href={categoryHref(
                    category.slug,
                    {
                      ...filters,
                      maxPrice: "",
                    }
                  )}
                />
              )}

              {filters.sort !== "newest" && (
                <ActiveFilter
                  label={
                    filters.sort === "price-asc"
                      ? "Najtańsze"
                      : "Najdroższe"
                  }
                  href={categoryHref(
                    category.slug,
                    {
                      ...filters,
                      sort: "newest",
                    }
                  )}
                />
              )}
            </div>
          )}

          {/* PRODUKTY */}

          {total > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <CategoryProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  slug={category.slug}
                  filters={filters}
                  current={currentPage}
                  total={totalPages}
                />
              )}
            </>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-rose-200 bg-white px-5 py-12 text-center">
              <h3 className="text-xl font-black text-stone-900">
                Nic tutaj nie znaleźliśmy
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-stone-600">
                Spróbuj innego hasła, zwiększ
                budżet albo wróć do wszystkich
                produktów tej kategorii.
              </p>

              <Link
                href={categoryBase}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white hover:bg-rose-700"
              >
                Pokaż całą kategorię
              </Link>
            </div>
          )}
        </section>

        {/* PORADNIK KATEGORII */}

        <details className="group mt-9 rounded-[22px] border border-stone-200 bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-black text-stone-900 [&::-webkit-details-marker]:hidden sm:px-6">
            <span>
              Jak wybierać produkty z kategorii{" "}
              {category.name}?
            </span>

            <span
              aria-hidden="true"
              className="shrink-0 text-xl text-rose-700 transition group-open:rotate-45"
            >
              +
            </span>
          </summary>

          <div className="border-t border-stone-100 px-5 py-5 sm:px-6">
            <p className="max-w-3xl text-sm leading-7 text-stone-600">
              {category.intro}
            </p>

            <ul className="mt-4 max-w-3xl space-y-3">
              {category.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 text-sm leading-6 text-stone-600"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 font-black text-rose-700"
                  >
                    ✓
                  </span>

                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs leading-6 text-stone-500">
              Ceny w katalogu są zapisane
              podczas publikacji. Aktualną cenę,
              wariant i warunki zakupu sprawdź
              w sklepie docelowym.
            </p>
          </div>
        </details>

        {/* INNE KATEGORIE */}

        <div className="mt-8 rounded-[22px] bg-rose-50/70 p-5 sm:p-6">
          <h2 className="text-lg font-black text-stone-900">
            Chcesz odkryć coś innego?
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Przejrzyj pozostałe kategorie
            albo wszystkie znaleziska.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/kategorie"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100"
            >
              Wszystkie kategorie
            </Link>

            <Link
              href="/promocje-shein"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-extrabold text-white transition hover:bg-rose-700"
            >
              Promocje SHEIN →
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

/* ======================================================
   KOMPAKTOWA KARTA PRODUKTU
====================================================== */

function CategoryProductCard({
  product,
}: {
  product: Product;
}) {
  const name =
    product.shortName?.trim() ||
    product.name?.trim() ||
    "Produkt";

  const image = product.image?.trim();

  return (
    <article className="group flex h-full min-w-0 overflow-hidden rounded-[17px] border border-stone-200 bg-white shadow-[0_4px_16px_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md sm:rounded-[23px]">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz produkt: ${name}`}
        className="flex h-full w-full min-w-0 flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-[#f6f4f2] md:aspect-[4/5]">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-stone-500">
              Zdjęcie niedostępne
            </div>
          )}

        </div>

        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
          <h3 className="line-clamp-2 min-h-[2.55em] text-[13px] font-extrabold leading-[1.28] tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:text-base">
            {name}
          </h3>

          <div className="mt-auto pt-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong className="text-[18px] font-black tracking-[-0.04em] text-stone-950 sm:text-2xl">
                {formatPrice(product.price)}
              </strong>

            </div>

            <p className="mt-1 hidden text-xs leading-5 text-stone-500 sm:block">
              Cena zapisana przy publikacji
            </p>

            <span className="mt-2.5 flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-2 text-xs font-extrabold text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white sm:mt-4 sm:min-h-11 sm:text-sm">
              Zobacz produkt →

            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ======================================================
   AKTYWNE FILTRY
====================================================== */

function FilterShortcut({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-xs font-extrabold transition ${
        active
          ? "border-rose-600 bg-rose-600 text-white"
          : "border-stone-200 bg-stone-50 text-stone-700 hover:border-rose-200 hover:bg-rose-50"
      }`}
    >
      {label}
    </Link>
  );
}

function ActiveFilter({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Usuń filtr: ${label}`}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
    >
      {label}
      <span aria-hidden="true">×</span>
    </Link>
  );
}

/* ======================================================
   PAGINACJA
====================================================== */

function Pagination({
  slug,
  filters,
  current,
  total,
}: {
  slug: string;
  filters: Filters;
  current: number;
  total: number;
}) {
  const pages = [
    ...new Set([
      1,
      current - 1,
      current,
      current + 1,
      total,
    ]),
  ]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="Strony produktów"
      className="mt-8 flex flex-col items-center gap-3"
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center">
        {current > 1 ? (
          <Link
            href={categoryHref(
              slug,
              filters,
              current - 1
            )}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-bold text-stone-800 hover:text-rose-700"
          >
            ← Poprzednia
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center rounded-xl bg-stone-100 px-3.5 text-sm font-bold text-stone-400"
          >
            ← Poprzednia
          </span>
        )}

        <span className="text-sm font-extrabold text-stone-600 sm:hidden">
          {current} / {total}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((page, index) => (
            <span
              key={page}
              className="flex items-center gap-1"
            >
              {index > 0 &&
                page - pages[index - 1] > 1 && (
                  <span
                    aria-hidden="true"
                    className="px-1 text-stone-400"
                  >
                    …
                  </span>
                )}

              <Link
                href={categoryHref(
                  slug,
                  filters,
                  page
                )}
                aria-current={
                  page === current
                    ? "page"
                    : undefined
                }
                className={`flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-extrabold ${
                  page === current
                    ? "bg-rose-600 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:text-rose-700"
                }`}
              >
                {page}
              </Link>
            </span>
          ))}
        </div>

        {current < total ? (
          <Link
            href={categoryHref(
              slug,
              filters,
              current + 1
            )}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-bold text-stone-800 hover:text-rose-700"
          >
            Następna →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center rounded-xl bg-stone-100 px-3.5 text-sm font-bold text-stone-400"
          >
            Następna →
          </span>
        )}
      </div>

      <p className="text-xs text-stone-500">
        Filtry zostają zachowane przy zmianie strony.
      </p>
    </nav>
  );
}
