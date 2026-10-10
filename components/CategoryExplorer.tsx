"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

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

type CategoryGroup =
  | "all"
  | "clothes"
  | "accessories"
  | "beauty"
  | "home"
  | "other";

type GroupOption = {
  id: CategoryGroup;
  label: string;
  icon: string;
};

const GROUPS:
  GroupOption[] = [
  {
    id:
      "all",

    label:
      "Wszystkie",

    icon:
      "✨",
  },

  {
    id:
      "clothes",

    label:
      "Ubrania",

    icon:
      "👗",
  },

  {
    id:
      "accessories",

    label:
      "Buty i dodatki",

    icon:
      "👜",
  },

  {
    id:
      "beauty",

    label:
      "Beauty",

    icon:
      "💄",
  },

  {
    id:
      "home",

    label:
      "Dom i lifestyle",

    icon:
      "🏠",
  },

  {
    id:
      "other",

    label:
      "Pozostałe",

    icon:
      "🛍️",
  },
];

function getCategoryGroup(
  name: string
):
  Exclude<
    CategoryGroup,
    "all"
  > {
  return getCategoryPublicGroup(
    name
  );
}

function normalizeText(
  value: string
) {
  return value
    .toLocaleLowerCase(
      "pl"
    )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /ł/g,
      "l"
    );
}

export default function CategoryExplorer({
  categories,
}: {
  categories:
    CategoryExplorerItem[];
}) {
  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

  const [
    group,
    setGroup,
  ] =
    useState<CategoryGroup>(
      "all"
    );

  const groupCounts =
    useMemo(
      () => {
        const counts:
          Record<
            CategoryGroup,
            number
          > = {
          all:
            categories.length,

          clothes:
            0,

          accessories:
            0,

          beauty:
            0,

          home:
            0,

          other:
            0,
        };

        for (
          const category
          of categories
        ) {
          counts[
            getCategoryGroup(
              category.name
            )
          ] +=
            1;
        }

        return counts;
      },
      [
        categories,
      ]
    );

  const visibleGroups =
    GROUPS.filter(
      (
        item
      ) =>
        item.id ===
          "all" ||
        groupCounts[
          item.id
        ] >
          0
    );

  const filteredCategories =
    useMemo(
      () => {
        const normalizedQuery =
          normalizeText(
            query.trim()
          );

        return categories.filter(
          (
            category
          ) => {
            if (
              group !==
                "all" &&
              getCategoryGroup(
                category.name
              ) !==
                group
            ) {
              return false;
            }

            if (
              !normalizedQuery
            ) {
              return true;
            }

            return normalizeText(
              `${category.name} ${category.description}`
            ).includes(
              normalizedQuery
            );
          }
        );
      },
      [
        categories,
        group,
        query,
      ]
    );

  function clearFilters() {
    setQuery(
      ""
    );

    setGroup(
      "all"
    );
  }

  return (
    <div>
      <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
              type="search"
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Szukaj kategorii, np. koszulki, jeansy, marynarki..."
              aria-label="Szukaj kategorii produktów"
              className="min-h-[52px] w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-12 text-base outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 sm:text-sm"
            />

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery(
                    ""
                  )
                }
                aria-label="Wyczyść wyszukiwanie"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-stone-400 transition hover:bg-white hover:text-stone-700"
              >
                ×
              </button>
            )}
          </div>

          <p
            aria-live="polite"
            className="text-center text-xs font-bold text-stone-500 lg:min-w-[130px] lg:text-right"
          >
            {
              filteredCategories.length
            }{" "}
            z{" "}
            {
              categories.length
            }{" "}
            kategorii
          </p>
        </div>

        <div className="horizontal-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {visibleGroups.map(
            (
              item
            ) => {
              const active =
                group ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setGroup(
                      item.id
                    )
                  }
                  className={[
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-black transition",
                    active
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700",
                  ].join(
                    " "
                  )}
                >
                  <span
                    aria-hidden="true"
                  >
                    {
                      item.icon
                    }
                  </span>

                  <span>
                    {
                      item.label
                    }
                  </span>

                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[9px]",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-stone-100 text-stone-400",
                    ].join(
                      " "
                    )}
                  >
                    {
                      groupCounts[
                        item.id
                      ]
                    }
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {filteredCategories.length >
      0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map(
            (
              category
            ) => (
              <CategoryCard
                key={
                  category.slug
                }
                category={
                  category
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-xl">
            🔎
          </div>

          <h2 className="mt-4 text-xl font-black text-stone-900">
            Nie znaleźliśmy
            takiej kategorii
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
            Spróbuj wpisać inną
            nazwę albo pokaż
            wszystkie dostępne
            kategorie.
          </p>

          <button
            type="button"
            onClick={
              clearFilters
            }
            className="mt-5 min-h-11 rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800"
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
  category:
    CategoryExplorerItem;
}) {
  return (
    <Link
      href={`/kategoria/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={
            category.image
          }
          alt={`Kategoria ${category.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-950/45 to-transparent" />

        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-stone-700 shadow-sm backdrop-blur">
          {getProductCountLabel(
            category.count
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-600">
          Kategoria
        </p>

        <h2 className="mt-1 text-xl font-black tracking-[-0.025em] text-stone-900 transition group-hover:text-rose-700">
          {
            category.name
          }
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-500">
          {
            category.description
          }
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="text-sm font-black text-rose-600">
            Zobacz produkty
          </span>

          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-600 transition group-hover:translate-x-0.5 group-hover:bg-rose-100"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function getProductCountLabel(
  count: number
) {
  if (
    count ===
    1
  ) {
    return "1 produkt";
  }

  const lastTwo =
    count %
    100;

  const last =
    count %
    10;

  if (
    lastTwo >=
      12 &&
    lastTwo <=
      14
  ) {
    return `${count} produktów`;
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return `${count} produkty`;
  }

  return `${count} produktów`;
}