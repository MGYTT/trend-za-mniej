"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  daysUntil, lifecycleStatus, renewalError, type LifecycleFilter,
  type LifecycleRow, type LifecycleSource, type LifecycleStatus,
} from "@/lib/offer-lifecycle";

const tabs: { key: LifecycleFilter; title: string }[] = [
  { key: "all", title: "Wszystkie" },
  { key: "active", title: "Aktywne" },
  { key: "expiring", title: "Wygasają wkrótce" },
  { key: "expired", title: "Wygasłe" },
  { key: "draft", title: "Szkice / wyłączone" },
];
const copy: Record<LifecycleStatus, string> = {
  active: "Aktywna",
  expiring: "Wygasa wkrótce",
  expired: "Wygasła",
  draft: "Nieopublikowana",
};
const badgeStyle: Record<LifecycleStatus, string> = {
  active: "bg-emerald-50 text-emerald-800",
  expiring: "bg-amber-50 text-amber-900",
  expired: "bg-rose-50 text-rose-800",
  draft: "bg-stone-100 text-stone-700",
};
function prettyDate(value: string | null) {
  if (!value) return "Bez daty końcowej";
  const time = new Date(value + "T12:00:00Z");
  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric", month: "short", day: "numeric", timeZone: "Europe/Warsaw",
  }).format(time);
}

export default function OfferLifecycleStudio({
  initialRows, today,
}: { initialRows: LifecycleRow[]; today: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<LifecycleFilter>("all");
  const [source, setSource] = useState<"all" | LifecycleSource>("all");
  const [query, setQuery] = useState("");
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const nextDay = new Date(Date.parse(today + "T12:00:00Z") + 86400000).toISOString().slice(0, 10);

  const items = useMemo(() => initialRows.map(item => ({
    ...item, state: lifecycleStatus(item, today), key: item.source + ":" + item.id,
  })), [initialRows, today]);
  const counts = Object.fromEntries(tabs.map(tab => [
    tab.key,
    tab.key === "all" ? items.length : items.filter(item => item.state === tab.key).length,
  ])) as Record<LifecycleFilter, number>;

  const filtered = items.filter(item => {
    if (filter !== "all" && item.state !== filter) return false;
    if (source !== "all" && item.source !== source) return false;
    const needle = query.trim().toLocaleLowerCase("pl");
    return !needle || [item.title, item.store, item.id].join(" ").toLocaleLowerCase("pl").includes(needle);
  }).sort((a, b) => {
    const order: Record<LifecycleStatus, number> = { expired: 0, expiring: 1, active: 2, draft: 3 };
    if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
    return (a.validUntil || "9999-12-31").localeCompare(b.validUntil || "9999-12-31");
  });

  async function apply(item: typeof items[number], action: "verify" | "extend") {
    if (busyId || !confirmed[item.key]) {
      setNotice({ error: true, text: "Najpierw potwierdź, że sprawdziłeś aktualność oferty." });
      return;
    }
    const newDate = selectedDates[item.key] || "";
    if (action === "extend") {
      const error = renewalError(item, newDate, today);
      if (error) { setNotice({ error: true, text: error }); return; }
    }
    const verb = action === "extend" ? "Przedłużyć datę?" : "Zapisać ponowną weryfikację?";
    if (!window.confirm(verb + "\nPotwierdzasz, że sprawdziłeś kod, link i warunki u sprzedawcy?")) return;
    setBusyId(item.key);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/offer-lifecycle", {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: item.source, id: item.id, action,
          newDate: action === "extend" ? newDate : null,
          expectedUpdatedAt: item.updatedAt, confirmed: true,
        }),
      });
      const result = await response.json() as { error?: string; notice?: string };
      if (!response.ok) { setNotice({ error: true, text: result.error || "Nie udało się zapisać." }); return; }
      setNotice({ error: false, text: result.notice || "Zapisano weryfikację." });
      setConfirmed(previous => ({ ...previous, [item.key]: false }));
      router.refresh();
    } catch {
      setNotice({ error: true, text: "Nie udało się nawiązać połączenia z serwerem." });
    } finally { setBusyId(null); }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.filter(tab => tab.key !== "all").map(tab => {
          const state = tab.key as LifecycleStatus;
          return (
            <button type="button" key={tab.key} onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={"rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-rose-300 " +
                (filter === tab.key ? "border-rose-500 ring-2 ring-rose-100" : "border-stone-200")}>
              <p className="text-xs font-black text-stone-600">{tab.title}</p>
              <p className={"mt-3 text-3xl font-black tabular-nums " + (state === "expired" ? "text-rose-700" : "text-stone-950")}>{counts[tab.key]}</p>
              <p className="mt-2 text-xs text-stone-500">
                {state === "expiring" ? "Kończą się w ciągu 3 dni" : state === "expired" ? "Data już minęła" :
                  state === "active" ? "Widoczne poza pilnym terminem" : "Niewidoczne publicznie"}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
        <strong>Weryfikacja jest obowiązkowa:</strong> przed przedłużeniem sprawdź ofertę u sprzedawcy.
        Przedłużenie <strong>nie włącza</strong> nieopublikowanych kodów — ich ponowne opublikowanie wymaga edytora.
        Przeterminowane oferty są automatycznie wyłączane przez harmonogram Supabase.
      </div>

      <section aria-labelledby="lifecycle-list-heading" className="mt-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lifecycle-list-heading" className="text-xl font-black">Przegląd terminów</h2>
          <span aria-live="polite" className="text-sm font-semibold text-stone-500">{filtered.length} z {items.length} wpisów</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Status promocji">
          {tabs.map(tab => (
            <button key={tab.key} type="button" aria-pressed={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={"min-h-10 rounded-full px-4 text-xs font-bold " +
                (filter === tab.key ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700 hover:bg-rose-50")}>
              {tab.title} ({counts[tab.key]})
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-black text-stone-700">Wyszukaj kod, tytuł lub sklep
            <input type="search" value={query} onChange={event => setQuery(event.target.value)}
              placeholder="SHEIN, Zalando, wyprzedaż…"
              className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 px-4 text-sm outline-none focus:border-rose-400" />
          </label>
          <label className="text-xs font-black text-stone-700">Źródło oferty
            <select value={source} onChange={event => setSource(event.target.value as typeof source)}
              className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm">
              <option value="all">Wszystkie sklepy</option>
              <option value="shein">Kampanie SHEIN</option>
              <option value="merchant">Pozostałe sklepy</option>
            </select>
          </label>
        </div>
        {notice && <p role="status" className={"mt-5 rounded-xl p-4 text-sm font-semibold " +
          (notice.error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-900")}>{notice.text}</p>}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-xl bg-stone-50 p-6 text-center text-sm text-stone-600">
              Brak promocji spełniających wybrane kryteria.
            </div>
          )}
          {filtered.map(item => {
            const pending = busyId === item.key;
            const extendAllowed = item.state === "expired" || item.state === "expiring";
            const days = item.validUntil ? daysUntil(item.validUntil, today) : null;
            const href = item.source === "shein" ? "/admin/promocje-shein" : "/admin/kody-rabatowe";
            return (
              <article key={item.key} className="rounded-2xl border border-stone-200 bg-[#fafafa] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wide text-rose-700">{item.store}</p>
                    <h3 className="mt-1 text-base font-black leading-6 text-stone-950">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-stone-600">
                      Ważna do: <strong>{prettyDate(item.validUntil)}</strong>
                      {days !== null && days >= 0 && days <= 3 && <> · {days === 0 ? "Ostatni dzień!" : "Pozostało dni: " + days}</>}
                      {item.verifiedAt && <> · Weryfikacja: {prettyDate(item.verifiedAt.slice(0, 10))}</>}
                    </p>
                  </div>
                  <span className={"shrink-0 rounded-lg px-3 py-2 text-xs font-black " + badgeStyle[item.state]}>
                    {copy[item.state]}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href={href} className="inline-flex min-h-10 items-center text-xs font-black text-rose-700 hover:underline">
                    Otwórz edytor →
                  </Link>
                  <span className="text-xs text-stone-500">
                    {item.published ? "Opublikowana" : "Nieopublikowana"}
                  </span>
                </div>
                <label className="mt-4 flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-bold leading-6 text-stone-800">
                  <input type="checkbox" checked={confirmed[item.key] || false}
                    onChange={event => setConfirmed(current => ({ ...current, [item.key]: event.target.checked }))}
                    disabled={pending} className="mt-1 h-4 w-4 shrink-0" />
                  Sprawdziłem dzisiaj kod, link, warunki i datę u sprzedawcy.
                </label>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  {extendAllowed && (
                    <label className="text-xs font-bold text-stone-700">
                      Przedłuż ważność do
                      <input type="date" value={selectedDates[item.key] || ""}
                        min={nextDay}
                        onChange={event => setSelectedDates(current => ({ ...current, [item.key]: event.target.value }))}
                        className="mt-1 block min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm" />
                    </label>
                  )}
                  <button type="button" onClick={() => void apply(item, "verify")}
                    disabled={Boolean(busyId) || !confirmed[item.key] || item.state === "expired"}
                    className="min-h-11 rounded-xl border border-stone-200 bg-white px-4 text-xs font-black text-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
                    Oznacz jako zweryfikowaną
                  </button>
                  {extendAllowed && (
                    <button type="button" onClick={() => void apply(item, "extend")}
                      disabled={Boolean(busyId) || !confirmed[item.key] || !selectedDates[item.key]}
                      className="min-h-11 rounded-xl bg-rose-600 px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                      Przedłuż po weryfikacji
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <p className="mt-5 text-xs leading-6 text-stone-500">
        Statusy liczymy według daty w Polsce. Ostatni dzień ważności jest wliczony;
        alert pojawia się w ciągu trzech dni do końca, bez zewnętrznych powiadomień e-mail.
      </p>
    </div>
  );
}
