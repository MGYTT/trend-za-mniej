"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { normalizeDirectoryText, offerCountLabel } from "@/lib/store-directory-utils";

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
  destinationUrl?: string | null;
};

const LABEL: Record<CatalogOffer["type"], string> = {
  coupon: "Kupon do koszyka",
  campaign: "Kod kampanii — nie kupon",
  promotion: "Promocja bez kodu",
};

const filterLabels = [
  { value: "all", title: "Wszystkie" },
  { value: "coupon", title: "Kupony" },
  { value: "campaign", title: "Kampanie" },
  { value: "promotion", title: "Bez kodu" },
] as const;

function polishDate(raw: string) {
  const date = new Date(raw.length === 10 ? raw + "T12:00:00Z" : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw",
  }).format(date);
}

export default function CouponCatalog({ offers }: { offers: CatalogOffer[] }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<(typeof filterLabels)[number]["value"]>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const counts = {
    all: offers.length,
    coupon: offers.filter(offer => offer.type === "coupon").length,
    campaign: offers.filter(offer => offer.type === "campaign").length,
    promotion: offers.filter(offer => offer.type === "promotion").length,
  };
  const visible = useMemo(() => {
    const terms = normalizeDirectoryText(search).split(" ").filter(Boolean);
    return offers.filter(offer => {
      if (kind !== "all" && offer.type !== kind) return false;
      const haystack = normalizeDirectoryText([offer.store, offer.title, offer.description, offer.code || ""].join(" "));
      return terms.every(term => haystack.includes(term));
    });
  }, [offers, search, kind]);

  async function copy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setCopyError(null);
    } catch {
      setCopied(null);
      setCopyError("Nie udało się skopiować kodu. Zaznacz go i skopiuj ręcznie.");
    }
  }

  return (
    <section id="oferty" aria-labelledby="coupons-catalog-heading" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Oferty sklepu</p>
          <h2 id="coupons-catalog-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Kody i promocje</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
            Wybierz rodzaj oferty i skopiuj kod. Kody kampanii nie zawsze obniżają cenę w koszyku.
          </p>
        </div>
        <span aria-live="polite" className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-800">
          {offerCountLabel(visible.length)}
        </span>
      </div>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <label className="block text-sm font-bold text-stone-800">Szukaj w ofertach tego sklepu
          <input type="search" value={search} maxLength={100} onChange={event => setSearch(event.target.value)}
            placeholder="Wpisz kod, rodzaj produktu lub nazwę kampanii"
            className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-rose-500" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Rodzaj promocji">
          {filterLabels.map(item => (
            <button key={item.value} type="button" aria-pressed={kind === item.value}
              onClick={() => setKind(item.value)}
              className={"min-h-10 rounded-full border px-4 text-xs font-black transition " +
                (kind === item.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-rose-300")}>
              {item.title} · {counts[item.value]}
            </button>
          ))}
        </div>
        {(search || kind !== "all") && (
          <button type="button" onClick={() => { setSearch(""); setKind("all"); }}
            className="mt-3 rounded-lg px-2 py-2 text-xs font-bold text-rose-700 hover:underline">
            Wyczyść filtry ofert
          </button>
        )}
      </div>

      {copyError && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{copyError}</p>}
      {visible.length === 0 ? (
        <div role="status" className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-lg font-black">Brak ofert pasujących do filtrów</p>
          <p className="mt-2 text-sm text-stone-600">Spróbuj innego słowa lub wybierz wszystkie rodzaje promocji.</p>
          <button type="button" onClick={() => { setSearch(""); setKind("all"); }}
            className="mt-5 min-h-11 rounded-xl bg-stone-950 px-5 text-sm font-bold text-white">Pokaż wszystkie oferty</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map(offer => (
            <article key={offer.id} className="flex min-w-0 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700">{offer.store}</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1.5 text-[11px] font-bold text-stone-700">{LABEL[offer.type]}</span>
              </div>
              <h3 className="mt-4 text-lg font-black leading-7 text-stone-950">{offer.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-stone-600">{offer.description}</p>
              {offer.validUntil && <p className="mt-3 text-xs font-medium text-stone-500">Podana ważność: {polishDate(offer.validUntil)}</p>}
              {offer.verifiedAt && <p className="mt-1 text-xs text-stone-500">Ostatni przegląd oferty: {polishDate(offer.verifiedAt)}</p>}
              {offer.code && (
                <div className="mt-4 flex min-h-14 items-center gap-3 rounded-xl border border-dashed border-rose-300 bg-rose-50 px-3">
                  <code className="min-w-0 flex-1 select-all break-all text-sm font-black text-rose-950">{offer.code}</code>
                  <button type="button" onClick={() => void copy(offer.id, offer.code!)}
                    aria-label={"Kopiuj kod " + offer.code}
                    className="min-h-10 shrink-0 rounded-lg bg-white px-3 text-xs font-black text-rose-800 hover:bg-rose-100">
                    {copied === offer.id ? "Skopiowano ✓" : "Kopiuj"}
                  </button>
                </div>
              )}
              {offer.destinationUrl && (
                <a href={offer.destinationUrl} target="_blank" rel="sponsored nofollow noopener noreferrer"
                  className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-center text-sm font-black text-white hover:bg-rose-700">
                  Przejdź do promocji w sklepie ↗
                </a>
              )}
              {offer.pagePath !== "/kody-rabatowe" && (
                <Link href={offer.pagePath}
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 px-4 text-center text-sm font-bold text-stone-900 hover:border-rose-300">
                  Zobacz opis i warunki →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      <p className="mt-7 text-xs leading-7 text-stone-500">
        Kody nie są sprawdzane automatycznie w koszykach. Potwierdź aktualne warunki, datę ważności i cenę u sprzedawcy.
        Część linków na Trendzamniej jest afiliacyjna — możemy otrzymać prowizję po zakupie.
      </p>
    </section>
  );
}
