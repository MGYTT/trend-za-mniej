
"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  SheinPromotion,
} from "@/lib/shein-promotions";

type Category =
  | "all"
  | "new-users"
  | "fashion"
  | "beauty"
  | "accessories"
  | "home"
  | "kids"
  | "sale";

type CategoryOption = {
  id: Category;
  label: string;
};

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Wszystkie" },
  { id: "new-users", label: "Dla nowych" },
  { id: "fashion", label: "Moda" },
  { id: "beauty", label: "Beauty" },
  {
    id: "accessories",
    label: "Buty i dodatki",
  },
  { id: "home", label: "Dom" },
  { id: "kids", label: "Dzieci" },
  { id: "sale", label: "Wyprzedaże" },
];

const FASHION_IDS = new Set([
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

const BEAUTY_IDS = new Set([
  "kosmetyki-bestsellery",
  "sheglam-super-wyprzedaz",
  "promienne-piekno",
]);

const ACCESSORIES_IDS = new Set([
  "bestsellery-bizuteria-dodatki",
  "bestsellery-torebki-buty",
]);

const HOME_IDS = new Set([
  "kuchnia-jadalnia",
  "shein-lifestyle",
  "zabawki-antystresowe",
]);

const KIDS_IDS = new Set([
  "dzieci-niemowleta-bestsellery",
]);

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

function newUserPromotion(
  promotion: SheinPromotion
) {
  if (
    promotion.id ===
    "kupon-60-nowi-uzytkownicy"
  ) {
    return true;
  }

  const text = normalize(
    [
      promotion.title,
      promotion.description,
      promotion.note,
      promotion.badge,
    ].join(" ")
  );

  return (
    text.includes("nowych uzytkownik") ||
    text.includes("nowi uzytkownicy") ||
    text.includes("nowym uzytkownik")
  );
}

function salePromotion(
  promotion: SheinPromotion
) {
  const text = normalize(
    [
      promotion.title,
      promotion.description,
      promotion.badge,
    ].join(" ")
  );

  return (
    text.includes("wyprzedaz") ||
    text.includes("przecen") ||
    text.includes("obniz") ||
    text.includes("ponizej") ||
    text.includes("promoc")
  );
}

function matchesCategory(
  promotion: SheinPromotion,
  category: Category
) {
  switch (category) {
    case "all":
      return true;

    case "new-users":
      return newUserPromotion(promotion);

    case "fashion":
      return FASHION_IDS.has(promotion.id);

    case "beauty":
      return BEAUTY_IDS.has(promotion.id);

    case "accessories":
      return ACCESSORIES_IDS.has(
        promotion.id
      );

    case "home":
      return HOME_IDS.has(promotion.id);

    case "kids":
      return KIDS_IDS.has(promotion.id);

    case "sale":
      return salePromotion(promotion);
  }
}

/* ======================================================
   WYSZUKIWARKA I FILTRY
====================================================== */

export default function SheinPromotionsExplorer({
  promotions,
}: {
  promotions: SheinPromotion[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<Category>("all");

  const [copyFeedback, setCopyFeedback] =
    useState<{
      code: string;
      success: boolean;
    } | null>(null);

  const filteredPromotions = useMemo(() => {
    const search = normalize(query);

    return promotions.filter((promotion) => {
      if (
        !matchesCategory(
          promotion,
          category
        )
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchable = normalize(
        [
          promotion.title,
          promotion.description,
          promotion.badge,
          promotion.code,
          promotion.note,
        ].join(" ")
      );

      return searchable.includes(search);
    });
  }, [category, promotions, query]);

  const categoryCounts = useMemo(() => {
    return Object.fromEntries(
      CATEGORIES.map((item) => [
        item.id,
        promotions.filter((promotion) =>
          matchesCategory(
            promotion,
            item.id
          )
        ).length,
      ])
    ) as Record<Category, number>;
  }, [promotions]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopyFeedback({
        code,
        success: true,
      });
    } catch {
      setCopyFeedback({
        code,
        success: false,
      });
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setCopyFeedback(null);
  }

  return (
    <div>
      {/* PANEL WYSZUKIWANIA */}

      <div className="rounded-[22px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">
              Szukaj promocji
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
              onChange={(event) => {
                setQuery(
                  event.target.value
                );
              }}
              placeholder="Szukaj promocji lub wpisz kod..."
              maxLength={100}
              className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-11 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100 sm:text-sm"
            />

            {query && (
              <button
                type="button"
                aria-label="Wyczyść wyszukiwanie"
                onClick={() =>
                  setQuery("")
                }
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:bg-white"
              >
                ×
              </button>
            )}
          </label>

          <p
            aria-live="polite"
            className="shrink-0 text-center text-xs font-extrabold text-stone-600 sm:text-right"
          >
            {filteredPromotions.length} z{" "}
            {promotions.length} kampanii
          </p>
        </div>

        {/* FILTRY KATEGORII */}

        <div className="horizontal-scroll -mx-3.5 mt-4 flex gap-2 overflow-x-auto px-3.5 pb-1 sm:mx-0 sm:px-0">
          {CATEGORIES.map((item) => {
            const active =
              category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setCategory(item.id)
                }
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-extrabold transition ${
                  active
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <span>{item.label}</span>

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-stone-500"
                  }`}
                >
                  {categoryCounts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        {(query || category !== "all") && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-extrabold text-rose-700 underline underline-offset-4 hover:text-rose-800"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>

      {/* KARTY PROMOCJI */}

      {filteredPromotions.length > 0 ? (
        <div className="mt-5 grid items-stretch gap-3 md:grid-cols-2 md:gap-4">
          {filteredPromotions.map(
            (promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                copyFeedback={
                  copyFeedback?.code ===
                  promotion.code
                    ? copyFeedback
                    : null
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
        <div className="mt-5 rounded-[22px] border border-dashed border-rose-200 bg-white px-5 py-12 text-center">
          <h3 className="text-lg font-black text-stone-900">
            Nie znaleźliśmy takiej kampanii
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-600">
            Spróbuj wpisać inną nazwę lub
            kod albo wybierz szerszą
            kategorię.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 min-h-11 rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white hover:bg-rose-700"
          >
            Pokaż wszystkie kampanie
          </button>
        </div>
      )}
    </div>
  );
}

/* ======================================================
   KARTA POJEDYNCZEJ PROMOCJI
====================================================== */

function PromotionCard({
  promotion,
  copyFeedback,
  onCopy,
}: {
  promotion: SheinPromotion;
  copyFeedback: {
    code: string;
    success: boolean;
  } | null;
  onCopy: () => void;
}) {
  const isCouponCampaign =
    promotion.id ===
    "kupon-60-nowi-uzytkownicy";

  return (
    <article
      id={promotion.id}
      className="scroll-mt-28 flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-[0_6px_22px_rgba(28,25,23,0.045)] transition hover:border-rose-200 hover:shadow-md"
    >
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* TYP PROMOCJI */}

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
            {promotion.badge}
          </span>

          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
            {isCouponCampaign
              ? "Oferta dla nowych"
              : "Kod kampanii"}
          </span>
        </div>

        {/* NAZWA I OPIS */}

        <h3 className="mt-3 text-lg font-black leading-snug tracking-[-0.025em] text-stone-950 sm:text-xl">
          {promotion.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
          {promotion.description}
        </p>

        {/* KOD */}

        {promotion.code && (
          <div className="mt-4 rounded-[16px] border border-rose-100 bg-rose-50/60 p-3.5">
            <p className="text-xs font-bold text-stone-600">
              {isCouponCampaign
                ? "Kod powiązany z ofertą"
                : "Kod do wyszukania w SHEIN"}
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <code className="break-all font-mono text-lg font-black tracking-[0.07em] text-stone-950 sm:text-xl">
                {promotion.code}
              </code>

              <button
                type="button"
                onClick={onCopy}
                className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border px-3.5 text-xs font-extrabold transition ${
                  copyFeedback?.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
                }`}
              >
                {copyFeedback?.success
                  ? "✓ Skopiowano"
                  : "Kopiuj kod"}
              </button>
            </div>

            {copyFeedback &&
              !copyFeedback.success && (
                <p
                  role="status"
                  className="mt-2 text-xs text-rose-700"
                >
                  Nie udało się skopiować.
                  Zaznacz kod i skopiuj go
                  ręcznie.
                </p>
              )}
          </div>
        )}

        {/* WARUNKI KAMPANII */}

        {promotion.note && (
          <details className="group mt-3 rounded-xl border border-stone-100 bg-stone-50">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2 text-xs font-extrabold text-stone-700 [&::-webkit-details-marker]:hidden">
              Ważne informacje i warunki

              <span
                aria-hidden="true"
                className="text-lg text-rose-700 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <p className="border-t border-stone-200 px-3.5 py-3 text-xs leading-6 text-stone-600">
              {promotion.note}
            </p>
          </details>
        )}
      </div>

      {/* PRZYCISK AFILIACYJNY */}

      <div className="border-t border-stone-100 bg-stone-50 p-3.5 sm:px-5">
        <a
          href={promotion.affiliateUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-center text-sm font-black leading-5 text-white transition hover:bg-rose-700"
        >
          {promotion.ctaLabel}

          <ExternalIcon />
        </a>

        <p className="mt-2 text-center text-[11px] leading-5 text-stone-500">
          Link afiliacyjny · oferta otwiera
          się w SHEIN
        </p>
      </div>
    </article>
  );
}

/* ======================================================
   IKONY
====================================================== */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
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

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}
