"use client";

import { useState } from "react";

export default function GuideChecklist({ items }: { items: readonly string[] }) {
  const [checked, setChecked] = useState<number[]>([]);
  const done = checked.length;
  const total = items.length;
  return (
    <div className="rounded-[25px] border border-rose-100 bg-white p-5 shadow-[0_10px_25px_rgba(130,30,58,0.035)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-rose-700">Twoja lista</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-stone-950">Przed zakupem sprawdź</h2>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black tabular-nums text-rose-700">
          {done}/{total}
        </span>
      </div>
      <div role="progressbar" aria-label="Postęp checklisty" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-100">
        <div className="h-full rounded-full bg-rose-600 transition-[width] duration-200"
          style={{ width: total ? done / total * 100 + "%" : "0%" }} />
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <label key={index} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm leading-6 text-stone-700 hover:bg-rose-50">
            <input type="checkbox" checked={checked.includes(index)}
              onChange={(event) => setChecked((current) =>
                event.target.checked ? [...current, index] : current.filter((id) => id !== index))}
              className="mt-1.5 h-5 w-5 shrink-0 accent-rose-600" />
            <span className={checked.includes(index) ? "text-stone-400 line-through" : ""}>{item}</span>
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <p role="status" aria-live="polite" className="text-xs font-semibold text-stone-600">
          {done === total ? "Gotowe! Wiesz, co sprawdzić przed zakupem." : `Pozostało ${total - done} punktów do sprawdzenia.`}
        </p>
        {done > 0 && (
          <button type="button" onClick={() => setChecked([])}
            className="min-h-11 rounded-xl px-3 text-xs font-black text-rose-700 hover:bg-rose-50">
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}
