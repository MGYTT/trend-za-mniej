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
      className="rounded-[28px] border border-stone-200/80 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900">
            Znajdź coś dla
            siebie
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-500">
            Wyszukaj produkt albo
            zawęź wyniki.
          </p>
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
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3.5 text-sm font-bold text-rose-700 lg:hidden"
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

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label
            htmlFor="q"
            className="sr-only"
          >
            Wyszukaj produkt
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
              placeholder="Szukaj np. bluzy, swetra, torebki..."
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-4 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Szukaj
        </button>
      </div>

      <div
        className={[
          "mt-5 gap-4 border-t border-stone-100 pt-5",
          filtersOpen
            ? "grid"
            : "hidden",
          "lg:grid lg:grid-cols-3",
        ].join(" ")}
      >
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-500"
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
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
          >
            <option value="all">
              Wszystkie
              kategorie
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
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-500"
          >
            Maksymalna cena
          </label>

          <select
            id="maxPrice"
            name="maxPrice"
            defaultValue={
              maxPrice
            }
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-500"
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
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
          >
            <option value="newest">
              Najnowsze
            </option>

            <option value="price-asc">
              Cena: od
              najniższej
            </option>

            <option value="price-desc">
              Cena: od
              najwyższej
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="min-h-12 rounded-2xl border border-rose-200 bg-rose-50 px-6 font-black text-rose-700 transition hover:bg-rose-100 lg:col-span-3"
        >
          Zastosuj filtry
        </button>
      </div>

      {hasFilters && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <p className="text-xs font-medium text-stone-400">
            Aktywne są filtry
            wyszukiwania
          </p>

          <Link
            href="/okazje"
            className="rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            ✕ Wyczyść wszystko
          </Link>
        </div>
      )}
    </form>
  );
}