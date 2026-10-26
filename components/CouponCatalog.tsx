"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CatalogOffer = {
  id: string;
  store: string;
  title: string;
  description: string;
  type: "coupon" | "campaign" | "promotion";
  code: string | null;
  pagePath: string;
  validUntil: string | null;
  verifiedAt: string | null;
};

const LABEL: Record<CatalogOffer["type"], string> = {
  coupon: "Kupon rabatowy",
  campaign: "Kod kampanii (nie kupon)",
  promotion: "Promocja bez kodu",
};

export default function CouponCatalog({ offers }: { offers: CatalogOffer[] }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);
  const visible = useMemo(() => offers.filter((offer) => {
    const match = (offer.store + " " + offer.title + " " + offer.description + " " + (offer.code || ""))
      .toLocaleLowerCase("pl").includes(search.trim().toLocaleLowerCase("pl"));
    return match && (kind === "all" || offer.type === kind);
  }), [offers, search, kind]);

  async function copy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section aria-labelledby="coupons-catalog-heading" className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="coupons-catalog-heading" className="text-2xl font-black tracking-tight">Sprawdź aktualnie opublikowane oferty</h2>
          <p className="mt-2 text-sm text-stone-600">Kody do wyszukiwarki kampanii są wyraźnie odróżnione od kuponów do koszyka.</p>
        </div>
        <span className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800">{visible.length} ofert</span>
      </div>
      <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_210px]">
        <label className="text-sm font-bold text-stone-800">Szukaj sklepu lub kodu
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="np. SHEIN lub nazwa sklepu"
            className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-rose-500" />
        </label>
        <label className="text-sm font-bold text-stone-800">Rodzaj promocji
          <select value={kind} onChange={(e) => setKind(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-3 outline-none focus:border-rose-500">
            <option value="all">Wszystkie</option>
            <option value="coupon">Kupony</option>
            <option value="campaign">Kampanie</option>
            <option value="promotion">Bez kodu</option>
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-7 text-stone-600">Brak zweryfikowanych i opublikowanych ofert dla wybranego filtra.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((offer) => (
            <article key={offer.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700">{offer.store}</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-700">{LABEL[offer.type]}</span>
              </div>
              <h3 className="mt-3 text-lg font-black text-stone-950">{offer.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-stone-600">{offer.description}</p>
              {offer.validUntil && <p className="mt-3 text-xs text-stone-500">Podana data ważności: {offer.validUntil}</p>}
              {offer.code && (
                <div className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-rose-300 bg-rose-50 px-3">
                  <code className="min-w-0 flex-1 break-all text-sm font-black text-rose-950">{offer.code}</code>
                  <button type="button" onClick={() => void copy(offer.id, offer.code!)}
                    className="min-h-10 shrink-0 rounded-lg bg-white px-3 text-xs font-black text-rose-800">
                    {copied === offer.id ? "Skopiowano" : "Kopiuj"}
                  </button>
                </div>
              )}
              <Link href={offer.pagePath} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-950 px-4 text-sm font-black text-white hover:bg-rose-700">
                {offer.pagePath === "/kody-rabatowe" ? "Sprawdź warunki oferty" : "Otwórz opis i warunki"} →
              </Link>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs leading-6 text-stone-500">
        Oferty nie są testowane w koszykach na żywo. Sprawdź warunki i daty ważności u sprzedawcy.
        Część linków na Trendzamniej jest afiliacyjna — możemy otrzymać prowizję od zakupu.
      </p>
    </section>
  );
}