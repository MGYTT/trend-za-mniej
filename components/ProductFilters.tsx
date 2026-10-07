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
  const hasAdvancedFilters =
    Boolean(
      category ||
        maxPrice ||
        (
          sort &&
          sort !==
            "newest"
        )
    );

  const hasFilters =
    Boolean(
      query ||
        hasAdvancedFilters
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(
    hasAdvancedFilters
  );

  return (
    <form
      action="/okazje"
      method="get"
      className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
          Wyszukiwanie
        </p>

        <h2 className="mt-1 text-lg font-black">
          Znajdź produkt
        </h2>
      </div>

      <div className="mt-4">
        <label
          htmlFor="q"
          className="sr-only"
        >
          Szukaj produktów
        </label>

        <div className="relative">
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
            id="q"
            name="q"
            type="search"
            defaultValue={
              query
            }
            placeholder="Np. sweter, bluza..."
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
          />
        </div>

        <button
          type="submit"
          className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-rose-600 px-5 font-black text-white transition hover:bg-rose-700"
        >
          Szukaj
        </button>
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
        className="mt-3 flex min-h-11 w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 lg:hidden"
      >
        <span className="flex items-center gap-2">
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

          Filtry i sortowanie
        </span>

        <span
          className={[
            "transition",
            filtersOpen
              ? "rotate-180"
              : "",
          ].join(" ")}
        >
          ↓
        </span>
      </button>

      <div
        className={[
          "mt-4 space-y-4 border-t border-stone-100 pt-4",
          filtersOpen
            ? "block"
            : "hidden",
          "lg:block",
        ].join(" ")}
      >
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-stone-500"
          >
            Kategoria
          </label>

          <select
            id="category"
            name="category"
            defaultValue={
              category ||
              "all"
            }
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
          <label
            htmlFor="maxPrice"
            className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-stone-500"
          >
            Budżet
          </label>

          <select
            id="maxPrice"
            name="maxPrice"
            defaultValue={
              maxPrice
            }
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
          >
            <option value="">
              Bez limitu
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
        </div>

        <div>
          <label
            htmlFor="sort"
            className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-stone-500"
          >
            Sortowanie
          </label>

          <select
            id="sort"
            name="sort"
            defaultValue={
              sort ||
              "newest"
            }
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
        </div>

        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-5 font-black text-white transition hover:bg-rose-600"
        >
          Zastosuj filtry
        </button>
      </div>

      {hasFilters && (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <Link
            href="/okazje"
            className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-stone-100 px-4 text-sm font-black text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            ✕ Wyczyść filtry
          </Link>
        </div>
      )}
    </form>
  );
}