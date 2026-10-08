"use client";

import {
  useState,
} from "react";

import Link from "next/link";

type Props = {
  categories: string[];
  query: string;
  category: string;
  maxPrice: string;
  sort: string;
};

export default function ProductFilters({
  categories,
  query,
  category,
  maxPrice,
  sort,
}: Props) {
  const hasFilters =
    Boolean(
      query ||
        category ||
        maxPrice ||
        (
          sort &&
          sort !==
            "newest"
        )
    );

  const advancedFilterCount =
    [
      category,
      maxPrice,
      sort !==
      "newest"
        ? sort
        : "",
    ].filter(
      Boolean
    ).length;

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(
    advancedFilterCount >
      0
  );

  return (
    <>
      <DesktopFilters
        categories={
          categories
        }
        query={
          query
        }
        category={
          category
        }
        maxPrice={
          maxPrice
        }
        sort={
          sort
        }
        hasFilters={
          hasFilters
        }
      />

      <div className="lg:hidden">
        <form
          action="/okazje"
          method="get"
          className="rounded-[18px] border border-stone-200 bg-white p-3 shadow-sm"
        >
          {category && (
            <input
              type="hidden"
              name="category"
              value={
                category
              }
            />
          )}

          {maxPrice && (
            <input
              type="hidden"
              name="maxPrice"
              value={
                maxPrice
              }
            />
          )}

          {sort &&
            sort !==
              "newest" && (
              <input
                type="hidden"
                name="sort"
                value={
                  sort
                }
              />
            )}

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon />

              <input
                type="search"
                name="q"
                defaultValue={
                  query
                }
                placeholder="Szukaj produktu..."
                aria-label="Szukaj produktu"
                className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-10 pr-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-xl bg-stone-900 px-4 text-sm font-black text-white transition hover:bg-rose-600"
            >
              Szukaj
            </button>
          </div>
        </form>

        <div className="mt-2">
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (
                  current
                ) =>
                  !current
              )
            }
            aria-expanded={
              mobileOpen
            }
            aria-controls="mobile-product-filters"
            className="flex min-h-11 w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <FilterIcon />

              Filtry

              {advancedFilterCount >
                0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-black text-white">
                  {
                    advancedFilterCount
                  }
                </span>
              )}
            </span>

            <span
              aria-hidden="true"
              className={[
                "text-stone-400 transition",
                mobileOpen
                  ? "rotate-180"
                  : "",
              ].join(
                " "
              )}
            >
              ↓
            </span>
          </button>

          {mobileOpen && (
            <form
              id="mobile-product-filters"
              action="/okazje"
              method="get"
              className="mt-2 rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm"
            >
              {query && (
                <input
                  type="hidden"
                  name="q"
                  value={
                    query
                  }
                />
              )}

              <div className="grid gap-4">
                <FilterField
                  label="Kategoria"
                  htmlFor="mobile-category"
                >
                  <select
                    id="mobile-category"
                    name="category"
                    defaultValue={
                      category ||
                      "all"
                    }
                    className="filter-control"
                  >
                    <option value="all">
                      Wszystkie
                    </option>

                    {categories.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </FilterField>

                <FilterField
                  label="Cena"
                  htmlFor="mobile-price"
                >
                  <select
                    id="mobile-price"
                    name="maxPrice"
                    defaultValue={
                      maxPrice
                    }
                    className="filter-control"
                  >
                    <option value="">
                      Dowolna
                    </option>

                    <option value="50">
                      Do 50 zł
                    </option>

                    <option value="100">
                      Do 100 zł
                    </option>

                    <option value="150">
                      Do 150 zł
                    </option>

                    <option value="200">
                      Do 200 zł
                    </option>
                  </select>
                </FilterField>

                <FilterField
                  label="Sortowanie"
                  htmlFor="mobile-sort"
                >
                  <select
                    id="mobile-sort"
                    name="sort"
                    defaultValue={
                      sort ||
                      "newest"
                    }
                    className="filter-control"
                  >
                    <option value="newest">
                      Najnowsze
                    </option>

                    <option value="price-asc">
                      Cena: od najniższej
                    </option>

                    <option value="price-desc">
                      Cena: od najwyższej
                    </option>
                  </select>
                </FilterField>

                <button
                  type="submit"
                  className="flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-black text-white transition hover:bg-rose-600"
                >
                  Zastosuj
                </button>

                {hasFilters && (
                  <Link
                    href="/okazje"
                    className="flex min-h-10 items-center justify-center text-sm font-bold text-stone-500 transition hover:text-rose-600"
                  >
                    Wyczyść filtry
                  </Link>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function DesktopFilters({
  categories,
  query,
  category,
  maxPrice,
  sort,
  hasFilters,
}: Props & {
  hasFilters: boolean;
}) {
  return (
    <form
      action="/okazje"
      method="get"
      className="hidden rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm lg:block"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-stone-900">
          Filtry
        </h2>

        {hasFilters && (
          <Link
            href="/okazje"
            className="text-xs font-bold text-stone-400 transition hover:text-rose-600"
          >
            Wyczyść
          </Link>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="desktop-search"
          className="mb-1.5 block text-xs font-bold text-stone-500"
        >
          Szukaj
        </label>

        <div className="relative">
          <SearchIcon />

          <input
            id="desktop-search"
            name="q"
            type="search"
            defaultValue={
              query
            }
            placeholder="Np. sweter..."
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-10 pr-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
        </div>
      </div>

      <div className="mt-5 border-t border-stone-100 pt-4">
        <FilterField
          label="Kategoria"
          htmlFor="desktop-category"
        >
          <select
            id="desktop-category"
            name="category"
            defaultValue={
              category ||
              "all"
            }
            className="filter-control"
          >
            <option value="all">
              Wszystkie
            </option>

            {categories.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {
                    item
                  }
                </option>
              )
            )}
          </select>
        </FilterField>

        <div className="mt-4">
          <FilterField
            label="Cena"
            htmlFor="desktop-price"
          >
            <select
              id="desktop-price"
              name="maxPrice"
              defaultValue={
                maxPrice
              }
              className="filter-control"
            >
              <option value="">
                Dowolna
              </option>

              <option value="50">
                Do 50 zł
              </option>

              <option value="100">
                Do 100 zł
              </option>

              <option value="150">
                Do 150 zł
              </option>

              <option value="200">
                Do 200 zł
              </option>
            </select>
          </FilterField>
        </div>

        <div className="mt-4">
          <FilterField
            label="Sortowanie"
            htmlFor="desktop-sort"
          >
            <select
              id="desktop-sort"
              name="sort"
              defaultValue={
                sort ||
                "newest"
              }
              className="filter-control"
            >
              <option value="newest">
                Najnowsze
              </option>

              <option value="price-asc">
                Cena: najniższa
              </option>

              <option value="price-desc">
                Cena: najwyższa
              </option>
            </select>
          </FilterField>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-black text-white transition hover:bg-rose-600"
      >
        Zastosuj
      </button>
    </form>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={
          htmlFor
        }
        className="mb-1.5 block text-xs font-bold text-stone-500"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
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
  );
}

function FilterIcon() {
  return (
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
  );
}