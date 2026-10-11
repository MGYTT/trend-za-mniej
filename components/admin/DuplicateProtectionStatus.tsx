"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Summary = {
  total: number;
  withIdentity: number;
  withoutIdentity: number;
  conflicts: number;
};

type BackfillSummary = {
  pending: number;
  resolved: number;
  unresolved: number;
  conflict: number;
};

type BackfillResponse = {
  done?: boolean;

  scope?:
    | "catalog"
    | "own";

  processed?: {
    id?: string;
    name?: string;

    result?:
      | "resolved"
      | "unresolved"
      | "conflict";

    identity?: string | null;
    duplicateOf?: string | null;
  };

  summary?:
    BackfillSummary;

  error?: string;
};

type Props = {
  initialSummary:
    Summary;
};

const MAX_SCAN_STEPS =
  250;

export default function DuplicateProtectionStatus({
  initialSummary,
}: Props) {
  const router =
    useRouter();

  const [
    scanning,
    setScanning,
  ] =
    useState(
      false
    );

  const [
    processed,
    setProcessed,
  ] =
    useState(
      0
    );

  const [
    scanMessage,
    setScanMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    scanError,
    setScanError,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const coverage =
    initialSummary.total ===
    0
      ? 100
      : Math.round(
          (
            initialSummary.withIdentity /
            initialSummary.total
          ) *
            100
        );

  async function scanOffers() {
    if (
      scanning
    ) {
      return;
    }

    setScanning(
      true
    );

    setProcessed(
      0
    );

    setScanError(
      null
    );

    setScanMessage(
      "Rozpoczynam analizę zapisanych linków SHEIN…"
    );

    let retryUnresolved =
      true;

    let processedCount =
      0;

    let finalSummary:
      BackfillSummary |
      null =
      null;

    let scope:
      | "catalog"
      | "own"
      | null =
      null;

    try {
      for (
        let step = 0;
        step <
          MAX_SCAN_STEPS;
        step += 1
      ) {
        const response =
          await fetch(
            "/api/admin/shein-product/backfill",
            {
              method:
                "POST",

              credentials:
                "same-origin",

              cache:
                "no-store",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  retryUnresolved,
                }),
            }
          );

        retryUnresolved =
          false;

        const payload =
          await response.json() as
            BackfillResponse;

        if (
          !response.ok
        ) {
          throw new Error(
            payload.error ||
              "Nie udało się przeskanować ofert."
          );
        }

        if (
          payload.scope
        ) {
          scope =
            payload.scope;
        }

        if (
          payload.summary
        ) {
          finalSummary =
            payload.summary;
        }

        if (
          payload.processed
        ) {
          processedCount +=
            1;

          setProcessed(
            processedCount
          );

          const name =
            payload.processed
              .name
              ?.trim() ||
            "produkt";

          if (
            payload.processed
              .result ===
            "conflict"
          ) {
            setScanMessage(
              `Możliwy duplikat: ${name}. System oznaczył ofertę do sprawdzenia.`
            );
          } else if (
            payload.processed
              .result ===
            "resolved"
          ) {
            setScanMessage(
              `Rozpoznano produkt SHEIN: ${name}.`
            );
          } else {
            setScanMessage(
              `Sprawdzono: ${name}. Nie udało się ustalić stałego ID.`
            );
          }
        }

        if (
          payload.done
        ) {
          break;
        }

        await new Promise<void>(
          (
            resolve
          ) =>
            window.setTimeout(
              resolve,
              100
            )
        );
      }

      const prefix =
        scope ===
        "own"
          ? "Twoje oferty zostały sprawdzone."
          : "Katalog został sprawdzony.";

      const conflicts =
        finalSummary
          ?.conflict ??
        0;

      const unresolved =
        finalSummary
          ?.unresolved ??
        0;

      setScanMessage(
        `${prefix} Przetworzono ${processedCount} ofert. ${conflicts} oznaczono jako możliwe konflikty, ${unresolved} pozostało bez rozpoznanego ID.`
      );

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "Błąd skanowania duplikatów:",
        error
      );

      setScanError(
        error instanceof
          Error
          ? error.message
          : "Nie udało się przeskanować ofert."
      );
    } finally {
      setScanning(
        false
      );
    }
  }

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
                Kontrola możliwych duplikatów
              </p>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                Informacyjna
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
              System porównuje stałe ID produktu SHEIN, różne OneLinki, nazwę, kategorię i cenę. Wynik pomaga administratorowi podjąć decyzję, ale nie blokuje dodania ani edycji oferty.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void scanOffers()
          }
          disabled={
            scanning
          }
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 text-xs font-black text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-55"
        >
          {scanning ? (
            <>
              <Spinner />

              Sprawdzam {processed}
            </>
          ) : (
            <>
              <RefreshIcon />

              Przeskanuj oferty
            </>
          )}
        </button>
      </div>

      <div className="grid border-t border-stone-100 sm:grid-cols-4">
        <Metric
          value={
            initialSummary.total
          }
          label="Wszystkie"
        />

        <Metric
          value={
            initialSummary.withIdentity
          }
          label="Ze stałym ID"
          helper={`${coverage}% katalogu`}
        />

        <Metric
          value={
            initialSummary.withoutIdentity
          }
          label="Bez ID"
          warning={
            initialSummary.withoutIdentity >
            0
          }
        />

        <Metric
          value={
            initialSummary.conflicts
          }
          label="Do sprawdzenia"
          warning={
            initialSummary.conflicts >
            0
          }
        />
      </div>

      <div className="border-t border-stone-100 bg-stone-50/70 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          <RuleCard
            title="Ten sam produkt SHEIN"
            text="Zgodne goods ID lub SKU daje bardzo mocne ostrzeżenie, nawet jeśli administratorzy używają innych linków afiliacyjnych."
          />

          <RuleCard
            title="Różne OneLinki"
            text="Sam inny adres afiliacyjny nie oznacza innego produktu. System próbuje rozpoznać produkt znajdujący się za linkiem."
          />

          <RuleCard
            title="Podobna oferta"
            text="Nazwa, kategoria i zbliżona cena zwiększają poziom podejrzenia, ale nie są podstawą do automatycznej blokady."
          />
        </div>

        {(scanMessage ||
          scanError) && (
          <div
            className={[
              "mt-4 rounded-xl border px-3 py-2.5",
              scanError
                ? "border-red-200 bg-red-50"
                : "border-stone-200 bg-white",
            ].join(" ")}
          >
            <p
              className={[
                "text-[10px] leading-5 sm:text-xs",
                scanError
                  ? "font-semibold text-red-700"
                  : "text-stone-500",
              ].join(" ")}
            >
              {scanError ||
                scanMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({
  value,
  label,
  helper,
  warning = false,
}: {
  value:
    number;

  label:
    string;

  helper?:
    string;

  warning?:
    boolean;
}) {
  return (
    <div className="border-b border-stone-100 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p
        className={[
          "text-xl font-black tracking-[-0.04em]",
          warning
            ? "text-amber-700"
            : "text-stone-900",
        ].join(" ")}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.07em] text-stone-400">
        {label}
      </p>

      {helper && (
        <p className="mt-1 text-[9px] text-stone-400">
          {helper}
        </p>
      )}
    </div>
  );
}

function RuleCard({
  title,
  text,
}: {
  title:
    string;

  text:
    string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-[10px] font-black text-stone-800">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-stone-500 sm:text-[10px]">
        {text}
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

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.5 9A7 7 0 0 0 6.2 6.2L4 8" />
      <path d="M5.5 15A7 7 0 0 0 17.8 17.8L20 16" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-r-white"
    />
  );
}