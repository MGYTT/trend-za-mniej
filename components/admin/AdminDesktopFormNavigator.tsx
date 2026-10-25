import type { ReactNode } from "react";

type Step = {
  id: string;
  title: string;
  complete: boolean;
};

type Props = {
  mode: "create" | "edit";
  steps: readonly Step[];
  formId: string;
  busy: boolean;
  disabled: boolean;
  actionLabel: string;
  busyLabel: string;
  note?: ReactNode;
};

/** Desktop-only guide. The actual forms and their validation remain the source of truth. */
export default function AdminDesktopFormNavigator({
  mode, steps, formId, busy, disabled, actionLabel, busyLabel, note,
}: Props) {
  const count = steps.filter((step) => step.complete).length;
  const create = mode === "create";
  const percent = Math.round((count / steps.length) * 100);
  return (
    <section aria-labelledby="admin-desktop-editor-guide"
      className="hidden overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_10px_30px_rgba(136,19,55,0.06)] xl:block">
      <div className="border-b border-rose-100 bg-gradient-to-br from-rose-50 to-white px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-rose-700">
              {create ? "Nowy produkt" : "Edycja produktu"}
            </p>
            <h2 id="admin-desktop-editor-guide" className="mt-1 text-lg font-black tracking-tight text-stone-950">
              {create ? "Gotowość oferty" : "Twoje zmiany"}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-black text-rose-700 shadow-sm">
            {count} / {steps.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-stone-600">
          {create
            ? "Uzupełnij sekcje, sprawdź podgląd i potwierdź publikację."
            : count === 0
              ? "Nie wprowadzono jeszcze zmian w formularzu."
              : "Sprawdź zmienione sekcje i zapisz aktualizację."}
        </p>
        {create && (
          <div role="progressbar" aria-label="Kompletność pól oferty"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-rose-600 transition-[width] duration-200" style={{ width: percent + "%" }} />
          </div>
        )}
      </div>
      <nav aria-label="Przejdź do sekcji formularza" className="grid gap-0.5 px-3 py-3">
        {steps.map((step, index) => (
          <a key={step.id} href={"#" + step.id}
            className="group flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm font-bold text-stone-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500">
            <span aria-hidden="true" className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
              step.complete
                ? create ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                : "bg-stone-100 text-stone-500"].join(" ")}>
              {step.complete ? (create ? "✓" : "●") : index + 1}
            </span>
            <span className="min-w-0 flex-1">{step.title}</span>
            <span className="text-xs text-stone-400 transition group-hover:text-rose-600" aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      <div className="border-t border-stone-100 px-4 pb-4 pt-3">
        <button type="submit" form={formId} disabled={busy || disabled}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-rose-600 px-4 text-sm font-black text-white shadow-[0_8px_22px_rgba(225,29,72,0.14)] transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none">
          {busy ? busyLabel : actionLabel}
        </button>
        <p className="mt-2 text-center text-[11px] leading-5 text-stone-500">
          {note ?? (create ? "Przed publikacją formularz sprawdzi wymagane pola i duplikaty." : "Zmiany zapisują się po potwierdzeniu akcji.")}
        </p>
      </div>
    </section>
  );
}
