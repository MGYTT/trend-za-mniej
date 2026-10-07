"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import AdminProductActions from "@/components/admin/AdminProductActions";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  price: number | string;
  old_price:
    | number
    | string
    | null;
  category: string;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  sold_text:
    | string
    | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type StatusFilter =
  | "all"
  | "active"
  | "hidden"
  | "featured";

type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name";

type Props = {
  products: AdminProduct[];
  productStats: Record<
    string,
    number
  >;
};

function formatPrice(
  price:
    | number
    | string
) {
  return new Intl.NumberFormat(
    "pl-PL",
    {
      style: "currency",
      currency: "PLN",
    }
  ).format(
    Number(price)
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

export default function AdminProductList({
  products,
  productStats,
}: Props) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      "all"
    );

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "newest"
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            "pl"
          )
      );
    }, [products]);

  const activeCount =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.active
        ).length,
      [products]
    );

  const hiddenCount =
    products.length -
    activeCount;

  const featuredCount =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.featured
        ).length,
      [products]
    );

  const filteredProducts =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      const result =
        products.filter(
          (product) => {
            const haystack =
              [
                product.name,
                product.short_name,
                product.category,
                product.description,
              ]
                .join(" ")
                .toLowerCase();

            const matchesQuery =
              !normalizedQuery ||
              haystack.includes(
                normalizedQuery
              );

            const matchesCategory =
              category ===
                "all" ||
              product.category ===
                category;

            let matchesStatus =
              true;

            if (
              status ===
              "active"
            ) {
              matchesStatus =
                product.active;
            }

            if (
              status ===
              "hidden"
            ) {
              matchesStatus =
                !product.active;
            }

            if (
              status ===
              "featured"
            ) {
              matchesStatus =
                product.featured;
            }

            return (
              matchesQuery &&
              matchesCategory &&
              matchesStatus
            );
          }
        );

      result.sort(
        (a, b) => {
          switch (sort) {
            case "oldest":
              return (
                new Date(
                  a.created_at
                ).getTime() -
                new Date(
                  b.created_at
                ).getTime()
              );

            case "price-asc":
              return (
                Number(
                  a.price
                ) -
                Number(
                  b.price
                )
              );

            case "price-desc":
              return (
                Number(
                  b.price
                ) -
                Number(
                  a.price
                )
              );

            case "name":
              return a.short_name.localeCompare(
                b.short_name,
                "pl"
              );

            default:
              return (
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
              );
          }
        }
      );

      return result;
    }, [
      products,
      query,
      status,
      category,
      sort,
    ]);

  const hasFilters =
    query.trim() !== "" ||
    status !== "all" ||
    category !== "all" ||
    sort !== "newest";

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setSort("newest");
    setFiltersOpen(false);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
            Zarządzanie
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Twoje oferty
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-500">
            Kliknięcia dotyczą
            ostatnich 30 dni.
          </p>
        </div>

        <Link
          href="/admin/statystyki?days=30"
          className="hidden text-sm font-black text-rose-600 hover:text-rose-700 sm:block"
        >
          Analityka →
        </Link>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex gap-3">
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
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Szukaj produktu..."
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-4 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (current) =>
                  !current
              )
            }
            aria-expanded={
              filtersOpen
            }
            className={[
              "flex min-h-12 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-black transition lg:hidden",
              filtersOpen ||
              hasFilters
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-stone-200 bg-white text-stone-600",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>

            Filtry
          </button>
        </div>

        <div
          className={[
            "mt-4 gap-4 border-t border-stone-100 pt-4",
            filtersOpen
              ? "grid"
              : "hidden",
            "lg:grid lg:grid-cols-3",
          ].join(" ")}
        >
          <FilterSelect
            label="Status"
            value={
              status
            }
            onChange={(
              value
            ) =>
              setStatus(
                value as StatusFilter
              )
            }
          >
            <option value="all">
              Wszystkie (
              {
                products.length
              }
              )
            </option>

            <option value="active">
              Opublikowane (
              {
                activeCount
              }
              )
            </option>

            <option value="hidden">
              Ukryte (
              {
                hiddenCount
              }
              )
            </option>

            <option value="featured">
              Gorące (
              {
                featuredCount
              }
              )
            </option>
          </FilterSelect>

          <FilterSelect
            label="Kategoria"
            value={
              category
            }
            onChange={
              setCategory
            }
          >
            <option value="all">
              Wszystkie
            </option>

            {categories.map(
              (item) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>
              )
            )}
          </FilterSelect>

          <FilterSelect
            label="Sortowanie"
            value={
              sort
            }
            onChange={(
              value
            ) =>
              setSort(
                value as SortOption
              )
            }
          >
            <option value="newest">
              Najnowsze
            </option>

            <option value="oldest">
              Najstarsze
            </option>

            <option value="price-asc">
              Cena: rosnąco
            </option>

            <option value="price-desc">
              Cena: malejąco
            </option>

            <option value="name">
              Nazwa A–Z
            </option>
          </FilterSelect>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <p className="text-sm text-stone-500">
            <strong className="font-black text-stone-900">
              {
                filteredProducts.length
              }
            </strong>{" "}
            z{" "}
            <strong className="font-black text-stone-900">
              {
                products.length
              }
            </strong>{" "}
            ofert
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="rounded-full bg-stone-100 px-4 py-2 text-xs font-black text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"
            >
              ✕ Wyczyść
            </button>
          )}
        </div>
      </div>

      {products.length ===
      0 ? (
        <EmptyProducts />
      ) : filteredProducts.length ===
        0 ? (
        <EmptyFilters
          onClear={
            clearFilters
          }
        />
      ) : (
        <div className="mt-5 grid gap-4">
          {filteredProducts.map(
            (product) => {
              const clicks =
                productStats[
                  product.id
                ] ?? 0;

              return (
                <article
                  key={
                    product.id
                  }
                  className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm"
                >
                  <div className="grid sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)_auto]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 sm:aspect-auto sm:min-h-full">
                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.name
                        }
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {product.active ? (
                          <span className="rounded-full bg-green-50/95 px-3 py-1.5 text-[11px] font-black text-green-700 shadow-sm backdrop-blur">
                            ● Aktywna
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-100/95 px-3 py-1.5 text-[11px] font-black text-stone-600 shadow-sm backdrop-blur">
                            ● Ukryta
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-700">
                          {
                            product.category
                          }
                        </span>

                        {product.featured && (
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-700">
                            🔥 Gorąca
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-black leading-snug tracking-tight text-stone-900 sm:text-xl">
                        {
                          product.short_name
                        }
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                        {
                          product.name
                        }
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="text-xl font-black text-rose-600">
                          {formatPrice(
                            product.price
                          )}
                        </p>

                        {product.old_price !==
                          null && (
                          <p className="text-sm font-semibold text-stone-400 line-through">
                            {formatPrice(
                              product.old_price
                            )}
                          </p>
                        )}

                        <span className="h-4 w-px bg-stone-200" />

                        <p className="text-sm font-semibold text-stone-600">
                          🖱️{" "}
                          <strong className="font-black text-stone-900">
                            {
                              clicks
                            }
                          </strong>{" "}
                          / 30 dni
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-400">
                        <span>
                          Dodano{" "}
                          {formatDate(
                            product.created_at
                          )}
                        </span>

                        {product.active && (
                          <Link
                            href={`/produkt/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-rose-600 hover:text-rose-700"
                          >
                            Podgląd ↗
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-stone-100 p-4 sm:col-span-2 lg:col-span-1 lg:flex lg:w-[250px] lg:items-center lg:border-l lg:border-t-0 lg:p-5">
                      <div className="w-full">
                        <AdminProductActions
                          id={
                            product.id
                          }
                          active={
                            product.active
                          }
                          imageUrl={
                            product.image_url
                          }
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      <Link
        href="/admin/statystyki?days=30"
        className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-white font-black text-rose-700 sm:hidden"
      >
        Zobacz pełną analitykę →
      </Link>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-500">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
      >
        {children}
      </select>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="mt-5 rounded-[28px] border border-dashed border-rose-200 bg-white px-6 py-14 text-center">
      <div className="text-4xl">
        🛍️
      </div>

      <h3 className="mt-4 text-xl font-black">
        Nie masz jeszcze ofert
      </h3>

      <p className="mt-2 text-sm text-stone-500">
        Dodaj pierwszy produkt do
        Trend za Mniej.
      </p>

      <Link
        href="/admin/nowa-oferta"
        className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 font-black text-white"
      >
        + Dodaj pierwszą ofertę
      </Link>
    </div>
  );
}

function EmptyFilters({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="mt-5 rounded-[28px] border border-dashed border-stone-200 bg-white px-6 py-14 text-center">
      <div className="text-4xl">
        🔎
      </div>

      <h3 className="mt-4 text-xl font-black">
        Brak pasujących ofert
      </h3>

      <p className="mt-2 text-sm text-stone-500">
        Zmień wyszukiwanie albo
        wyczyść filtry.
      </p>

      <button
        type="button"
        onClick={
          onClear
        }
        className="mt-6 min-h-12 rounded-2xl bg-rose-50 px-6 font-black text-rose-700"
      >
        Wyczyść filtry
      </button>
    </div>
  );
}