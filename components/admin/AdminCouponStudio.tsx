"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtensionOfferInput } from "@/lib/extension-offer-validation";
import type { StoreRecord } from "@/lib/stores";

export type ExtensionOfferRow = {
  id: string; store_name: string; store_domains: string[]; store_slug: string | null;
  title: string; description: string;
  offer_type: ExtensionOfferInput["offerType"]; code: string | null;
  page_path: string; destination_url: string | null; published: boolean; valid_until: string | null;
  last_verified_at: string | null; created_at: string;
};

type Form = Omit<ExtensionOfferInput, "storeDomains"> & { storeDomains: string };
const EMPTY: Form = {
  id: null, storeName: "", storeSlug: null, storeDomains: "", title: "", description: "",
  offerType: "coupon", code: "", pagePath: "/kody-rabatowe", destinationUrl: null,
  published: false, verified: false, validUntil: null,
};

const classes = "mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none";

export default function AdminCouponStudio({ initialOffers, stores }: { initialOffers: ExtensionOfferRow[]; stores: StoreRecord[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "expired">("all");
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const isExpired = (row: ExtensionOfferRow) => Boolean(row.valid_until && row.valid_until < today);
  const counts = {
    all: initialOffers.length,
    published: initialOffers.filter(row => row.published && !isExpired(row)).length,
    draft: initialOffers.filter(row => !row.published && !isExpired(row)).length,
    expired: initialOffers.filter(isExpired).length,
  };
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const visible = initialOffers.filter((item) => {
    if (filter === "published" && (!item.published || isExpired(item))) return false;
    if (filter === "draft" && (item.published || isExpired(item))) return false;
    if (filter === "expired" && !isExpired(item)) return false;
    return (item.store_name + " " + item.title + " " + (item.code || ""))
      .toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"));
  });
  function patch<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((old) => ({ ...old, [field]: value }));
    setMessage("");
  }
  function edit(row: ExtensionOfferRow) {
    setEditing(true);
    setForm({
      id: row.id, storeName: row.store_name, storeSlug: row.store_slug,
      storeDomains: row.store_domains.join(", "), title: row.title,
      description: row.description, offerType: row.offer_type,
      code: row.code, pagePath: row.page_path, destinationUrl: row.destination_url,
      validUntil: row.valid_until, published: row.published, verified: false,
    });
    setMessage("Potwierdź ponownie weryfikację kodu przed zapisaniem opublikowanej oferty.");
    document.getElementById("coupon-form")?.scrollIntoView({ behavior: "smooth" });
  }
  function duplicate(row: ExtensionOfferRow) {
    setEditing(false);
    setForm({
      id: null, storeName: row.store_name, storeSlug: row.store_slug,
      storeDomains: row.store_domains.join(", "),
      title: ("Kopia: " + row.title).slice(0, 180), description: row.description,
      offerType: row.offer_type,
      // Keep the existing code as a template: database constraints require a code even for drafts.
      // The form still starts unpublished and requires manual verification before any publication.
      code: row.code,
      pagePath: row.page_path, destinationUrl: row.destination_url,
      validUntil: null, published: false, verified: false,
    });
    setMessage("Utworzono kopię jako nowy szkic. Skopiowany kod wymaga ponownego sprawdzenia; zaktualizuj tytuł, termin i warunki przed publikacją.");
    document.getElementById("coupon-form")?.scrollIntoView({ behavior: "smooth" });
  }
  async function save(published: boolean) {
    if (busy) return;
    if (published && (!form.verified ||
      !window.confirm("Potwierdzasz aktualność kodu, warunki oferty i publikację?"))) {
      setMessage("Przed publikacją sprawdź ofertę i potwierdź weryfikację.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/extension-offers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...form, published }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setMessage(data.error || "Nie udało się zapisać."); return; }
      setForm({ ...EMPTY }); setEditing(false);
      setMessage(published ? "Opublikowano ofertę." : "Zapisano szkic.");
      router.refresh();
    } catch { setMessage("Brak połączenia z serwerem."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (busy || !window.confirm("Usunąć tę ofertę na stałe?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/extension-offers", {
        method: "DELETE", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Błąd usuwania");
      if (form.id === id) { setForm({ ...EMPTY }); setEditing(false); }
      setMessage("Usunięto ofertę.");
      router.refresh();
    } catch { setMessage("Nie udało się usunąć oferty."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(300px,1fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black">Lista kodów ({initialOffers.length})</h2>
          <button type="button" onClick={() => { setForm({ ...EMPTY }); setEditing(false); }}
            className="min-h-10 rounded-xl bg-stone-950 px-4 text-xs font-black text-white">+ Nowa oferta</button>
        </div>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          aria-label="Szukaj promocji" placeholder="Szukaj sklepu lub kodu" className={classes + " mt-4"} />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Status ofert">
          {([
            ["all", "Wszystkie"], ["published", "Opublikowane"],
            ["draft", "Szkice"], ["expired", "Wygasłe"],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}
              className={"min-h-9 rounded-full border px-3 text-xs font-black " +
                (filter === key ? "border-stone-950 bg-stone-950 text-white" :
                  "border-stone-200 bg-white text-stone-600 hover:border-rose-300")}>
              {label} ({counts[key]})
            </button>
          ))}
        </div>
        <div className="mt-4 grid max-h-[620px] gap-2 overflow-y-auto">
          {visible.length === 0 && <p className="text-sm text-stone-600">Brak zapisanych ofert.</p>}
          {visible.map((item) => (
            <div key={item.id} className="rounded-xl border border-stone-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-black">{item.store_name}</p>
                <span className={"text-xs font-bold " + (isExpired(item) ? "text-rose-700" : "text-stone-500")}>
                  {isExpired(item) ? "Wygasła" : item.published ? "Opublikowana" : "Szkic"}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-700">{item.title}</p>
              <p className="mt-1 text-xs text-stone-500">
                {item.code || "Bez kodu"} · {item.offer_type} {item.valid_until ? "· do " + item.valid_until : ""}
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => edit(item)}
                  className="min-h-10 rounded-lg bg-rose-50 px-3 text-xs font-black text-rose-700">Edytuj</button>
                <button type="button" onClick={() => duplicate(item)}
                  className="min-h-10 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-700">Duplikuj jako szkic</button>
                <button type="button" onClick={() => void remove(item.id)} disabled={busy}
                  className="min-h-10 rounded-lg bg-stone-100 px-3 text-xs font-black text-stone-700">Usuń</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="coupon-form" className="rounded-2xl border border-rose-100 bg-white p-5">
        <h2 className="text-xl font-black">{editing ? "Edytuj promocję" : "Dodaj promocję"}</h2>
        <p className="mt-2 text-xs leading-6 text-stone-600">Nie dodawaj niepotwierdzonych kodów. Każda publikacja wymaga osobnego sprawdzenia i potwierdzenia warunków u sprzedawcy.</p>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-black">Wybierz sklep z katalogu
            <select className={classes} value={form.storeSlug || ""} onChange={e => {
              const row = stores.find(s => s.slug === e.target.value);
              setForm(old => ({ ...old, storeSlug: row?.slug || null,
                storeName: row?.name || "", storeDomains: row?.domains.join(", ") || "" }));
            }}>
              <option value="">— Wybierz sklep —</option>
              {stores.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-black">Sklep
            <input className={classes} value={form.storeName} disabled maxLength={120}
              onChange={(e) => patch("storeName", e.target.value)} placeholder="Nazwa sklepu" />
          </label>
          <label className="text-xs font-black">Domeny (oddziel przecinkiem)
            <input className={classes} value={form.storeDomains} disabled
              onChange={(e) => patch("storeDomains", e.target.value)} placeholder="sklep.pl, sklep.com" />
          </label>
          <label className="text-xs font-black">Tytuł
            <input className={classes} value={form.title} maxLength={180}
              onChange={(e) => patch("title", e.target.value)} />
          </label>
          <label className="text-xs font-black">Opis i warunki
            <textarea className={classes + " min-h-28"} value={form.description} maxLength={1500}
              onChange={(e) => patch("description", e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-black">Rodzaj
              <select value={form.offerType} className={classes}
                onChange={(e) => patch("offerType", e.target.value as Form["offerType"])}>
                <option value="coupon">Kupon do koszyka</option>
                <option value="campaign">Kod kampanii</option>
                <option value="promotion">Promocja bez kodu</option>
              </select>
            </label>
            <label className="text-xs font-black">Kod
              <input className={classes} value={form.code || ""} disabled={form.offerType === "promotion"}
                onChange={(e) => patch("code", e.target.value)} />
            </label>
            <label className="text-xs font-black">Ścieżka na Trendzamniej
              <input className={classes} value={form.pagePath}
                onChange={(e) => patch("pagePath", e.target.value)} />
            </label>
            <label className="text-xs font-black">Ważny do (opcjonalnie)
              <input type="date" className={classes} value={form.validUntil || ""}
                onChange={(e) => patch("validUntil", e.target.value || null)} />
            </label>
          </div>
          <label className="block text-xs font-black">Adres konkretnej promocji w sklepie (opcjonalnie)
            <input type="url" className={classes} value={form.destinationUrl || ""}
              onChange={e => patch("destinationUrl", e.target.value || null)}
              placeholder="https://sklep.pl/produkt-lub-promocja" />
            <span className="mt-1 block font-normal leading-5 text-stone-500">Tylko oficjalna domena wybranego sklepu, bez adresów przekierowujących z sieci afiliacyjnych.</span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
            <input type="checkbox" checked={form.verified} onChange={(e) => patch("verified", e.target.checked)}
              className="mt-1 h-4 w-4" />
            Sprawdziłem kod, zasady promocji i datę ważności u sprzedawcy.
          </label>
          {message && <p role="status" className="text-sm font-semibold text-rose-800">{message}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void save(false)}
              className="min-h-12 rounded-xl border border-stone-200 px-5 text-sm font-black">Zapisz szkic</button>
            <button type="button" disabled={busy} onClick={() => void save(true)}
              className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white">Opublikuj</button>
          </div>
        </div>
      </section>
    </div>
  );
}