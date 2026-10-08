"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  SheinPromotion,
} from "@/lib/shein-promotions";

type PromotionCategory =
  | "all"
  | "new-users"
  | "fashion"
  | "beauty"
  | "accessories"
  | "home"
  | "kids"
  | "sale";

type CategoryOption = {
  id: PromotionCategory;
  label: string;
  icon: string;
};

const CATEGORIES:
  CategoryOption[] = [
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
      "new-users",

    label:
      "Dla nowych",

    icon:
      "🎁",
  },

  {
    id:
      "fashion",

    label:
      "Moda",

    icon:
      "👗",
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
      "accessories",

    label:
      "Buty i dodatki",

    icon:
      "👜",
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
      "kids",

    label:
      "Dzieci",

    icon:
      "🧸",
  },

  {
    id:
      "sale",

    label:
      "Wyprzedaże",

    icon:
      "🔥",
  },
];

const FASHION_IDS =
  new Set([
    "nowy-sezon-nowe-trendy",
    "bestsellery-dla-kobiet",
    "techniczne-spojrzenie-nowy-sezon",
    "odziez-nocna-bielizna",
    "nowy-sezon-nowy-ruch",
    "wakacyjna-kolekcja",
    "emery-rose-wyprzedaz",
    "anewsta-wiosna-lato",
    "shein-curve-nowy-sezon",
  ]);

const BEAUTY_IDS =
  new Set([
    "kosmetyki-bestsellery",
    "sheglam-super-wyprzedaz",
    "promienne-piekno",
  ]);

const ACCESSORIES_IDS =
  new Set([
    "bestsellery-bizuteria-dodatki",
    "bestsellery-torebki-buty",
  ]);

const HOME_IDS =
  new Set([
    "kuchnia-jadalnia",
    "shein-lifestyle",
    "zabawki-antystresowe",
  ]);

const KIDS_IDS =
  new Set([
    "dzieci-niemowleta-bestsellery",
  ]);

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

function isForNewUsers(
  promotion:
    SheinPromotion
) {
  const text =
    normalizeText(
      [
        promotion.title,
        promotion.description,
        promotion.note,
        promotion.badge,
      ].join(
        " "
      )
    );

  return (
    text.includes(
      "nowych uzytkownik"
    ) ||
    text.includes(
      "nowi uzytkownicy"
    ) ||
    promotion.id ===
      "kupon-60-nowi-uzytkownicy"
  );
}

function isSale(
  promotion:
    SheinPromotion
) {
  const text =
    normalizeText(
      [
        promotion.title,
        promotion.description,
        promotion.badge,
      ].join(
        " "
      )
    );

  return (
    text.includes(
      "wyprzedaz"
    ) ||
    text.includes(
      "przecen"
    ) ||
    text.includes(
      "obniz"
    ) ||
    text.includes(
      "ponizej"
    ) ||
    promotion.id ===
      "wyselekcjonowane-produkty" ||
    promotion.id ===
      "wybory-dnia-shein"
  );
}

function matchesCategory(
  promotion:
    SheinPromotion,
  category:
    PromotionCategory
) {
  if (
    category ===
    "all"
  ) {
    return true;
  }

  if (
    category ===
    "new-users"
  ) {
    return isForNewUsers(
      promotion
    );
  }

  if (
    category ===
    "fashion"
  ) {
    return FASHION_IDS.has(
      promotion.id
    );
  }

  if (
    category ===
    "beauty"
  ) {
    return BEAUTY_IDS.has(
      promotion.id
    );
  }

  if (
    category ===
    "accessories"
  ) {
    return ACCESSORIES_IDS.has(
      promotion.id
    );
  }

  if (
    category ===
    "home"
  ) {
    return HOME_IDS.has(
      promotion.id
    );
  }

  if (
    category ===
    "kids"
  ) {
    return KIDS_IDS.has(
      promotion.id
    );
  }

  if (
    category ===
    "sale"
  ) {
    return isSale(
      promotion
    );
  }

  return true;
}

function getPromotionKind(
  promotion:
    SheinPromotion
) {
  if (
    promotion.id ===
    "kupon-60-nowi-uzytkownicy"
  ) {
    return {
      label:
        "Kupon dla nowych",

      helper:
        "Oferta dla nowych użytkowników",
    };
  }

  if (
    isForNewUsers(
      promotion
    )
  ) {
    return {
      label:
        "Kampania + bonus",

      helper:
        "Kampania może zawierać bonus dla nowych użytkowników",
    };
  }

  return {
    label:
      "Kod kampanii",

    helper:
      "Kod służy do wyszukania kampanii w SHEIN",
  };
}

export default function SheinPromotionsExplorer({
  promotions,
}: {
  promotions:
    SheinPromotion[];
}) {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState<PromotionCategory>(
      "all"
    );

  const [
    copiedCode,
    setCopiedCode,
  ] =
    useState<
      string | null
    >(null);

  const filteredPromotions =
    useMemo(
      () => {
        const normalizedQuery =
          normalizeText(
            query.trim()
          );

        return promotions.filter(
          (
            promotion
          ) => {
            if (
              !matchesCategory(
                promotion,
                category
              )
            ) {
              return false;
            }

            if (
              !normalizedQuery
            ) {
              return true;
            }

            const searchable =
              normalizeText(
                [
                  promotion.title,
                  promotion.description,
                  promotion.badge,
                  promotion.code,
                ].join(
                  " "
                )
              );

            return searchable.includes(
              normalizedQuery
            );
          }
        );
      },
      [
        category,
        promotions,
        query,
      ]
    );

  const categoryCounts =
    useMemo(
      () =>
        Object.fromEntries(
          CATEGORIES.map(
            (
              item
            ) => [
              item.id,

              promotions.filter(
                (
                  promotion
                ) =>
                  matchesCategory(
                    promotion,
                    item.id
                  )
              ).length,
            ]
          )
        ) as Record<
          PromotionCategory,
          number
        >,
      [
        promotions,
      ]
    );

  async function copyCode(
    code: string
  ) {
    try {
      await navigator.clipboard
        .writeText(
          code
        );

      setCopiedCode(
        code
      );

      window.setTimeout(
        () => {
          setCopiedCode(
            (
              current
            ) =>
              current ===
              code
                ? null
                : current
          );
        },
        1800
      );
    } catch (
      error
    ) {
      console.error(
        "Nie udało się skopiować kodu:",
        error
      );
    }
  }

  function clearFilters() {
    setQuery(
      ""
    );

    setCategory(
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
              placeholder="Szukaj promocji, kategorii lub kodu, np. SHEGLAM albo SBNSL5D..."
              aria-label="Szukaj promocji SHEIN"
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

          <div
            aria-live="polite"
            className="text-center text-xs font-bold text-stone-500 lg:min-w-[120px] lg:text-right"
          >
            {
              filteredPromotions.length
            }{" "}
            z{" "}
            {
              promotions.length
            }{" "}
            kampanii
          </div>
        </div>

        <div className="horizontal-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {CATEGORIES.map(
            (
              item
            ) => {
              const active =
                category ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setCategory(
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
                      categoryCounts[
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

      {filteredPromotions.length >
      0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredPromotions.map(
            (
              promotion
            ) => (
              <PromotionCard
                key={
                  promotion.id
                }
                promotion={
                  promotion
                }
                copied={
                  copiedCode ===
                  promotion.code
                }
                onCopy={() =>
                  void copyCode(
                    promotion.code
                  )
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
          <span
            aria-hidden="true"
            className="text-3xl"
          >
            🔎
          </span>

          <h3 className="mt-3 text-lg font-black text-stone-900">
            Nie znaleźliśmy
            takiej promocji
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
            Spróbuj wpisać
            inną frazę,
            wyszukać kod
            kampanii albo
            wybrać inną
            kategorię.
          </p>

          <button
            type="button"
            onClick={
              clearFilters
            }
            className="mt-5 min-h-11 rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800"
          >
            Pokaż wszystkie
            promocje
          </button>
        </div>
      )}
    </div>
  );
}

function PromotionCard({
  promotion,
  copied,
  onCopy,
}: {
  promotion:
    SheinPromotion;

  copied:
    boolean;

  onCopy:
    () => void;
}) {
  const kind =
    getPromotionKind(
      promotion
    );

  const newUserOffer =
    isForNewUsers(
      promotion
    );

  return (
    <article
      id={
        promotion.id
      }
      className="scroll-mt-28 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm transition hover:border-rose-200 hover:shadow-md"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.07em] text-rose-700">
            {
              promotion.badge
            }
          </span>

          <span className="inline-flex rounded-full bg-stone-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.07em] text-stone-600">
            {
              kind.label
            }
          </span>

          {newUserOffer && (
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.07em] text-emerald-700">
              Nowi użytkownicy
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-black leading-tight tracking-[-0.025em] text-stone-900 sm:text-2xl">
          {
            promotion.title
          }
        </h3>

        <p className="mt-3 text-sm leading-7 text-stone-500">
          {
            promotion.description
          }
        </p>

        <div className="mt-5 rounded-[18px] border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                {promotion.id ===
                "kupon-60-nowi-uzytkownicy"
                  ? "Kod promocji"
                  : "Kod do wyszukania w SHEIN"}
              </p>

              <code className="mt-1.5 block text-xl font-black tracking-[0.08em] text-stone-900">
                {
                  promotion.code
                }
              </code>
            </div>

            <button
              type="button"
              onClick={
                onCopy
              }
              className={[
                "min-h-10 rounded-xl border px-4 text-xs font-black transition",
                copied
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:text-rose-700",
              ].join(
                " "
              )}
            >
              {copied
                ? "✓ Skopiowano"
                : "Kopiuj kod"}
            </button>
          </div>

          <p className="mt-3 border-t border-stone-200 pt-3 text-[10px] leading-5 text-stone-400">
            {
              kind.helper
            }
          </p>
        </div>

        <details className="group mt-4 rounded-xl border border-stone-100 bg-stone-50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-[11px] font-bold text-stone-500">
            <span>
              Warunki i ważne
              informacje
            </span>

            <span className="text-base transition group-open:rotate-45">
              +
            </span>
          </summary>

          <p className="border-t border-stone-100 px-3.5 py-3 text-[11px] leading-6 text-stone-500">
            {
              promotion.note
            }
          </p>
        </details>
      </div>

      <div className="border-t border-stone-100 bg-stone-50 p-4 sm:px-6">
        <a
          href={
            promotion.affiliateUrl
          }
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-center text-sm font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
        >
          {
            promotion.ctaLabel
          }

          <span
            aria-hidden="true"
          >
            ↗
          </span>
        </a>

        <p className="mt-2 text-center text-[9px] font-semibold leading-5 text-stone-400">
          Link afiliacyjny •
          otworzy stronę lub
          aplikację SHEIN
        </p>
      </div>
    </article>
  );
}