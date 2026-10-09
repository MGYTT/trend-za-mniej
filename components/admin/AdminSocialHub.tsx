"use client";

import Link from "next/link";

import {
  type ReactNode,
  useMemo,
  useState,
} from "react";

export type AdminSocialProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  imageUrl: string;

  price:
    | number
    | string;

  active: boolean;
  featured: boolean;
};

type Filter =
  | "all"
  | "active"
  | "featured";

function formatPrice(
  value:
    | number
    | string
) {
  return new Intl.NumberFormat(
    "pl-PL",
    {
      style:
        "currency",

      currency:
        "PLN",
    }
  ).format(
    Number(
      value
    )
  );
}

export default function AdminSocialHub({
  products,
}: {
  products:
    AdminSocialProduct[];
}) {
  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "all"
    );

  const filteredProducts =
    useMemo(
      () => {
        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              "pl"
            );

        return products.filter(
          (
            product
          ) => {
            if (
              filter ===
                "active" &&
              !product.active
            ) {
              return false;
            }

            if (
              filter ===
                "featured" &&
              !product.featured
            ) {
              return false;
            }

            if (
              !normalizedQuery
            ) {
              return true;
            }

            const searchable =
              [
                product.name,
                product.shortName,
                product.category,
              ]
                .join(
                  " "
                )
                .toLocaleLowerCase(
                  "pl"
                );

            return searchable.includes(
              normalizedQuery
            );
          }
        );
      },
      [
        filter,
        products,
        query,
      ]
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-sm">
        <div className="relative p-5 sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-rose-100/70 blur-3xl"
          />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-600">
                  Social Media
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-[-0.045em] text-stone-950 sm:text-4xl">
                  Wybierz produkt
                </h1>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-stone-950 text-white shadow-sm">
                <PhoneIcon />
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              Otwórz produkt
              w Social Media Studio
              i przygotuj okładkę,
              slajd produktu
              oraz zakończenie.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-stone-200 bg-stone-50 px-4">
              <SearchIcon />

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
                placeholder="Szukaj produktu lub kategorii..."
                className="min-h-12 w-full bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400"
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-stone-400 shadow-sm"
                >
                  ×
                </button>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={
                  filter ===
                  "all"
                }
                onClick={() =>
                  setFilter(
                    "all"
                  )
                }
              >
                Wszystkie
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "active"
                }
                onClick={() =>
                  setFilter(
                    "active"
                  )
                }
              >
                Aktywne
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "featured"
                }
                onClick={() =>
                  setFilter(
                    "featured"
                  )
                }
              >
                🔥 Wybrane
              </FilterButton>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-black text-stone-500">
          {
            filteredProducts.length
          }{" "}
          {
            filteredProducts.length ===
            1
              ? "produkt"
              : "produktów"
          }
        </p>

        <Link
          href="/admin/nowa-oferta"
          className="text-xs font-black text-rose-600"
        >
          + Nowa oferta
        </Link>
      </div>

      {filteredProducts.length >
      0 ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {filteredProducts.map(
            (
              product
            ) => (
              <article
                key={
                  product.id
                }
                className="overflow-hidden rounded-[24px] border border-stone-200 bg-white p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative h-[118px] w-[92px] shrink-0 overflow-hidden rounded-[18px] bg-stone-100">
                    <img
                      src={
                        product.imageUrl
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    {product.featured && (
                      <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] shadow-sm backdrop-blur">
                        🔥
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          product.active
                            ? "bg-emerald-500"
                            : "bg-stone-300",
                        ].join(
                          " "
                        )}
                      />

                      <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
                        {
                          product.category
                        }
                      </p>
                    </div>

                    <h2 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-stone-900">
                      {
                        product.shortName
                      }
                    </h2>

                    <p className="mt-1 text-sm font-black text-stone-700">
                      {formatPrice(
                        product.price
                      )}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Link
                        href={`/admin/social/${product.id}`}
                        className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-[14px] bg-stone-950 px-3 text-xs font-black text-white transition active:scale-[0.98]"
                      >
                        <PhoneSmallIcon />

                        Otwórz studio
                      </Link>

                      {product.active && (
                        <Link
                          href={`/produkt/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Zobacz produkt"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-stone-200 bg-stone-50 text-stone-500"
                        >
                          ↗
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-[24px] border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <SearchIcon />
          </div>

          <p className="mt-4 text-sm font-black text-stone-800">
            Brak produktów
          </p>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-stone-400">
            Zmień wyszukiwanie
            albo filtr.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "shrink-0 rounded-full px-4 py-2 text-[11px] font-black transition",
        active
          ? "bg-stone-950 text-white"
          : "border border-stone-200 bg-white text-stone-500",
      ].join(
        " "
      )}
    >
      {children}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />

      <path d="M12 18h.01" />
    </svg>
  );
}

function PhoneSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}