"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import { recommendedBudget } from "@/lib/outfit-builder";
import type { ManagedOutfitRow } from "@/lib/editorial-outfits";

type StudioProduct = {
  id: string; slug: string; name: string; shortName: string;
  category: string; price: number; image: string; active: boolean;
};

type EditorForm = {
  slug: string; title: string; occasion: string; style: string;
  intro: string; tip: string; excluded: string; whyItWorks: string[];
  productIds: string[];
};

const EMPTY: EditorForm = {
  slug: "", title: "", occasion: "Na co dzień", style: "",
  intro: "", tip: "", excluded: "Dostawa, buty i dodatki nie są wliczone w cenę zestawu.",
  whyItWorks: ["", ""], productIds: [],
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export default function AdminOutfitStudio({
  catalog, existing, legacyCount,
}: {
  catalog: StudioProduct[];
  existing: ManagedOutfitRow[];
  legacyCount: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EditorForm>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);

  const editingPublished = existing.some((look) => look.id === editing && look.published);

  const selected = useMemo(() => {
    const index = new Map(catalog.map((p) => [p.id, p]));
    return form.productIds.map((id) => index.get(id)).filter((p): p is StudioProduct => Boolean(p));
  }, [catalog, form.productIds]);
  const total = selected.reduce((sum, p) => sum + Math.round(p.price * 100), 0) / 100;
  const budget = recommendedBudget(total);
  const available = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("pl");
    return catalog.filter((p) => !form.productIds.includes(p.id) &&
      (!search || [p.name, p.shortName, p.category, p.slug].join(" ").toLocaleLowerCase("pl").includes(search))
    ).slice(0, 35);
  }, [catalog, form.productIds, query]);

  function update<K extends keyof EditorForm>(field: K, value: EditorForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  function newOutfit() {
    setEditing(null);
    setForm({ ...EMPTY, whyItWorks: ["", ""], productIds: [] });
    setMessage(null);
    setQuery("");
  }

  function editOutfit(row: ManagedOutfitRow) {
    setEditing(row.id);
    setForm({
      slug: row.slug, title: row.title, occasion: row.occasion,
      style: row.style, intro: row.intro, tip: row.tip, excluded: row.excluded,
      whyItWorks: [...row.why_it_works.slice(0, 2), "", ""].slice(0, 2),
      productIds: [...row.product_ids],
    });
    setMessage(null);
    document.getElementById("outfit-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addProduct(id: string) {
    if (form.productIds.length >= 6) return;
    update("productIds", [...form.productIds, id]);
  }

  function removeProduct(id: string) {
    update("productIds", form.productIds.filter((value) => value !== id));
  }

  async function save(published: boolean) {
    if (busy) return;
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/outfits", {
        method: editing ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing, published }),
      });
      const result = await response.json() as { error?: string; outfit?: { slug: string } };
      if (!response.ok) {
        setMessage({ text: result.error || "Nie udało się zapisać zestawu.", good: false });
        return;
      }
      newOutfit();
      setMessage({ text: published ? "Stylizacja opublikowana. Jest dostępna na stronie." : "Zapisano szkic stylizacji.", good: true });
      router.refresh();
    } catch {
      setMessage({ text: "Brak połączenia. Sprawdź internet i spróbuj ponownie.", good: false });
    } finally {
      setBusy(false);
    }
  }

  async function removeOutfit(row: ManagedOutfitRow) {
    if (busy || !window.confirm(`Usunąć stylizację „${row.title}”? Tej operacji nie można cofnąć.`)) return;
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/outfits", {
        method: "DELETE", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        setMessage({ text: result.error || "Nie udało się usunąć.", good: false });
      } else {
        if (editing === row.id) newOutfit();
        setMessage({ text: "Stylizacja została usunięta.", good: true });
        router.refresh();
      }
    } catch {
      setMessage({ text: "Brak połączenia z serwerem.", good: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid min-w-0 w-full grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(330px,0.82fr)]">
      <div className="min-w-0 space-y-6">
        <section aria-labelledby="outfit-admin-list" className="min-w-0 overflow-hidden rounded-[26px] border border-stone-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-700">Biblioteka zestawów</p>
              <h2 id="outfit-admin-list" className="mt-2 text-xl font-black text-stone-950">Twoje stylizacje</h2>
              <p className="mt-2 text-xs leading-6 text-stone-600">
                {legacyCount} dotychczasowych stylizacji jest zachowanych w serwisie.
                Nowe zestawy tworzysz i edytujesz poniżej.
              </p>
            </div>
            <button type="button" onClick={newOutfit}
              className="min-h-11 rounded-xl bg-stone-950 px-4 text-xs font-black text-white hover:bg-stone-800">
              + Nowa stylizacja
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {existing.length === 0 ? (
              <div className="rounded-2xl bg-rose-50 px-5 py-5 text-sm leading-7 text-stone-700">
                Nie masz jeszcze zestawów z kreatora. Dodaj pierwszą stylizację i opublikuj ją po sprawdzeniu podglądu.
              </div>
            ) : existing.map((look) => (
              <div key={look.id} className="grid min-w-0 w-full grid-cols-1 gap-3 rounded-2xl border border-stone-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0 w-full">
                  <p className="w-full text-sm font-black leading-6 text-stone-900 [overflow-wrap:normal] [word-break:normal]">{look.title}</p>
                  <p className="mt-1 text-xs text-stone-500">{look.occasion} · {look.product_ids.length} elementy</p>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${look.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                    {look.published ? "Opublikowano" : "Szkic"}
                  </span>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {look.published && (
                    <Link href={"/stylizacje/" + look.slug} target="_blank"
                      className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-3 text-xs font-bold text-stone-700">
                      Podgląd ↗
                    </Link>
                  )}
                  <button type="button" onClick={() => editOutfit(look)} disabled={busy}
                    className="min-h-10 rounded-xl border border-rose-200 px-3 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                    Edytuj
                  </button>
                  <button type="button" onClick={() => void removeOutfit(look)} disabled={busy}
                    className="min-h-10 rounded-xl border border-red-100 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="outfit-editor" aria-labelledby="outfit-editor-title" className="min-w-0 overflow-hidden scroll-mt-24 rounded-[26px] border border-stone-200 bg-white p-4 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">{editing ? "Edycja zestawu" : "Nowy zestaw"}</p>
          <h2 id="outfit-editor-title" className="mt-2 text-2xl font-black tracking-tight text-stone-950">Zbuduj stylizację</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-black text-stone-700">Nazwa stylizacji *</span>
              <input type="text" maxLength={120} value={form.title} onChange={(event) => {
                const title = event.target.value;
                setForm((current) => ({ ...current, title, slug: !editing && current.slug === slugify(current.title) ? slugify(title) : current.slug }));
              }} placeholder="Np. Beżowy look na weekend" className="min-h-12 w-full rounded-xl border border-stone-200 px-4 text-base outline-none focus:border-rose-400" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-black text-stone-700">Adres URL (slug) *</span>
              <input type="text" maxLength={90} value={form.slug} disabled={editingPublished} onChange={(event) => update("slug",slugify(event.target.value))}
                placeholder="bezowy-look-na-weekend" className="min-h-12 w-full rounded-xl border border-stone-200 px-4 text-base outline-none focus:border-rose-400" />
              <span className="mt-1 block text-xs text-stone-500">/stylizacje/{form.slug || "twoja-stylizacja"}{editingPublished ? " · Adres opublikowanego zestawu jest chroniony." : ""}</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-stone-700">Okazja *</span>
              <select value={form.occasion} onChange={(event) => update("occasion", event.target.value)}
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base">
                {["Na co dzień", "Do pracy", "Na weekend", "Na wieczór", "Na chłodniejsze dni"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-stone-700">Styl *</span>
              <input type="text" maxLength={80} value={form.style} onChange={(event) => update("style",event.target.value)}
                placeholder="Np. Minimalizm" className="min-h-12 w-full rounded-xl border border-stone-200 px-4 text-base" />
            </label>
          </div>
          <div className="mt-6 border-t border-stone-100 pt-6">
            <h3 className="text-lg font-black text-stone-900">Wybierz produkty (2–6)</h3>
            <p className="mt-1 text-xs leading-6 text-stone-500">Wyszukuj aktywne produkty. Możesz dodawać je w kolejności, w jakiej mają się wyświetlać.</p>
            <label htmlFor="outfit-catalog-search" className="mt-4 block text-xs font-black text-stone-700">Znajdź produkt</label>
            <input id="outfit-catalog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Nazwa lub kategoria produktu" className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 px-4 text-base outline-none focus:border-rose-400" />
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-stone-100 p-2" aria-label="Dostępne produkty">
              {available.length ? available.map((p) => (
                <div key={p.id} className="flex min-w-0 items-center gap-3 rounded-xl bg-stone-50 p-2.5">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                    <ProductPhoto src={p.image} alt={p.name} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-black text-stone-900">{p.shortName || p.name}</p>
                    <p className="mt-1 text-xs text-stone-600">{formatPrice(p.price)} · {p.category}</p>
                  </div>
                  <button type="button" disabled={form.productIds.length >= 6} onClick={() => addProduct(p.id)}
                    className="min-h-10 shrink-0 rounded-xl bg-rose-600 px-3 text-xs font-black text-white disabled:opacity-40">+ Dodaj</button>
                </div>
              )) : <p className="p-4 text-sm text-stone-600">Brak pasujących produktów.</p>}
            </div>
          </div>
          <div className="mt-6 grid gap-4 border-t border-stone-100 pt-6">
            {[
              ["intro", "Opis zestawu (minimum 30 znaków) *", "Co warto wiedzieć o tym looku?"],
              ["tip", "Wskazówka przed zakupem (minimum 20 znaków) *", "Sprawdź rozmiary i fasony..."],
              ["excluded", "Czego nie obejmuje cena (minimum 15 znaków) *", "Np. Obuwie, torebka i dostawa..."],
            ].map(([key,label,placeholder]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-xs font-black text-stone-700">{label}</span>
                <textarea rows={3} value={form[key as "intro" | "tip" | "excluded"]}
                  maxLength={key === "excluded" ? 500 : 700}
                  onChange={(event) => update(key as "intro" | "tip" | "excluded",event.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-stone-200 p-4 text-base leading-7 outline-none focus:border-rose-400" />
              </label>
            ))}
            <div>
              <p className="text-xs font-black text-stone-700">Dlaczego elementy pasują do siebie? (2 powody) *</p>
              {form.whyItWorks.map((reason, index) => (
                <label key={index} className="mt-3 block">
                  <span className="mb-1 block text-xs text-stone-500">Powód {index + 1}, minimum 15 znaków</span>
                  <textarea rows={2} maxLength={350} value={reason}
                    onChange={(event) => {
                      const next = [...form.whyItWorks];
                      next[index] = event.target.value;
                      update("whyItWorks", next);
                    }}
                    className="w-full rounded-xl border border-stone-200 p-3 text-base leading-7 outline-none focus:border-rose-400" />
                </label>
              ))}
            </div>
          </div>

          {message && (
            <div role="status" aria-live="polite" className={`mt-6 rounded-2xl border p-4 text-sm font-bold leading-6 ${message.good ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
              {message.text}
            </div>
          )}
          <div className="mt-7 grid gap-3 border-t border-stone-100 pt-6 sm:grid-cols-2">
            <button type="button" onClick={() => void save(false)} disabled={busy}
              className="min-h-12 rounded-xl border border-stone-300 bg-white px-5 text-sm font-black text-stone-900 disabled:opacity-50">
              {busy ? "Zapisywanie..." : "Zapisz szkic"}
            </button>
            <button type="button" onClick={() => void save(true)} disabled={busy || selected.length < 2 || !budget}
              className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Publikowanie..." : editing ? "Zapisz i opublikuj" : "Opublikuj stylizację"}
            </button>
          </div>
          {editing && (
            <button type="button" onClick={newOutfit} className="mt-4 min-h-11 text-sm font-bold text-stone-600 underline">
              Anuluj edycję
            </button>
          )}
        </section>
      </div>

      <aside className="min-w-0 w-full space-y-4 xl:sticky xl:top-24">
        <section aria-labelledby="outfit-preview-heading" className="overflow-hidden rounded-[26px] border border-rose-100 bg-white shadow-[0_14px_40px_rgba(136,19,55,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <h2 id="outfit-preview-heading" className="text-lg font-black text-stone-950">Podgląd na żywo</h2>
            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">{selected.length} / 6</span>
          </div>
          <div className="grid h-52 grid-cols-2 gap-2 bg-rose-50 p-3 sm:h-64">
            {selected.slice(0, 2).map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-2xl bg-white">
                <ProductPhoto src={p.image} alt={p.name} sizes="(max-width: 640px) 42vw, 200px" className="p-2" />
              </div>
            ))}
            {selected.length === 0 && (
              <p className="col-span-2 flex items-center justify-center px-4 text-center text-sm leading-7 text-stone-500">
                Wybierz produkty, aby zobaczyć stylizację.
              </p>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-black uppercase leading-5 tracking-wider text-rose-700 [overflow-wrap:normal] [word-break:normal]">{form.occasion} · {form.style || "Twój styl"}</p>
            <h3 className="mt-2 text-xl font-black leading-snug text-stone-950 [overflow-wrap:normal] [word-break:normal]">{form.title || "Tytuł Twojego zestawu"}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{form.intro || "Uzupełnij opis, żeby przedstawić pomysł na stylizację."}</p>
            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-xs font-bold text-stone-600">Automatyczna suma zapisanych cen</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-stone-950">{formatPrice(total)}</p>
              <p className="mt-1 text-sm font-bold text-rose-700">
                {budget ? `Budżet: do ${formatPrice(budget)}` : "Wybierz produkty z prawidłowymi cenami"}
              </p>
              <p className="mt-2 text-xs leading-6 text-stone-500">
                Sumujemy aktualne ceny z katalogu, bez dostawy. Kwota w SHEIN może być inna.
              </p>
            </div>
            <div className="mt-5 space-y-2">
              {selected.map((p, index) => (
                <div key={p.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-black text-stone-800">{index + 1}. {p.shortName || p.name}</p>
                    <p className="mt-1 text-xs font-semibold text-stone-600">{formatPrice(p.price)}</p>
                  </div>
                  <button type="button" onClick={() => removeProduct(p.id)} aria-label={"Usuń z zestawu: " + p.name}
                    className="min-h-10 shrink-0 rounded-xl border border-red-100 bg-white px-3 text-xs font-black text-red-700">
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
