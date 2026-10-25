"use client";

import { useState } from "react";

function toNumber(text: string) {
  const normalized = text.trim().replace(",", ".");
  if (!normalized) return 0;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : NaN;
}
const PLN = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });

export default function GuideBudgetPlanner({ limit }: { limit: 100 | 150 }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [delivery, setDelivery] = useState("");
  const entered = Boolean(first.trim() || second.trim() || delivery.trim());
  const values = [first, second, delivery].map(toNumber);
  const valid = values.every(Number.isFinite);
  const sum = values.reduce((a, b) => a + b, 0);
  const remaining = limit - sum;
  return (
    <section aria-labelledby="guide-budget-title"
      className="rounded-[26px] border border-rose-100 bg-gradient-to-br from-white to-[#fff3f5] p-5 sm:p-7">
      <p className="text-[11px] font-black uppercase tracking-widest text-rose-700">Wypróbuj od razu</p>
      <h2 id="guide-budget-title" className="mt-2 text-xl font-black tracking-tight">
        Zmieszczę się w {limit} zł?
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Wpisz ceny wybranych wariantów ze sklepu i ewentualną dostawę. To Twój prosty kalkulator,
        nie są to automatycznie pobrane ani zweryfikowane ceny SHEIN.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Pierwszy produkt", value: first, set: setFirst },
          { label: "Drugi produkt", value: second, set: setSecond },
          { label: "Dostawa", value: delivery, set: setDelivery },
        ].map((field) => (
          <label key={field.label} className="block text-xs font-bold text-stone-700">
            {field.label} (zł)
            <input type="text" inputMode="decimal" value={field.value}
              onChange={(event) => field.set(event.target.value.slice(0, 12))}
              placeholder="0,00" aria-label={field.label + " w złotych"}
              className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base font-semibold text-stone-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
          </label>
        ))}
      </div>
      <div role="status" aria-live="polite" className="mt-5 rounded-2xl bg-white p-4">
        {!entered ? (
          <p className="text-sm font-bold text-stone-600">Wpisz choć jedną kwotę, aby zobaczyć wynik.</p>
        ) : !valid ? (
          <p className="text-sm font-bold text-rose-700">Wpisz prawidłowe, nieujemne kwoty.</p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500">Łączny koszt</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-stone-950">{PLN.format(sum)}</p>
            </div>
            <p className={`rounded-xl px-4 py-3 text-sm font-black ${remaining >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
              {remaining >= 0 ? `W budżecie · zostaje ${PLN.format(remaining)}` : `Ponad limit o ${PLN.format(-remaining)}`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
