
import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { slugifyCategory } from "@/lib/categories";
import {
  getCategories,
  getProducts,
  type ProductSort,
} from "@/lib/products";
import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const revalidate = 60;

const PER_PAGE = 16;
const BUDGETS = ["50", "100", "150", "200"] as const;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  maxPrice?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

type Filters = {
  query: string;
  category: string;
  maxPrice: string;
  sort: ProductSort;
};

function one(
  value: string | string[] | undefined
): string {
  return typeof value === "string"
    ? value
    : Array.isArray(value)
      ? value[0] ?? ""
      : "";
}

function readParams(params: SearchParams): {
  filters: Filters;
  page: number;
} {
  const query = one(params.q)
    .trim()
    .slice(0, 120);

  const categoryValue = one(params.category)
    .trim()
    .slice(0, 100);

  const category =
    categoryValue === "all" ? "" : categoryValue;

  const priceRaw = one(params.maxPrice).trim();
  const price = Number(priceRaw);

  const maxPrice =
    priceRaw &&
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
    pageNumber >= 1
      ? Math.min(pageNumber, 100000)
      : 1;

  return {
    filters: {
      query,
      category,
      maxPrice,
      sort,
    },
    page,
  };
}

function offersHref(
  filters: Filters,
  page = 1
) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.category) {
    params.set("category", filters.category);
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

  return search
    ? `/okazje?${search}`
    : "/okazje";
}

function filtersActive(filters: Filters) {
  return Boolean(
    filters.query ||
      filters.category ||
      filters.maxPrice ||
      filters.sort !== "newest"
  );
}

/* METADANE SEO */

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { filters, page } = readParams(
    await searchParams
  );

  const hasCustomView =
    filtersActive(filters) || page > 1;

  const title = filters.query
    ? `Wyniki dla „${filters.query}”`
    : filters.category
      ? `${filters.category} – modne znaleziska`
      : "Wszystkie okazje";

  const description =
    "Przeglądaj produkty, ubrania i dodatki w Trend za Mniej. Filtruj według kategorii i budżetu oraz porównuj ceny zapisane przy publikacji.";

  return {
    title,
    description,

    alternates: {
      canonical: "/okazje",
    },

    robots: {
      index: !hasCustomView,
      follow: true,
    },

    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: "/okazje",
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

/* GŁÓWNA STRONA KATALOGU */

export default async function OffersPage({
  searchParams,
}: PageProps) {
  const {
    filters,
    page: requestedPage,
  } = readParams(await searchParams);

  const [allProducts, categories] =
    await Promise.all([
      getProducts({
        query: filters.query || undefined,
        category:
          filters.category || undefined,
        maxPrice: filters.maxPrice
          ? Number(filters.maxPrice)
          : undefined,
        sort: filters.sort,
      }),
      getCategories(),
    ]);

  const total = allProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PER_PAGE)
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages
  );

  const startIndex =
    (currentPage - 1) * PER_PAGE;

  const visibleProducts = allProducts.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  const hasFilters = filtersActive(filters);

  const categoryList = [
    ...new Set(categories.filter(Boolean)),
  ];

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/okazje`;

  const structuredData =
    !hasFilters && requestedPage === 1
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: "Wszystkie okazje",
              inLanguage: SITE_LANGUAGE,
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
              mainEntity: {
                "@id": `${pageUrl}#products`,
              },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${pageUrl}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Strona główna",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Okazje",
                  item: pageUrl,
                },
              ],
            },
            {
              "@type": "ItemList",
              "@id": `${pageUrl}#products`,
              name: "Najnowsze okazje",
              numberOfItems: total,
              itemListOrder:
                "https://schema.org/ItemListOrderDescending",
              itemListElement: allProducts
                .slice(0, 50)
                .map((product, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: `${siteUrl}/produkt/${product.slug}`,
                  name: product.name,
                  image: product.image,
                })),
            },
          ],
        }
      : null;

  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-900 lg:pb-0">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              structuredData
            ).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <SiteHeader />

      {/* NAGŁÓWEK KATALOGU */}

      <header className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-36 h-80 w-80 rounded-full bg-rose-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 sm:pb-9 sm:pt-11">
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
              Okazje
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                Katalog Trend za Mniej
              </span>

              <h1 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Znajdź swój{" "}
                <span className="text-rose-600">
                  nowy ulubiony produkt.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                Przeglądaj inspiracje, wybieraj
                kategorie i szukaj produktów
                w swoim budżecie.
              </p>
            </div>

            <Link
              href="/promocje-shein"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-extrabold text-white transition hover:bg-rose-700"
            >
              Promocje SHEIN
              <span
                aria-hidden="true"
                className="ml-2"
              >
                ↗
              </span>
            </Link>
          </div>

          <SearchForm filters={filters} />

          {/* SZYBKIE FILTRY */}

          <div className="horizontal-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <QuickChip
              label="Wszystkie"
              href="/okazje"
              active={!hasFilters}
            />

            <QuickChip
              label="Do 50 zł"
              href={offersHref({
                ...filters,
                maxPrice: "50",
              })}
              active={
                filters.maxPrice === "50"
              }
            />

            <QuickChip
              label="Do 100 zł"
              href={offersHref({
                ...filters,
                maxPrice: "100",
              })}
              active={
                filters.maxPrice === "100"
              }
            />

            <QuickChip
              label="Najtańsze"
              href={offersHref({
                ...filters,
                sort: "price-asc",
              })}
              active={
                filters.sort === "price-asc"
              }
            />

            <Link
              href="/tiktok"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-stone-200 bg-stone-50 px-4 text-sm font-bold text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Z TikToka ↗
            </Link>
          </div>
        </div>
      </header>

      {/* GŁÓWNA CZĘŚĆ KATALOGU */}

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <section
          aria-labelledby="catalog-filter-heading"
          className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="catalog-filter-heading"
                className="text-base font-extrabold text-stone-900"
              >
                Dopasuj wyniki
              </h2>

              <p className="mt-0.5 text-xs text-stone-500">
                Kategoria, maksymalna cena
                i sortowanie.
              </p>
            </div>

            {hasFilters && (
              <Link
                href="/okazje"
                className="text-xs font-extrabold text-rose-700 hover:text-rose-800"
              >
                Wyczyść wszystko
              </Link>
            )}
          </div>

          {/* FILTRY DESKTOP */}

          <div className="mt-4 hidden md:block">
            <FilterForm
              filters={filters}
              categories={categoryList}
              prefix="desktop"
            />
          </div>

          {/* FILTRY TELEFON */}

          <details
            className="group mt-4 md:hidden"
            open={Boolean(
              filters.category ||
                filters.maxPrice ||
                filters.sort !== "newest"
            )}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold text-stone-800 [&::-webkit-details-marker]:hidden">
              <span>
                Filtry i sortowanie
                {filters.category ||
                filters.maxPrice ||
                filters.sort !== "newest"
                  ? " · aktywne"
                  : ""}
              </span>

              <span
                aria-hidden="true"
                className="text-lg text-rose-700 transition group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>

            <div className="pt-3">
              <FilterForm
                filters={filters}
                categories={categoryList}
                prefix="mobile"
              />
            </div>
          </details>
        </section>

        {/* SZYBKI WYBÓR KATEGORII */}

        {categoryList.length > 0 && (
          <nav
            aria-label="Szybki wybór kategorii"
            className="horizontal-scroll mt-5 flex gap-2 overflow-x-auto pb-1"
          >
            <Link
              href={offersHref({
                ...filters,
                category: "",
              })}
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-bold ${
                !filters.category
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              Wszystkie kategorie
            </Link>

            {categoryList
              .slice(0, 10)
              .map((item) => (
                <Link
                  key={item}
                  href={offersHref({
                    ...filters,
                    category: item,
                  })}
                  aria-current={
                    filters.category === item
                      ? "true"
                      : undefined
                  }
                  className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-bold transition hover:border-rose-200 hover:text-rose-700 ${
                    filters.category === item
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  {item}
                </Link>
              ))}

            <Link
              href="/kategorie"
              className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-stone-200 bg-white px-4 text-xs font-extrabold text-rose-700"
            >
              Więcej kategorii ↗
            </Link>
          </nav>
        )}

        {/* WYNIKI */}

        <section
          aria-labelledby="catalog-results-heading"
          className="mt-7"
        >
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                Twoje znaleziska
              </p>

              <h2
                id="catalog-results-heading"
                className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl"
              >
                {filters.query
                  ? `Wyniki dla „${filters.query}”`
                  : filters.category ||
                    "Wszystkie produkty"}
              </h2>

              <p
                className="mt-1 text-sm text-stone-600"
                aria-live="polite"
              >
                {total === 0
                  ? "Brak pasujących produktów"
                  : `Pokazujemy ${
                      startIndex + 1
                    }–${
                      startIndex +
                      visibleProducts.length
                    } z ${total} produktów`}
              </p>
            </div>

            {filters.category && (
              <Link
                href={`/kategoria/${slugifyCategory(
                  filters.category
                )}`}
                className="text-sm font-bold text-rose-700 hover:text-rose-800"
              >
                Zobacz stronę kategorii ↗
              </Link>
            )}
          </div>

          {/* AKTYWNE FILTRY */}

          {hasFilters && (
            <div
              aria-label="Aktywne filtry"
              className="mt-4 flex flex-wrap gap-2"
            >
              {filters.query && (
                <FilterTag
                  label={`Szukane: ${filters.query}`}
                  href={offersHref({
                    ...filters,
                    query: "",
                  })}
                />
              )}

              {filters.category && (
                <FilterTag
                  label={filters.category}
                  href={offersHref({
                    ...filters,
                    category: "",
                  })}
                />
              )}

              {filters.maxPrice && (
                <FilterTag
                  label={`Do ${filters.maxPrice} zł`}
                  href={offersHref({
                    ...filters,
                    maxPrice: "",
                  })}
                />
              )}

              {filters.sort ===
                "price-asc" && (
                <FilterTag
                  label="Najtańsze"
                  href={offersHref({
                    ...filters,
                    sort: "newest",
                  })}
                />
              )}

              {filters.sort ===
                "price-desc" && (
                <FilterTag
                  label="Najdroższe"
                  href={offersHref({
                    ...filters,
                    sort: "newest",
                  })}
                />
              )}
            </div>
          )}

          {/* SIATKA PRODUKTÓW */}

          {total > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
  {visibleProducts.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      compactOnMobile
    />
  ))}
</div>

              {totalPages > 1 && (
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  filters={filters}
                />
              )}
            </>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-rose-200 bg-white px-6 py-12 text-center sm:py-16">
              <div
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl"
              >
                ⌕
              </div>

              <h3 className="mt-4 text-xl font-black text-stone-900">
                Nie znaleźliśmy pasujących
                produktów
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-600">
                Spróbuj zmienić frazę,
                kategorię lub budżet.
                Możesz też wrócić
                do wszystkich znalezisk.
              </p>

              <Link
                href="/okazje"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-6 text-sm font-extrabold text-white transition hover:bg-rose-700"
              >
                Pokaż wszystkie okazje
              </Link>
            </div>
          )}
        </section>

        {/* PROMOCJE SHEIN */}

        <aside className="mt-9 rounded-[24px] bg-stone-900 px-5 py-7 text-white sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">
                Szukasz jeszcze więcej okazji?
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-300">
                Sprawdź kampanie i kody SHEIN.
                Warunki promocji oraz aktualne
                ceny potwierdzisz w sklepie.
              </p>
            </div>

            <Link
              href="/promocje-shein"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white transition hover:bg-rose-500"
            >
              Zobacz promocje →
            </Link>
          </div>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}

/* WYSZUKIWARKA */

function SearchForm({
  filters,
}: {
  filters: Filters;
}) {
  return (
    <form
      action="/okazje"
      method="get"
      role="search"
      className="mt-6 flex max-w-3xl flex-col gap-2 rounded-[20px] border border-stone-200 bg-white p-2 shadow-[0_10px_32px_rgba(28,25,23,0.07)] sm:flex-row"
    >
      {filters.category && (
        <input
          type="hidden"
          name="category"
          value={filters.category}
        />
      )}

      {filters.maxPrice && (
        <input
          type="hidden"
          name="maxPrice"
          value={filters.maxPrice}
        />
      )}

      {filters.sort !== "newest" && (
        <input
          type="hidden"
          name="sort"
          value={filters.sort}
        />
      )}

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">
          Szukaj produktów
        </span>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-stone-400"
        >
          ⌕
        </span>

        <input
          type="search"
          name="q"
          defaultValue={filters.query}
          placeholder="Np. sweter, sukienka, torebka..."
          enterKeyHint="search"
          maxLength={120}
          className="min-h-12 w-full rounded-xl bg-stone-50 py-3 pl-11 pr-3 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-rose-200 sm:min-h-14"
        />
      </label>

      <button
        type="submit"
        className="min-h-12 rounded-xl bg-rose-600 px-7 text-sm font-black text-white transition hover:bg-rose-700 sm:min-h-14"
      >
        Szukaj
      </button>
    </form>
  );
}

/* FORMULARZ FILTRÓW */

function FilterForm({
  filters,
  categories,
  prefix,
}: {
  filters: Filters;
  categories: string[];
  prefix: string;
}) {
  const inputClass =
    "min-h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-stone-800 outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100";

  const labelClass =
    "mb-1.5 block text-xs font-extrabold text-stone-600";

  return (
    <form
      action="/okazje"
      method="get"
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] md:items-end"
    >
      {filters.query && (
        <input
          type="hidden"
          name="q"
          value={filters.query}
        />
      )}

      <div className="min-w-0">
        <label
          htmlFor={`${prefix}-category`}
          className={labelClass}
        >
          Kategoria
        </label>

        <select
          id={`${prefix}-category`}
          name="category"
          defaultValue={filters.category}
          className={inputClass}
        >
          <option value="">
            Wszystkie kategorie
          </option>

          {filters.category &&
            !categories.includes(
              filters.category
            ) && (
              <option value={filters.category}>
                {filters.category}
              </option>
            )}

          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label
          htmlFor={`${prefix}-price`}
          className={labelClass}
        >
          Maksymalna cena
        </label>

        <select
          id={`${prefix}-price`}
          name="maxPrice"
          defaultValue={filters.maxPrice}
          className={inputClass}
        >
          <option value="">
            Dowolna cena
          </option>

          {filters.maxPrice &&
            !BUDGETS.includes(
              filters.maxPrice as
                (typeof BUDGETS)[number]
            ) && (
              <option
                value={filters.maxPrice}
              >
                Do {filters.maxPrice} zł
              </option>
            )}

          {BUDGETS.map((value) => (
            <option
              key={value}
              value={value}
            >
              Do {value} zł
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label
          htmlFor={`${prefix}-sort`}
          className={labelClass}
        >
          Sortowanie
        </label>

        <select
          id={`${prefix}-sort`}
          name="sort"
          defaultValue={filters.sort}
          className={inputClass}
        >
          <option value="newest">
            Od najnowszych
          </option>

          <option value="price-asc">
            Cena: od najniższej
          </option>

          <option value="price-desc">
            Cena: od najwyższej
          </option>
        </select>
      </div>

      <button
        type="submit"
        className="min-h-12 rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-rose-700"
      >
        Pokaż wyniki
      </button>
    </form>
  );
}

/* PRZYCISKI SZYBKICH FILTRÓW */

function QuickChip({
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
      aria-current={
        active ? "true" : undefined
      }
      className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-extrabold transition ${
        active
          ? "border-rose-600 bg-rose-600 text-white"
          : "border-stone-200 bg-white text-stone-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
      }`}
    >
      {label}
    </Link>
  );
}

/* ETYKIETY AKTYWNYCH FILTRÓW */

function FilterTag({
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

      <span
        aria-hidden="true"
        className="text-base leading-none"
      >
        ×
      </span>
    </Link>
  );
}

/* PAGINACJA */

function Pagination({
  current,
  total,
  filters,
}: {
  current: number;
  total: number;
  filters: Filters;
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
    .filter(
      (value) =>
        value >= 1 && value <= total
    )
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="Strony wyników"
      className="mt-8 flex flex-col items-center gap-3"
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center">
        {current > 1 ? (
          <Link
            href={offersHref(
              filters,
              current - 1
            )}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-rose-200 hover:text-rose-700"
          >
            ← Poprzednia
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-stone-100 px-4 text-sm font-bold text-stone-400"
          >
            ← Poprzednia
          </span>
        )}

        <span className="text-sm font-bold text-stone-600 sm:hidden">
          {current} / {total}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((value, index) => (
            <span
              key={value}
              className="flex items-center gap-1"
            >
              {index > 0 &&
                value - pages[index - 1] >
                  1 && (
                  <span
                    aria-hidden="true"
                    className="px-1 text-stone-400"
                  >
                    …
                  </span>
                )}

              <Link
                href={offersHref(
                  filters,
                  value
                )}
                aria-current={
                  value === current
                    ? "page"
                    : undefined
                }
                className={`flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-extrabold ${
                  value === current
                    ? "bg-rose-600 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:text-rose-700"
                }`}
              >
                {value}
              </Link>
            </span>
          ))}
        </div>

        {current < total ? (
          <Link
            href={offersHref(
              filters,
              current + 1
            )}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-rose-200 hover:text-rose-700"
          >
            Następna →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-stone-100 px-4 text-sm font-bold text-stone-400"
          >
            Następna →
          </span>
        )}
      </div>

      <p className="text-xs text-stone-500">
        Wybrane filtry zostają zachowane
        przy zmianie strony.
      </p>
    </nav>
  );
}
