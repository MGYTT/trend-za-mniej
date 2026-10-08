type Summary = {
  total: number;
  withIdentity: number;
  withoutIdentity: number;
  conflicts: number;
};

type Props = {
  initialSummary:
    Summary;
};

export default function DuplicateProtectionStatus({
  initialSummary,
}: Props) {
  const {
    total,
    withIdentity,
    withoutIdentity,
    conflicts,
  } =
    initialSummary;

  const identityPercent =
    total ===
    0
      ? 100
      : Math.round(
          (
            withIdentity /
            total
          ) *
            100
        );

  return (
    <section className="mt-4 overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldIcon />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-stone-900">
                Ochrona duplikatów
              </p>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                Aktywna
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
              Nowe produkty są
              sprawdzane przed
              publikacją po linku,
              identyfikatorze produktu
              i podobieństwie do ofert,
              które już znajdują się
              w katalogu.
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-stone-50 px-3 py-2 text-right">
          <p className="text-lg font-black text-stone-900">
            {total}
          </p>

          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-stone-400">
            ofert
          </p>
        </div>
      </div>

      <div className="grid border-t border-stone-100 sm:grid-cols-3">
        <ProtectionItem
          status="block"
          title="Identyczny link"
          description="Ta sama wartość linku afiliacyjnego blokuje ponowną publikację produktu."
        />

        <ProtectionItem
          status="block"
          title="ID produktu lub SKU"
          description="Jeśli identyfikator znajduje się w danych produktu, jest porównywany z istniejącymi ofertami."
        />

        <ProtectionItem
          status="warning"
          title="Podobna oferta"
          description="Podobna nazwa lub kategoria wyświetla ostrzeżenie, ale sama nie blokuje publikacji."
        />
      </div>

      <div className="border-t border-stone-100 bg-stone-50/70 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatusStat
            value={
              withIdentity
            }
            label="Ze stałym ID"
            description={`${identityPercent}% katalogu`}
          />

          <StatusStat
            value={
              withoutIdentity
            }
            label="Bez stałego ID"
            description="Chronione linkiem i podobieństwem"
          />

          <StatusStat
            value={
              conflicts
            }
            label="Konflikty"
            description={
              conflicts >
              0
                ? "Wymagają ręcznej kontroli"
                : "Brak wykrytych konfliktów"
            }
            warning={
              conflicts >
              0
            }
          />
        </div>

        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-stone-400">
              <InfoIcon />
            </span>

            <p className="text-[10px] leading-5 text-stone-500 sm:text-xs">
              Brak stałego ID nie
              oznacza braku ochrony.
              Taka oferta nadal jest
              sprawdzana po dokładnym
              linku afiliacyjnym oraz
              podobieństwie do
              istniejących produktów.
              Identyfikatory są
              zapisywane tylko wtedy,
              gdy można je odczytać
              z danych podanych przez
              administratora.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProtectionItem({
  status,
  title,
  description,
}: {
  status:
    | "block"
    | "warning";

  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-stone-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-2">
        <span
          className={[
            "flex h-7 w-7 items-center justify-center rounded-lg",
            status ===
            "block"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          ].join(
            " "
          )}
        >
          {status ===
          "block" ? (
            <CheckIcon />
          ) : (
            <WarningIcon />
          )}
        </span>

        <p className="text-xs font-black text-stone-800">
          {title}
        </p>
      </div>

      <p className="mt-2 text-[10px] leading-5 text-stone-500 sm:text-xs">
        {description}
      </p>
    </div>
  );
}

function StatusStat({
  value,
  label,
  description,
  warning = false,
}: {
  value: number;
  label: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-stone-400">
            {label}
          </p>

          <p
            className={[
              "mt-1 text-2xl font-black tracking-[-0.04em]",
              warning
                ? "text-amber-700"
                : "text-stone-900",
            ].join(
              " "
            )}
          >
            {value}
          </p>
        </div>

        {warning &&
          value >
            0 && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <WarningIcon />
            </span>
          )}
      </div>

      <p className="mt-1 text-[9px] leading-4 text-stone-400 sm:text-[10px]">
        {description}
      </p>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 2.5 20h19Z" />

      <path d="M12 9v4" />

      <path d="M12 17h.01" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
    </svg>
  );
}