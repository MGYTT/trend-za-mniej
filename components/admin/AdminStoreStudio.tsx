"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreRecord } from "@/lib/stores";
import type { StoreInput } from "@/lib/store-validation";

type Form = Omit<StoreInput, "domains"> & { domains: string };
const EMPTY: Form = {
  slug: "", name: "", description: "", domains: "", websiteUrl: "",
  category: "Moda", published: false,
};
const input = "mt-1 min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm";
function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,80);
}

export default function AdminStoreStudio({ stores }: { stores: StoreRecord[] }) {
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  function patch<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(s => ({ ...s, [key]: value }));
    setMessage("");
  }
  function edit(s: StoreRecord) {
    setEditing(true);
    setForm({
      slug: s.slug, name: s.name, description: s.description, category: s.category,
      domains: s.domains.join(", "), websiteUrl: s.website_url,
      published: s.published,
    });
    document.getElementById("store-form")?.scrollIntoView({ behavior: "smooth" });
  }
  async function save(published: boolean) {
    if (busy) return;
    if (published && !window.confirm("Potwierdź, że nazwa, domeny oraz opis sklepu są poprawne.")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/extension-stores", {
        method: editing ? "PATCH" : "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error || "Błąd zapisu sklepu."); return; }
      setForm({ ...EMPTY }); setEditing(false);
      setMessage(published ? "Sklep opublikowany. Dodaj do niego kody poniżej." : "Zapisano szkic sklepu.");
      router.refresh();
    } catch { setMessage("Brak połączenia."); }
    finally { setBusy(false); }
  }
  async function remove(slug: string) {
    if (busy || !window.confirm("Usunąć sklep? Powiązane oferty stracą przypisanie do sklepu.")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/extension-stores", {
        method: "DELETE", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Delete failed");
      setMessage("Sklep usunięty.");
      router.refresh();
    } catch { setMessage("Nie udało się usunąć sklepu."); }
    finally { setBusy(false); }
  }
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-2" aria-labelledby="store-manager-title">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 id="store-manager-title" className="text-xl font-black">Sklepy ({stores.length})</h2>
        <p className="mt-2 text-xs leading-6 text-stone-600">Istniejący SHEIN działa niezależnie i nie wymaga dodawania tutaj.</p>
        <button type="button" onClick={() => { setForm({ ...EMPTY }); setEditing(false); }} className="mt-4 min-h-11 rounded-xl bg-stone-950 px-4 text-xs font-black text-white">
          + Nowy sklep
        </button>
        <div className="mt-4 space-y-3">
          {stores.map(store => (
            <div key={store.slug} className="rounded-xl border border-stone-100 p-4">
              <p className="font-black">{store.name} <span className="text-xs text-stone-500">({store.slug})</span></p>
              <p className="mt-1 text-xs text-stone-600">
                {store.published ? "Opublikowany" : "Szkic"}
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => edit(store)}
                  className="min-h-10 rounded-xl bg-rose-50 px-4 text-xs font-black text-rose-700">Edytuj</button>
                <button type="button" onClick={() => void remove(store.slug)} disabled={busy}
                  className="min-h-10 rounded-xl bg-stone-100 px-4 text-xs font-black">Usuń</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div id="store-form" className="rounded-2xl border border-rose-100 bg-white p-5">
        <h2 className="text-xl font-black">{editing ? "Edytuj sklep" : "Dodaj sklep"}</h2>
        <p className="mt-2 text-xs leading-6 text-stone-600">Możesz dodać kolejne sklepy; publikuj tylko poprawne adresy i opisy.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-black">Nazwa
            <input className={input} value={form.name} onChange={e => {
              patch("name", e.target.value);
              if (!editing) patch("slug", slugify(e.target.value));
            }} />
          </label>
          <label className="text-xs font-black">Slug (adres)
            <input className={input} value={form.slug} disabled={editing}
              onChange={e => patch("slug", slugify(e.target.value))} />
          </label>
          <label className="text-xs font-black">Domeny, po przecinku
            <input className={input} value={form.domains} placeholder="sklep.pl"
              onChange={e => patch("domains", e.target.value)} />
          </label>
          <label className="text-xs font-black">Oficjalny adres HTTPS
            <input className={input} value={form.websiteUrl} placeholder="https://sklep.pl/"
              onChange={e => patch("websiteUrl", e.target.value)} />
          </label>
          <label className="text-xs font-black">Kategoria
            <input className={input} value={form.category} onChange={e => patch("category", e.target.value)} />
          </label>

        </div>
        <label className="mt-4 block text-xs font-black">Opis sklepu
          <textarea className={input + " min-h-28"} value={form.description}
            maxLength={1200} onChange={e => patch("description", e.target.value)} />
        </label>
        {message && <p role="status" className="mt-3 text-sm font-semibold text-rose-800">{message}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void save(false)}
            className="min-h-12 rounded-xl border border-stone-200 px-4 text-sm font-black">Zapisz szkic</button>
          <button type="button" disabled={busy} onClick={() => void save(true)}
            className="min-h-12 rounded-xl bg-rose-600 px-4 text-sm font-black text-white">Opublikuj sklep</button>
        </div>
      </div>
    </section>
  );
}
