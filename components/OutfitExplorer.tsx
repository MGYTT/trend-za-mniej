"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductPhoto from "@/components/ProductPhoto";
import {
  availableBudgets,
  availableOccasions,
  filterOutfits,
  sortOutfits,
  type OutfitPreview,
  type OutfitSort,
} from "@/lib/outfit-filters";

const INITIAL_OUTFITS = 6;

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

export default function OutfitExplorer({
  looks,
  initialBudget = "all",
  initialOccasion = "all",
}: {
  looks: OutfitPreview[];
  initialBudget?: string;
  initialOccasion?: string;
}) {
  const [budget, setBudget] = useState(initialBudget);
  const [occasion, setOccasion] = useState(initialOccasion);
  const [sort, setSort] = useState<OutfitSort>("editorial");
  const [expanded, setExpanded] = useState(false);

  const budgets = useMemo(() => availableBudgets(looks), [looks]);
  const occasions = useMemo(() => availableOccasions(looks), [looks]);
  const visible = useMemo(
    () =>
      sortOutfits(filterOutfits(looks, {
        maxPrice: budget === "all" ? null : Number(budget),
        occasion: occasion === "all" ? null : occasion,
      }), sort),
    [looks, budget, occasion, sort]
  );
  const isFiltered = budget !== "all" || occasion !== "all";
  // With a filter or price sorting, show every matching option immediately.
  const showAll = isFiltered || sort !== "editorial" || expanded;
  const displayed = showAll ? visible : visible.slice(0, INITIAL_OUTFITS);
  const clear = () => {
    setBudget("all");
    setOccasion("all");
    setSort("editorial");
    setExpanded(false);
  };

  return (
    <div>
      <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-[0_18px_45px_rgba(136,19,55,0.06)] sm:p-7 lg:p-8">
        <fieldset>
          <legend className="text-base font-black text-stone-950">Twój budżet na cały zestaw</legend>
          <p className="mt-1.5 text-xs leading-6 text-stone-600">Wybierz maksymalną sumę zapisanych cen. To nie jest obietnica rabatu.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 min-[440px]:flex min-[440px]:flex-wrap">
            <button
              type="button"
              aria-pressed={budget === "all"}
              onClick={() => setBudget("all")}
              className={budget === "all"
                ? "flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-black text-white shadow-sm"
                : "flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-rose-50/40 px-4 text-sm font-bold text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500"}
            >
              Każdy budżet
            </button>
            {budgets.map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={budget === String(amount)}
                onClick={() => setBudget(String(amount))}
                className={budget === String(amount)
                  ? "flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-black text-white shadow-sm"
                  : "flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-rose-50/40 px-4 text-sm font-bold text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500"}
              >
                Do {amount} zł
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 grid gap-5 border-t border-stone-100 pt-6 sm:grid-cols-2">
          <div>
            <label htmlFor="look-occasion" className="mb-2 block text-sm font-black text-stone-950">
              Na jaką okazję?
            </label>
            <select
              id="look-occasion"
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-base font-semibold text-stone-950 focus-visible:outline-2 focus-visible:outline-rose-600"
            >
              <option value="all">Każda okazja</option>
              {occasions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="look-sort" className="mb-2 block text-sm font-black text-stone-950">
              Sortuj stylizacje
            </label>
            <select
              id="look-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as OutfitSort)}
              className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-base font-semibold text-stone-950 focus-visible:outline-2 focus-visible:outline-rose-600"
            >
              <option value="editorial">Nasza kolejność</option>
              <option value="price-asc">Od najniższej sumy</option>
            </select>
          </div>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={clear}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-rose-600"
          >
            Wyczyść filtry ×
          </button>
        )}
      </div>

      <div className="mb-6 mt-10 flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-[clamp(1.5rem,5.5vw,2rem)] font-black tracking-tight text-stone-950">Odkryj swój nowy look</h3>
        <p className="text-sm font-semibold text-stone-600" aria-live="polite" role="status">
          {visible.length} {visible.length === 1 ? "stylizacja pasuje" : "stylizacji pasuje"} · pokazano {displayed.length}
        </p>
      </div>

      {visible.length > 0 ? (
        <>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {displayed.map((look) => (
            <article key={look.slug} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[27px] border border-stone-200 bg-white shadow-[0_7px_25px_rgba(28,25,23,0.045)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg motion-reduce:transform-none">
              <Link
                href={"/stylizacje/" + look.slug}
                aria-label={"Otwórz stylizację: " + look.title}
                className="block focus-visible:outline-2 focus-visible:outline-rose-600"
              >
                <div className="relative grid aspect-[1.6] grid-cols-2 gap-1.5 overflow-hidden bg-rose-50 p-2 sm:gap-2 sm:p-3">
                  {look.photos.slice(0, 2).map((photo) => (
                    <div key={photo.id} className="relative min-w-0 overflow-hidden rounded-[18px] bg-white">
                      <ProductPhoto src={photo.image} alt={photo.alt} sizes="(max-width: 639px) 43vw, (max-width: 1279px) 23vw, 16vw" className="p-2 transition-transform duration-500 motion-safe:group-hover:scale-105" />
                    </div>
                  ))}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-rose-700 shadow-sm">
                    Do {look.maxBudget} zł
                  </span>
                </div>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-widest text-rose-700">
                  {look.occasion} · {look.style}
                </p>
                <h4 className="mt-2 text-xl font-black leading-snug tracking-tight text-stone-950">
                  <Link href={"/stylizacje/" + look.slug} className="hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600">
                    {look.title}
                  </Link>
                </h4>
                <p className="mt-3 line-clamp-2 text-sm leading-7 text-stone-600">{look.intro}</p>
                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-2 border-t border-stone-100 pt-4">
                    <div>
                      <p className="text-xs font-medium text-stone-500">Suma cen {look.productCount} elementów</p>
                      <strong className="mt-1 block text-2xl font-black tracking-tight text-stone-950">{priceFormatter.format(look.total)}</strong>
                    </div>
                    <p className="max-w-40 text-xs leading-5 text-stone-500 sm:text-right">Zapisane ceny, bez dostawy</p>
                  </div>
                  <Link
                    href={"/stylizacje/" + look.slug}
                    className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-center text-sm font-extrabold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600"
                  >
                    Zobacz stylizację i oferty ↗
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!showAll && visible.length > INITIAL_OUTFITS && (
          <div className="mt-9 flex justify-center">
            <button type="button" onClick={() => setExpanded(true)}
              className="min-h-12 w-full rounded-xl border border-rose-200 bg-white px-6 text-sm font-black text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600 sm:w-auto">
              Pokaż pozostałe {visible.length - INITIAL_OUTFITS} stylizacje ↓
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center">
          <h4 className="text-xl font-black">Brak zestawów w tym budżecie i na tę okazję</h4>
          <p className="mt-2 text-sm leading-7 text-stone-600">Wybierz wyższą kwotę, inną okazję albo pokaż wszystkie dostępne propozycje.</p>
          <button
            type="button"
            onClick={clear}
            className="mt-5 min-h-11 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700"
          >
            Pokaż wszystkie zestawy
          </button>
        </div>
      )}
    </div>
  );
}
