"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductPhoto from "@/components/ProductPhoto";
import {
  availableBudgets,
  availableOccasions,
  filterOutfits,
  type OutfitPreview,
} from "@/lib/outfit-filters";

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

export default function OutfitExplorer({ looks }: { looks: OutfitPreview[] }) {
  const [budget, setBudget] = useState("all");
  const [occasion, setOccasion] = useState("all");

  const budgets = useMemo(() => availableBudgets(looks), [looks]);
  const occasions = useMemo(() => availableOccasions(looks), [looks]);
  const visible = useMemo(
    () =>
      filterOutfits(looks, {
        maxPrice: budget === "all" ? null : Number(budget),
        occasion: occasion === "all" ? null : occasion,
      }),
    [looks, budget, occasion]
  );

  return (
    <div>
      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 md:max-w-2xl">
            <div>
              <label htmlFor="look-budget" className="mb-2 block text-sm font-bold text-stone-800">
                Ile chcesz wydać?
              </label>
              <select
                id="look-budget"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 text-base font-medium text-stone-950 focus-visible:outline-2 focus-visible:outline-rose-600"
              >
                <option value="all">Dowolny budżet</option>
                {budgets.map((amount) => (
                  <option key={amount} value={amount}>
                    Do {priceFormatter.format(amount)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="look-occasion" className="mb-2 block text-sm font-bold text-stone-800">
                Na jaką okazję?
              </label>
              <select
                id="look-occasion"
                value={occasion}
                onChange={(event) => setOccasion(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 text-base font-medium text-stone-950 focus-visible:outline-2 focus-visible:outline-rose-600"
              >
                <option value="all">Wszystkie okazje</option>
                {occasions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          {(budget !== "all" || occasion !== "all") && (
            <button
              type="button"
              onClick={() => { setBudget("all"); setOccasion("all"); }}
              className="min-h-11 rounded-xl border border-stone-200 px-5 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 mt-8 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-black tracking-tight text-stone-950">Wybierz gotowy zestaw</h2>
        <p className="text-sm font-semibold text-stone-600" aria-live="polite" role="status">
          {visible.length} z {looks.length} stylizacji
        </p>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((look) => (
            <article key={look.slug} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:border-rose-200 hover:shadow-lg">
              <Link
                href={"/stylizacje/" + look.slug}
                aria-label={"Otwórz stylizację: " + look.title}
                className="block focus-visible:outline-2 focus-visible:outline-rose-600"
              >
                <div className="grid aspect-[1.8] grid-cols-2 overflow-hidden bg-stone-100">
                  {look.photos.slice(0, 2).map((photo) => (
                    <div key={photo.id} className="relative overflow-hidden">
                      <ProductPhoto src={photo.image} alt={photo.alt} sizes="(max-width: 639px) 45vw, (max-width: 1023px) 23vw, 16vw" />
                    </div>
                  ))}
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                  {look.occasion} · {look.style}
                </p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-stone-950">
                  <Link href={"/stylizacje/" + look.slug} className="hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600">
                    {look.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{look.intro}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-5">
                  <span className="text-xs font-medium text-stone-500">{look.productCount} elementy · bez dostawy</span>
                  <strong className="shrink-0 text-xl font-black text-stone-950">{priceFormatter.format(look.total)}</strong>
                </div>
                <Link
                  href={"/stylizacje/" + look.slug}
                  className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  Zobacz elementy stylizacji →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center">
          <h3 className="text-xl font-black">Brak zestawów dla tych filtrów</h3>
          <p className="mt-2 text-sm text-stone-600">Zwiększ budżet lub wybierz inną okazję.</p>
          <button
            type="button"
            onClick={() => { setBudget("all"); setOccasion("all"); }}
            className="mt-5 min-h-11 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700"
          >
            Pokaż wszystkie zestawy
          </button>
        </div>
      )}
    </div>
  );
}
