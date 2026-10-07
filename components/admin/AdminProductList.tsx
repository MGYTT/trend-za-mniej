"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import AdminProductActions from "@/components/admin/AdminProductActions";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  price: number | string;
  old_price: number | string | null;
  category: string;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  sold_text: string | null;
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
  productStats: Record<string, number>;
};

function formatPrice(
  price: number | string
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
  ] = useState<StatusFilter>(
    "all"
  );

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] = useState<SortOption>(
    "newest"
  );

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "pl"
        )
      );
    }, [products]);

  const filteredProducts =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      const result =
        products.filter(
          (product) => {
            const matchesQuery =
              !normalizedQuery ||
              product.name
                .toLowerCase()
                .includes(
                  normalizedQuery
                ) ||
              product.short_name
                .toLowerCase()
                .includes(
                  normalizedQuery
                ) ||
              product.category
                .toLowerCase()
                .includes(
                  normalizedQuery
                ) ||
              product.description
                .toLowerCase()
                .includes(
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

  const activeCount =
    products.filter(
      (product) =>
        product.active
    ).length;

  const hiddenCount =
    products.length -
    activeCount;

  const featuredCount =
    products.filter(
      (product) =>
        product.featured
    ).length;

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setSort("newest");
  }

  const hasFilters =
    query.trim() !== "" ||
    status !== "all" ||
    category !== "all" ||
    sort !== "newest";

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-black">
            Twoje oferty
          </h2>

          <p className="mt-1 text-stone-500">
            Kliknięcia pokazują
            wyniki z ostatnich 30
            dni.
          </p>
        </div>

        <Link
          href="/admin/statystyki?days=30"
          className="text-sm font-bold text-rose-600 hover:text-rose-700"
        >
          Pełna analityka →
        </Link>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
              Szukaj
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                🔎
              </span>

              <input
                type="search"
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Nazwa, opis lub kategoria..."
                className="w-full rounded-2xl border border-stone-200 py-3 pl-11 pr-4 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
              Status
            </label>

            <select
              value={status}
              onChange={(
                event
              ) =>
                setStatus(
                  event.target
                    .value as StatusFilter
                )
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
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
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
              Kategoria
            </label>

            <select
              value={
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event.target
                    .value
                )
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
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
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
              Sortowanie
            </label>

            <select
              value={sort}
              onChange={(
                event
              ) =>
                setSort(
                  event.target
                    .value as SortOption
                )
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
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
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center">
          <p className="text-sm text-stone-500">
            Wyświetlono{" "}
            <strong className="text-stone-900">
              {
                filteredProducts.length
              }
            </strong>{" "}
            z{" "}
            <strong className="text-stone-900">
              {products.length}
            </strong>{" "}
            ofert
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="text-left text-sm font-bold text-rose-600 transition hover:text-rose-700"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {products.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl">
              🛍️
            </div>

            <h3 className="mt-4 text-xl font-bold">
              Brak ofert
            </h3>

            <p className="mt-2 text-stone-500">
              Dodaj pierwszy
              produkt.
            </p>

            <Link
              href="/admin/nowa-oferta"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-bold text-white shadow-sm"
            >
              + Dodaj ofertę
            </Link>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl">
              🔎
            </div>

            <h3 className="mt-4 text-xl font-bold">
              Brak pasujących
              ofert
            </h3>

            <p className="mt-2 text-stone-500">
              Zmień wyszukiwanie
              albo wyczyść filtry.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-6 rounded-2xl bg-rose-50 px-6 py-3 font-bold text-rose-700 transition hover:bg-rose-100"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredProducts.map(
              (product) => {
                const clicks =
                  productStats[
                    product.id
                  ] ?? 0;

                return (
                  <div
                    key={
                      product.id
                    }
                    className="p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.name
                        }
                        className="h-32 w-full shrink-0 rounded-2xl object-cover sm:h-36 lg:h-28 lg:w-28"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                            {
                              product.category
                            }
                          </span>

                          {product.featured && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                              🔥 Gorąca
                            </span>
                          )}

                          {product.active ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              ● Opublikowana
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                              ● Ukryta
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-black">
                          {
                            product.short_name
                          }
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                          {
                            product.name
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                          <p className="text-xl font-black text-rose-600">
                            {formatPrice(
                              product.price
                            )}
                          </p>

                          {product.old_price !==
                            null && (
                            <p className="text-sm text-stone-400 line-through">
                              {formatPrice(
                                product.old_price
                              )}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <span>
                              🖱️
                            </span>

                            <span className="font-bold">
                              {
                                clicks
                              }
                            </span>

                            <span className="text-stone-400">
                              kliknięć /
                              30 dni
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-stone-400">
                          Dodano:{" "}
                          {new Intl.DateTimeFormat(
                            "pl-PL",
                            {
                              dateStyle:
                                "medium",
                            }
                          ).format(
                            new Date(
                              product.created_at
                            )
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3">
                        {product.active && (
                          <Link
                            href={`/produkt/${product.slug}`}
                            target="_blank"
                            className="rounded-xl border border-stone-200 px-5 py-2.5 text-center text-sm font-bold transition hover:border-rose-300 hover:text-rose-600"
                          >
                            👁️ Podgląd
                          </Link>
                        )}

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
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}