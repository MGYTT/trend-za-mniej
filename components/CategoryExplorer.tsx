
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ProductPhoto from "@/components/ProductPhoto";
import {
  getCategoryPublicGroup,
} from "@/lib/product-categories";

export type CategoryExplorerItem = {
  name: string;
  slug: string;
  description: string;
  count: number;
  image: string;
};

type Group =
  | "all"
  | "clothes"
  | "accessories"
  | "beauty"
  | "home"
  | "other";

const GROUPS: {
  id: Group;
  label: string;
}[] = [
  { id: "all", label: "Wszystkie" },
  { id: "clothes", label: "Ubrania" },
  { id: "accessories", label: "Buty i dodatki" },
  { id: "beauty", label: "Beauty" },
  { id: "home", label: "Dom i lifestyle" },
  { id: "other", label: "Pozostałe" },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

function countLabel(count: number) {
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

export default function CategoryExplorer({
  categories,
}: {
  categories: CategoryExplorerItem[];
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] =
    useState<Group>("all");

  const counts = useMemo(() => {
    const result: Record<Group, number> = {
      all: categories.length,
      clothes: 0,
      accessories: 0,
      beauty: 0,
      home: 0,
      other: 0,
    };

    for (const category of categories) {
      result[
        getCategoryPublicGroup(category.name)
      ] += 1;
    }

    return result;
  }, [categories]);

  const visibleGroups = GROUPS.filter(
    (item) =>
      item.id === "all" ||
      counts[item.id] > 0
  );

  const visibleCategories = useMemo(() => {
    const search = normalize(query);

    return categories.filter((category) => {
      if (
        group !== "all" &&
        getCategoryPublicGroup(
          category.name
        ) !== group
      ) {
        return false;
      }

      return (
        !search ||
        normalize(
          `${category.name} ${category.description}`
        ).includes(search)
      );
    });
  }, [categories, group, query]);

  function reset() {
    setQuery("");
    setGroup("all");
  }

  return (
    <div>
      {/* WYSZUKIWARKA */}

      <div className="rounded-[20px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">
              Szukaj kategorii
            </span>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            >
              <SearchIcon />
            </span>

            <input
              type="search"
              value={query}
              maxLength={100}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Np. sukienki, bluzy, buty..."
              className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-11 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100 sm:text-sm"
            />

            {query && (
              <button
                type="button"
                aria-label="Wyczyść wyszukiwanie"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:bg-white"
              >
                ×
              </button>
            )}
          </label>

          <p
            aria-live="polite"
            className="shrink-0 text-xs font-bold text-stone-600 sm:px-2"
          >
            {visibleCategories.length} z{" "}
            {categories.length} kategorii
          </p>
        </div>

        {/* FILTRY */}

        <div className="horizontal-scroll -mx-3.5 mt-3 flex gap-2 overflow-x-auto px-3.5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {visibleGroups.map((item) => {
            const active = group === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setGroup(item.id)
                }
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-extrabold transition ${
                  active
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {item.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-stone-500"
                  }`}
                >
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KATEGORIE */}

      {visibleCategories.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visibleCategories.map(
            (category) => (
              <CategoryCard
                key={category.slug}
                category={category}
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-rose-200 bg-white px-5 py-10 text-center">
          <h3 className="text-lg font-black text-stone-900">
            Nie znaleźliśmy tej kategorii
          </h3>

          <p className="mt-2 text-sm text-stone-600">
            Spróbuj innej nazwy lub wyczyść
            filtry.
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-5 min-h-11 rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white hover:bg-rose-700"
          >
            Pokaż wszystkie
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  category,
}: {
  category: CategoryExplorerItem;
}) {
  return (
    <Link
      href={`/kategoria/${category.slug}`}
      aria-label={`${category.name} – ${countLabel(
        category.count
      )}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[17px] border border-stone-200 bg-white shadow-[0_4px_17px_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md sm:rounded-[24px]"
    >
      {/* ZDJĘCIE KATEGORII */}

      <div className="relative aspect-[5/4] w-full overflow-hidden bg-[#f5f3f1] sm:aspect-[4/3]">
        <ProductPhoto
          src={category.image}
          alt={`Produkt z kategorii ${category.name}`}
          sizes="(max-width: 767px) 47vw, (max-width: 1279px) 31vw, 24vw"
          fit="cover"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-stone-800 shadow-sm sm:bottom-3 sm:left-3 sm:px-3 sm:text-xs">
          {countLabel(category.count)}
        </span>
      </div>

      {/* NAZWA KATEGORII */}

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-rose-700 sm:text-xs">
          Kategoria
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5em] break-words text-[14px] font-black leading-[1.25] tracking-[-0.02em] text-stone-900 group-hover:text-rose-700 sm:text-lg">
          {category.name}
        </h3>

        <p className="mt-2 hidden line-clamp-2 text-xs leading-5 text-stone-500 sm:block">
          {category.description}
        </p>

        <span className="mt-auto flex min-h-9 items-center justify-between gap-1.5 pt-3 text-xs font-extrabold text-rose-700 sm:pt-4 sm:text-sm">
          Zobacz produkty

          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
