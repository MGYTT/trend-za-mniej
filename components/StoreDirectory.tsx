"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { StoreCard } from "@/lib/stores";
import {
  offerCountLabel,
  selectDirectoryStores,
  type DirectoryMode,
  type DirectorySort,
} from "@/lib/store-directory-utils";

const STORAGE_KEY = "tzm-stores-favourites";
function subscribeToFavourites(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tzm-favourites-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tzm-favourites-change", callback);
  };
}
function readFavourites() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "[]"; }
  catch { return "[]"; }
}
function serverFavourites() { return "[]"; }

export default function StoreDirectory({
  stores,
  unavailable,
}: { stores: StoreCard[]; unavailable: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState<DirectoryMode>("all");
  const [sort, setSort] = useState<DirectorySort>("recommended");
  const saved = useSyncExternalStore(subscribeToFavourites, readFavourites, serverFavourites);
  const favourites = useMemo<string[]>(() => {
    try {
      const value: unknown = JSON.parse(saved);
      return Array.isArray(value)
        ? value.filter((s): s is string => typeof s === "string")
        : [];
    } catch { return []; }
  }, [saved]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    stores.forEach(store => counts.set(store.category, (counts.get(store.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "pl"));
  }, [stores]);

  const availableCount = stores.filter(store => store.offerCount > 0).length;
  const shown = useMemo(() => selectDirectoryStores(stores, { query, category, mode, sort }, favourites),
    [stores, query, category, mode, sort, favourites]);
  const selectedFavourites = new Set(favourites);
  const activeFilters = Boolean(query || category !== "all" || mode !== "all" || sort !== "recommended");

  function reset() {
    setQuery(""); setCategory("all"); setMode("all"); setSort("recommended");
  }
  function toggleFavourite(slug: string) {
    const next = selectedFavourites.has(slug)
      ? favourites.filter(item => item !== slug) : [...favourites, slug];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("tzm-favourites-change"));
    } catch { /* browsing with blocked storage: no persistent favourites */ }
  }

  return (
    <section id="sklepy" aria-labelledby="store-directory-heading" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-700">Przeglądaj sklepy</p>
          <h2 id="store-directory-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Wybierz sklep i sprawdź oferty</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
            Sklepy posiadające opublikowane oferty pokazujemy na początku. Nie wszystkie sklepy mają obecnie kody.
          </p>
        </div>
        <span aria-live="polite" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700">
          Znaleziono: {shown.length} z {stores.length}
        </span>
      </div>

      <div className="mt-7 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <label className="block text-sm font-bold text-stone-900">
            Szukaj sklepu
            <div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
              <span aria-hidden="true" className="text-lg text-stone-500">⌕</span>
              <input type="search" value={query} maxLength={100} onChange={event => setQuery(event.target.value)}
                placeholder="Nazwa, kategoria lub rodzaj oferty…" aria-controls="store-results"
                className="min-h-12 w-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" />
              {query && <button type="button" onClick={() => setQuery("")}
                className="rounded-lg px-2 py-2 text-xs font-bold text-rose-700" aria-label="Wyczyść wyszukiwanie">Wyczyść</button>}
            </div>
          </label>
          <label className="block text-sm font-bold text-stone-900">
            Kolejność
            <select value={sort} onChange={event => setSort(event.target.value as DirectorySort)}
              className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-rose-500">
              <option value="recommended">Najwięcej ofert</option>
              <option value="alphabetical">Alfabetycznie A–Z</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtry sklepów">
          <button type="button" aria-pressed={mode === "all"} onClick={() => setMode("all")}
            className={"min-h-10 rounded-full border px-4 text-xs font-bold transition " +
              (mode === "all" ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-rose-300")}>
            Wszystkie sklepy
          </button>
          <button type="button" aria-pressed={mode === "available"} onClick={() => setMode("available")}
            className={"min-h-10 rounded-full border px-4 text-xs font-bold transition " +
              (mode === "available" ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-rose-300")}>
            Z ofertami ({availableCount})
          </button>
          <button type="button" aria-pressed={mode === "favourites"} onClick={() => setMode("favourites")}
            className={"min-h-10 rounded-full border px-4 text-xs font-bold transition " +
              (mode === "favourites" ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-rose-300")}>
            ♡ Ulubione
          </button>
        </div>
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Kategorie sklepów">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}
            className={"min-h-9 shrink-0 rounded-xl px-3 text-xs font-bold " +
              (category === "all" ? "bg-rose-100 text-rose-800" : "bg-stone-100 text-stone-600 hover:bg-rose-50")}>
            Wszystkie kategorie
          </button>
          {categories.map(([name, count]) => (
            <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)}
              className={"min-h-9 shrink-0 rounded-xl px-3 text-xs font-bold " +
                (category === name ? "bg-rose-100 text-rose-800" : "bg-stone-100 text-stone-600 hover:bg-rose-50")}>
              {name} · {count}
            </button>
          ))}
        </div>
        {activeFilters && (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={reset} className="min-h-9 rounded-lg px-3 text-xs font-bold text-rose-700 underline-offset-4 hover:underline">
              Wyczyść wszystkie filtry
            </button>
          </div>
        )}
      </div>

      {unavailable && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Nie wszystkie dane są obecnie dostępne. Pokazujemy sklepy, dla których udało się pobrać informacje.
      </p>}
      <div id="store-results" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(store => {
          const hasOffers = store.offerCount > 0;
          const isFavourite = selectedFavourites.has(store.slug);
          return (
            <article key={store.slug}
              className={"group flex min-w-0 flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg " +
                (hasOffers ? "border-rose-200 hover:border-rose-300" : "border-stone-200 hover:border-stone-300")}>
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className={"grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-black " +
                  (hasOffers ? "bg-gradient-to-br from-rose-100 to-orange-50 text-rose-800" : "bg-stone-100 text-stone-600")}>
                  {store.name.slice(0, 1).toLocaleUpperCase("pl")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black tracking-tight text-stone-950">{store.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-stone-500">{store.category}</p>
                </div>
                <button type="button" onClick={() => toggleFavourite(store.slug)}
                  aria-label={(isFavourite ? "Usuń z ulubionych: " : "Dodaj do ulubionych: ") + store.name}
                  aria-pressed={isFavourite} title={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-xl text-rose-600 transition hover:border-rose-300">
                  {isFavourite ? "♥" : "♡"}
                </button>
              </div>
              <p className="mt-4 line-clamp-3 min-h-[72px] flex-1 text-sm leading-6 text-stone-600">
                {store.description || "Przeglądaj informacje o sklepie oraz jego oferty."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className={"rounded-full px-3 py-1.5 text-xs font-black " +
                  (hasOffers ? "bg-rose-50 text-rose-800" : "bg-stone-100 text-stone-600")}>
                  {hasOffers ? offerCountLabel(store.offerCount) : "Brak opublikowanych ofert"}
                </span>
                {hasOffers && <span className="text-[11px] font-bold text-rose-700">Sprawdź rodzaj kodu</span>}
              </div>
              <Link href={"/kody-rabatowe/" + store.slug}
                className={"mt-5 flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-black transition " +
                  (hasOffers ? "bg-stone-950 text-white hover:bg-rose-700" : "border border-stone-200 bg-stone-50 text-stone-800 hover:border-rose-300")}>
                {hasOffers ? "Zobacz kody i promocje" : "Zobacz stronę sklepu"} <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          );
        })}
      </div>

      {shown.length === 0 && (
        <div role="status" className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-xl font-black text-stone-900">Nie znaleźliśmy pasujących sklepów</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {mode === "favourites"
              ? "Możesz dodać sklep do ulubionych, klikając serce na jego karcie."
              : "Spróbuj innej nazwy lub zmień zastosowane filtry."}
          </p>
          <button type="button" onClick={reset}
            className="mt-5 min-h-11 rounded-xl bg-stone-950 px-5 text-sm font-black text-white hover:bg-rose-700">
            Pokaż wszystkie sklepy
          </button>
        </div>
      )}
      <p className="mt-7 text-xs leading-6 text-stone-500">
        Liczba ofert dotyczy aktualnie opublikowanych wpisów, nie gwarantowanych rabatów.
        Ulubione zapisują się wyłącznie w Twojej przeglądarce. Część linków na Trendzamniej jest afiliacyjna.
      </p>
    </section>
  );
}
