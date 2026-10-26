"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { StoreCard } from "@/lib/stores";

const KEY = "tzm-stores-favourites";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tzm-favourites-change", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("tzm-favourites-change", callback); };
}
const clientSnapshot = () => localStorage.getItem(KEY) || "[]";
const serverSnapshot = () => "[]";

export default function StoreDirectory({ stores, unavailable }: { stores: StoreCard[]; unavailable: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const saved = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const favourites = useMemo(() => {
    try { const data: unknown = JSON.parse(saved); return Array.isArray(data) ? data.filter(x => typeof x === "string") as string[] : []; }
    catch { return []; }
  }, [saved]);
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const categories = useMemo(() => ["Wszystkie", ...new Set(stores.map(s => s.category))], [stores]);
  const shown = useMemo(() => stores.filter(s =>
    (s.name + " " + s.description + " " + s.category).toLocaleLowerCase("pl")
      .includes(query.trim().toLocaleLowerCase("pl")) &&
    (category === "Wszystkie" || s.category === category) &&
    (!onlyFavourites || favourites.includes(s.slug))
  ), [stores, query, category, favourites, onlyFavourites]);
  function toggle(slug: string) {
    const next = favourites.includes(slug) ? favourites.filter(s => s !== slug) : [...favourites, slug];
    try { localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event("tzm-favourites-change")); } catch { /* unavailable */ }
  }
  return (
    <section aria-labelledby="store-directory" className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Katalog sklepów</p>
          <h2 id="store-directory" className="mt-2 text-2xl font-black">Wybierz swój sklep</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Zobacz kupony, kampanie, promocje i status cashbacku.</p>
        </div>
        <span className="rounded-xl bg-white px-4 py-2 text-sm font-black text-rose-800">{shown.length} sklepów</span>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <label className="text-xs font-black text-stone-700">Znajdź sklep
          <input type="search" value={query} placeholder="Sklep lub kategoria" onChange={e => setQuery(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 px-4 text-sm" />
        </label>
        <label className="text-xs font-black text-stone-700">Kategoria
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 px-3 text-sm">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button type="button" aria-pressed={onlyFavourites} onClick={() => setOnlyFavourites(!onlyFavourites)}
          className="min-h-12 rounded-xl border border-stone-200 px-4 text-xs font-black">♡ Ulubione</button>
      </div>
      {unavailable && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        Część ofert chwilowo niedostępna. Możesz przeglądać pozostałe sklepy.
      </p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(store => (
          <article key={store.slug} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-xl font-black text-rose-700">{store.name[0]}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black">{store.name}</h3>
                <p className="text-xs text-stone-500">{store.category}</p>
              </div>
              <button type="button" onClick={() => toggle(store.slug)}
                aria-label={(favourites.includes(store.slug) ? "Usuń z ulubionych: " : "Dodaj do ulubionych: ") + store.name}
                aria-pressed={favourites.includes(store.slug)}
                className="min-h-11 min-w-11 rounded-xl border border-stone-200 text-xl text-rose-700">
                {favourites.includes(store.slug) ? "♥" : "♡"}
              </button>
            </div>
            <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-stone-600">{store.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-lg bg-stone-100 px-3 py-2">{store.offerCount} ofert</span>
              <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                Cashback: {store.cashbackState === "preparing" ? "w przygotowaniu" : "niedostępny"}
              </span>
            </div>
            <Link href={"/kody-rabatowe/" + store.slug}
              className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-stone-950 px-4 text-sm font-black text-white hover:bg-rose-700">
              Zobacz sklep i kody →
            </Link>
          </article>
        ))}
      </div>
      {shown.length === 0 && <p className="mt-6 rounded-xl bg-white p-6 text-sm text-stone-600">Nie znaleziono pasujących sklepów.</p>}
      <p className="mt-6 text-xs leading-6 text-stone-500">
        Ulubione są zapisywane tylko w tej przeglądarce. Prowizja dla Trendzamniej nie oznacza zwrotu dla kupującego.
      </p>
    </section>
  );
}
