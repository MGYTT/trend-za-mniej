"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SheinCampaignRow, CampaignClickCounts } from "@/lib/shein-campaigns";
import { CAMPAIGN_CATEGORIES, type CampaignCategory, type CampaignInput } from "@/lib/shein-campaign-validation";
import { preparePromotionDraft, type PromotionDraft } from "@/lib/promotion-draft-assistant";
import PromotionSeoPreview from "@/components/admin/PromotionSeoPreview";

const LABELS: Record<CampaignCategory, string> = {
  "new-users": "Dla nowych", fashion: "Moda", beauty: "Beauty",
  accessories: "Buty i dodatki", home: "Dom", kids: "Dzieci", sale: "Wyprzedaże",
};

const EMPTY: CampaignInput = {
  id: "", title: "", badge: "", description: "", code: "", affiliateUrl: "",
  ctaLabel: "Sprawdź ofertę w SHEIN", note: "",
  category: "fashion", codeKind: "campaign", sortOrder: 100,
  published: false, validUntil: null,
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function toInput(row: SheinCampaignRow): CampaignInput {
  return {
    id: row.id, title: row.title, badge: row.badge, description: row.description,
    code: row.code, affiliateUrl: row.affiliate_url, ctaLabel: row.cta_label,
    note: row.note, category: row.category as CampaignCategory,
    codeKind: row.code_kind, sortOrder: row.sort_order,
    published: row.published, validUntil: row.valid_until,
  };
}

function localDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export default function AdminSheinCampaignStudio({
  initialCampaigns, clickCounts, analyticsUnavailable,
}: {
  initialCampaigns: SheinCampaignRow[];
  clickCounts: CampaignClickCounts;
  analyticsUnavailable: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CampaignInput>({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "expired">("all");
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30>(30);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [sourceDescription, setSourceDescription] = useState("");
  const [seoDraft, setSeoDraft] = useState<PromotionDraft | null>(null);
  const today = localDate();

  const expired = (row: SheinCampaignRow) => Boolean(row.valid_until && row.valid_until < today);
  const publishedCount = initialCampaigns.filter((row) => row.published && !expired(row)).length;
  const expiredCount = initialCampaigns.filter((row) => expired(row)).length;
  const drafts = initialCampaigns.filter((row) => !row.published).length;

  const clicksFor = (id: string) => (
    clickCounts[id]?.[analyticsDays === 7 ? "last7" : "last30"] ?? 0
  );
  const measuredTotal = Object.values(clickCounts).reduce(
    (total, row) => total + (analyticsDays === 7 ? row.last7 : row.last30), 0
  );
  const topCampaigns = [...initialCampaigns]
    .map((row) => ({ id: row.id, title: row.title, clicks: clicksFor(row.id) }))
    .filter((row) => row.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 3);

  const visible = (() => {
    const needle = query.trim().toLocaleLowerCase("pl");
    return initialCampaigns.filter((row) => {
      if (filter === "published" && (!row.published || expired(row))) return false;
      if (filter === "draft" && row.published) return false;
      if (filter === "expired" && !expired(row)) return false;
      return !needle || [row.title, row.id, row.badge, row.code, row.category]
        .join(" ").toLocaleLowerCase("pl").includes(needle);
    });
  })();

  function patch<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
    setSeoDraft(null);
  }

  function startNew() {
    setEditing(null);
    setSeoDraft(null); setSourceDescription("");
    setForm({ ...EMPTY, sortOrder: initialCampaigns.length * 10 + 10 });
    setMessage(null);
    document.getElementById("shein-campaign-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function edit(row: SheinCampaignRow) {
    setEditing(row.id);
    setSeoDraft(null); setSourceDescription("");
    setForm(toInput(row));
    setMessage(null);
    document.getElementById("shein-campaign-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fillFromSource() {
    if (!sourceDescription.trim() || (!form.code.trim() && !/kod\s*[:\-]/i.test(sourceDescription))) {
      setMessage({ text: "Wpisz kod oraz opis oferty lub użyj zapisu „Kod: ABC123” w tekście.", success: false });
      return;
    }
    const draft = preparePromotionDraft({
      channel: "shein", storeName: "SHEIN", code: form.code, rawText: sourceDescription,
    });
    setForm((prev) => ({
      ...prev,
      id: editing ? prev.id : slugify(draft.title),
      title: draft.title, badge: draft.badge,
      description: draft.description, note: draft.note,
      ctaLabel: draft.ctaLabel, category: draft.category,
      codeKind: "campaign", code: draft.code || prev.code,
      validUntil: draft.validUntil || prev.validUntil, published: false,
    }));
    setSeoDraft(draft);
    setMessage({ text: "Przygotowano pola i wskazówki SEO. Link i działanie kodu wymagają sprawdzenia w SHEIN przed publikacją.", success: true });
  }

  async function save(published: boolean) {
    if (busy) return;
    if (published && !window.confirm(
      "Opublikować tę kampanię? Upewnij się, że kod, link i warunki zostały sprawdzone w SHEIN."
    )) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/shein-campaigns", {
        method: editing ? "PATCH" : "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage({ text: result.error || "Nie udało się zapisać kampanii.", success: false });
        return;
      }
      setEditing(null);
      setForm({ ...EMPTY }); setSeoDraft(null); setSourceDescription("");
      setMessage({
        text: published ? "Kampania zapisana i opublikowana. Zmiany są widoczne na stronie." : "Zapisano kampanię jako szkic. Nie jest widoczna publicznie.",
        success: true,
      });
      router.refresh();
    } catch {
      setMessage({ text: "Nie udało się połączyć z serwerem. Spróbuj ponownie.", success: false });
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
  const areaClass = "mt-2 w-full rounded-xl border border-stone-200 bg-white p-4 text-base leading-7 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

  return (
    <div className="mt-7 grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
      <section aria-labelledby="shein-campaign-insights-title"
        className="min-w-0 rounded-[26px] border border-rose-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">
              Analityka kampanii
            </p>
            <h2 id="shein-campaign-insights-title" className="mt-2 text-xl font-black tracking-tight text-stone-950">
              Które promocje przyciągają kliknięcia?
            </h2>
            <p className="mt-2 text-xs leading-6 text-stone-600">
              Liczymy otwarcia linków do SHEIN od uruchomienia pomiaru.
              To nie są zakupy, przychody ani liczba unikalnych osób.
            </p>
          </div>
          <div role="group" aria-label="Zakres statystyk promocji"
            className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
            {([7, 30] as const).map((days) => (
              <button key={days} type="button" aria-pressed={analyticsDays === days}
                onClick={() => setAnalyticsDays(days)}
                className={`min-h-11 rounded-lg px-4 text-xs font-black transition ${analyticsDays === days
                  ? "bg-rose-600 text-white shadow-sm" : "text-stone-700 hover:bg-rose-50"}`}>
                {days} dni
              </button>
            ))}
          </div>
        </div>
        {analyticsUnavailable ? (
          <p role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm font-semibold text-amber-900">
            Statystyki chwilowo niedostępne. Kampanie można nadal edytować i publikować.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white p-5">
              <p className="text-xs font-bold text-stone-600">Przejścia w ostatnich {analyticsDays} dniach</p>
              <p className="mt-2 text-4xl font-black tabular-nums tracking-tight text-stone-950">
                {measuredTotal.toLocaleString("pl-PL")}
              </p>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                Od uruchomienia pomiaru · bez danych historycznych
              </p>
            </div>
            <div className="rounded-2xl border border-stone-100 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-stone-500">
                Najczęściej otwierane kampanie
              </p>
              {topCampaigns.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Brak zarejestrowanych przejść w wybranym okresie. Pierwsze wyniki pojawią się po kliknięciach odwiedzających.
                </p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {topCampaigns.map((campaign, index) => (
                    <li key={campaign.id} className="flex items-center gap-3 text-sm">
                      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-xs font-black text-rose-700">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-bold text-stone-800">{campaign.title}</span>
                      <span className="tabular-nums font-black text-rose-700">{campaign.clicks.toLocaleString("pl-PL")}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </section>
      <section aria-labelledby="shein-campaign-list-title" className="min-w-0 rounded-[26px] border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Biblioteka kampanii</p>
            <h2 id="shein-campaign-list-title" className="mt-2 text-xl font-black">Promocje i kody</h2>
          </div>
          <button type="button" onClick={startNew} disabled={busy}
            className="min-h-11 rounded-xl bg-stone-950 px-4 text-sm font-black text-white disabled:opacity-50">
            + Nowa kampania
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Łącznie", initialCampaigns.length], ["Widoczne", publishedCount], ["Szkice", drafts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-stone-50 px-3 py-4">
              <p className="text-2xl font-black tabular-nums text-stone-900">{value}</p>
              <p className="mt-1 text-[11px] font-bold text-stone-600">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">{expiredCount} kampanii po dacie ważności (ukrytych na stronie).</p>
        <label className="mt-5 block text-xs font-black text-stone-700" htmlFor="admin-shein-search">
          Szukaj kampanii
        </label>
        <input id="admin-shein-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Nazwa, kod lub kategoria" className={inputClass} />
        <div role="group" aria-label="Filtruj status kampanii" className="mt-4 flex flex-wrap gap-2">
          {([
            ["all","Wszystkie"], ["published","Widoczne"], ["draft","Szkice"], ["expired","Wygasłe"],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}
              className={`min-h-10 rounded-xl border px-3 text-xs font-black transition ${filter === key ? "border-rose-600 bg-rose-600 text-white" : "border-stone-200 bg-white text-stone-700 hover:bg-rose-50"}`}>
              {label}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="mt-4 text-xs font-semibold text-stone-600">
          Wyświetlono {visible.length} z {initialCampaigns.length} kampanii
        </p>
        <div className="mt-3 max-h-[740px] space-y-2 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-600">
              Brak kampanii pasujących do filtrów.
            </p>
          )}
          {visible.map((row) => (
            <div key={row.id} className={`rounded-2xl border px-4 py-4 transition ${editing === row.id ? "border-rose-300 bg-rose-50/40" : "border-stone-200 bg-white"}`}>
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-black leading-6 text-stone-950">{row.title}</p>
                  <p className="mt-1 break-all font-mono text-xs font-black tracking-wide text-rose-700">{row.code}</p>
                  <p className="mt-1 text-xs text-stone-500">{LABELS[row.category as CampaignCategory] ?? "Inne"} · kolejność {row.sort_order}</p>
                  {!analyticsUnavailable && (
                    <p className="mt-2 text-xs font-black text-rose-700">
                      {clicksFor(row.id).toLocaleString("pl-PL")} przejść · {analyticsDays} dni
                    </p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${expired(row) ? "bg-stone-100 text-stone-600" : row.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                  {expired(row) ? "Wygasła" : row.published ? "Widoczna" : "Szkic"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => edit(row)} disabled={busy}
                  className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                  Edytuj
                </button>
                {row.published && !expired(row) && (
                  <Link href={"/promocje-shein#" + row.id} target="_blank"
                    className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-3 text-xs font-bold text-stone-700">
                    Zobacz ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="shein-campaign-editor" aria-labelledby="shein-campaign-editor-title"
        className="min-w-0 scroll-mt-24 rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-widest text-rose-700">
          {editing ? "Edycja kampanii" : "Nowa kampania"}
        </p>
        <h2 id="shein-campaign-editor-title" className="mt-2 text-2xl font-black tracking-tight text-stone-950">
          {editing ? "Zmień promocję" : "Dodaj promocję"}
        </h2>
        <p className="mt-2 text-xs leading-6 text-stone-500">
          Publikacja dotyczy tylko widoczności w Trend za Mniej. Nie potwierdza aktywności kampanii w SHEIN.
        </p>
        <section aria-label="Asystent wypełniania kampanii SHEIN" className="mt-5 min-w-0 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
          <p className="text-sm font-black text-rose-900">✨ Automatyczne przygotowanie kampanii i SEO</p>
          <p className="mt-2 text-xs leading-6 text-stone-600">
            Wpisz kod w formularzu poniżej i wklej tekst oferty. Asystent przygotuje tytuł,
            opis, warunki, etykietę, kategorię i wskazówki SEO. Nie weryfikuje promocji w SHEIN.
          </p>
          <label className="mt-3 block text-xs font-black text-stone-700">
            Surowy opis od partnera
            <textarea rows={4} maxLength={2800} value={sourceDescription}
              onChange={(event) => setSourceDescription(event.target.value)}
              placeholder="Np. Kod: ABC1234. Oferta dla nowych użytkowników na ubrania, ważna do 2026-11-30."
              className={areaClass + " min-h-28"} />
          </label>
          <button type="button" disabled={busy} onClick={fillFromSource}
            className="mt-3 min-h-12 w-full rounded-xl bg-stone-950 px-4 text-sm font-black text-white hover:bg-stone-800 disabled:opacity-50">
            ✨ Uzupełnij formularz i przygotuj SEO
          </button>
          <PromotionSeoPreview draft={seoDraft} />
        </section>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Tytuł kampanii *</span>
            <input maxLength={160} value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value, id: !editing && prev.id === slugify(prev.title) ? slugify(e.target.value) : prev.id }))}
              placeholder="Np. Nowe okazje na weekend" className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Identyfikator w adresie *</span>
            <input maxLength={90} value={form.id} disabled={Boolean(editing)}
              onChange={(e) => patch("id", slugify(e.target.value))}
              placeholder="nowe-okazje-na-weekend" className={inputClass + " disabled:bg-stone-100"} />
            <span className="mt-1 block text-xs text-stone-500">Stały identyfikator chroni działające linki.</span>
          </label>
          <label className="block">
            <span className="text-xs font-black text-stone-700">Kod kampanii *</span>
            <input maxLength={14} value={form.code} spellCheck={false}
              onChange={(e) => patch("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC1234" className={inputClass + " font-mono tracking-widest"} />
          </label>
          <label className="block">
            <span className="text-xs font-black text-stone-700">Rodzaj kodu *</span>
            <select value={form.codeKind}
              onChange={(e) => patch("codeKind", e.target.value as CampaignInput["codeKind"])} className={inputClass}>
              <option value="campaign">Kod do wyszukiwania kampanii</option>
              <option value="coupon">Kupon — tylko jeśli potwierdzony</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-stone-700">Kategoria *</span>
            <select value={form.category}
              onChange={(e) => patch("category", e.target.value as CampaignCategory)} className={inputClass}>
              {CAMPAIGN_CATEGORIES.map((cat) => <option key={cat} value={cat}>{LABELS[cat]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-stone-700">Kolejność (mniejsza = wyżej) *</span>
            <input type="number" min={0} max={9999} step={1} value={form.sortOrder}
              onChange={(e) => patch("sortOrder", Number(e.target.value))} className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Etykieta karty *</span>
            <input maxLength={75} value={form.badge} onChange={(e) => patch("badge", e.target.value)}
              placeholder="Np. Moda damska" className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Link afiliacyjny SHEIN *</span>
            <input type="url" inputMode="url" value={form.affiliateUrl} onChange={(e) => patch("affiliateUrl", e.target.value)}
              placeholder="https://onelink.shein.com/56/..." className={inputClass} />
            <span className="mt-1 block text-xs text-stone-500">Ze względów bezpieczeństwa tylko linki onelink.shein.com w znanym formacie.</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Tekst przycisku *</span>
            <input maxLength={90} value={form.ctaLabel} onChange={(e) => patch("ctaLabel", e.target.value)}
              className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Opis kampanii *</span>
            <textarea rows={3} maxLength={1200} value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              placeholder="Co obejmuje kampania?" className={areaClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Warunki i zastrzeżenia *</span>
            <textarea rows={3} maxLength={1000} value={form.note}
              onChange={(e) => patch("note", e.target.value)}
              placeholder="Warunki zakupu, ograniczenia, konieczność potwierdzenia w SHEIN..." className={areaClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-stone-700">Data zakończenia (opcjonalnie)</span>
            <input type="date" value={form.validUntil ?? ""}
              onChange={(e) => patch("validUntil", e.target.value || null)} className={inputClass} />
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              Po tej dacie kampania przestanie być publicznie widoczna, nawet jeśli ma status „Opublikowana”.
            </span>
          </label>
        </div>
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-rose-700">Podgląd karty</p>
          <p className="mt-3 break-words text-lg font-black text-stone-950">{form.title || "Tytuł promocji"}</p>
          <p className="mt-2 text-sm font-bold text-stone-600">{form.badge || "Etykieta"} · {LABELS[form.category]}</p>
          <p className="mt-3 break-all font-mono text-xl font-black tracking-widest text-rose-700">{form.code || "KOD"}</p>
          <p className="mt-2 line-clamp-3 text-xs leading-6 text-stone-600">{form.description || "Opis będzie widoczny po rozwinięciu szczegółów na stronie promocji."}</p>
          <p className="mt-3 text-xs text-stone-600">{form.codeKind === "coupon" ? "Kupon: potwierdź warunki w SHEIN" : "Kod kampanii, niekoniecznie rabat w koszyku"}</p>
        </div>
        {message && (
          <div role="status" aria-live="polite" className={`mt-5 rounded-2xl border p-4 text-sm font-bold leading-6 ${message.success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            {message.text}
          </div>
        )}
        <div className="mt-6 grid gap-3 border-t border-stone-100 pt-5 sm:grid-cols-2">
          <button type="button" disabled={busy} onClick={() => void save(false)}
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-5 text-sm font-black text-stone-900 disabled:opacity-50">
            {busy ? "Zapisywanie..." : "Zapisz jako szkic"}
          </button>
          <button type="button" disabled={busy} onClick={() => void save(true)}
            className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm hover:bg-rose-700 disabled:opacity-50">
            {busy ? "Zapisywanie..." : editing ? "Zapisz i opublikuj" : "Opublikuj kampanię"}
          </button>
        </div>
        {editing && (
          <button type="button" onClick={startNew}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-stone-600 underline">
            Anuluj edycję i dodaj nową kampanię
          </button>
        )}
      </section>
    </div>
  );
}
