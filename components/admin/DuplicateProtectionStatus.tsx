"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Summary = {
  pending: number;
  resolved: number;
  unresolved: number;
  conflict: number;
};

type Props = {
  initialSummary:
    Summary;
};

type BackfillResponse = {
  done?: boolean;

  summary?: Summary;

  error?: string;
};

export default function DuplicateProtectionStatus({
  initialSummary,
}: Props) {
  const router =
    useRouter();

  const [
    summary,
    setSummary,
  ] =
    useState<Summary>(
      initialSummary
    );

  const [
    running,
    setRunning,
  ] = useState(
    initialSummary.pending >
      0
  );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    runVersion,
    setRunVersion,
  ] = useState(0);

  useEffect(() => {
    if (
      initialSummary.pending <=
        0 &&
      runVersion === 0
    ) {
      setRunning(
        false
      );

      return;
    }

    let cancelled =
      false;

    async function run() {
      setRunning(
        true
      );

      setError(
        null
      );

      let attempts = 0;

      while (
        !cancelled &&
        attempts <
          100
      ) {
        attempts += 1;

        let response:
          Response;

        try {
          response =
            await fetch(
              "/api/admin/shein-product/backfill",
              {
                method:
                  "POST",

                credentials:
                  "same-origin",

                cache:
                  "no-store",
              }
            );
        } catch {
          if (
            !cancelled
          ) {
            setError(
              "Nie udało się połączyć z mechanizmem ochrony duplikatów."
            );

            setRunning(
              false
            );
          }

          return;
        }

        let data:
          BackfillResponse =
          {};

        try {
          data =
            await response.json() as
              BackfillResponse;
        } catch {
          // Obsłużymy niżej.
        }

        if (
          !response.ok
        ) {
          if (
            !cancelled
          ) {
            setError(
              data.error ??
                "Nie udało się uzupełnić ochrony starszych ofert."
            );

            setRunning(
              false
            );
          }

          return;
        }

        if (
          data.summary &&
          !cancelled
        ) {
          setSummary(
            data.summary
          );
        }

        if (
          data.done ||
          (
            data.summary &&
            data.summary
              .pending === 0
          )
        ) {
          if (
            !cancelled
          ) {
            setRunning(
              false
            );

            router.refresh();
          }

          return;
        }

        await new Promise(
          (
            resolve
          ) => {
            window.setTimeout(
              resolve,
              250
            );
          }
        );
      }

      if (
        !cancelled
      ) {
        setRunning(
          false
        );
      }
    }

    run();

    return () => {
      cancelled =
        true;
    };
  }, [
    initialSummary.pending,
    router,
    runVersion,
  ]);

  const total =
    summary.pending +
    summary.resolved +
    summary.unresolved +
    summary.conflict;

  const checked =
    total -
    summary.pending;

  const percent =
    total === 0
      ? 100
      : Math.round(
          (
            checked /
            total
          ) *
            100
        );

  if (
    running ||
    summary.pending >
      0
  ) {
    return (
      <section className="mt-4 rounded-[20px] border border-blue-100 bg-blue-50/70 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            🛡️
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-blue-950">
                  Zabezpieczamy
                  starsze oferty
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  System
                  automatycznie
                  rozpoznaje produkty
                  SHEIN. Możesz
                  normalnie korzystać
                  z panelu.
                </p>
              </div>

              <span className="shrink-0 text-sm font-black text-blue-700">
                {percent}%
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width:
                    `${percent}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[10px] font-semibold text-blue-600">
              Pozostało:{" "}
              {
                summary.pending
              }{" "}
              • Zabezpieczono:{" "}
              {
                summary.resolved
              }
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            ⚠
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-amber-900">
              Ochrona katalogu
              wymaga ponownej próby
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setError(
                  null
                );

                setRunVersion(
                  (
                    current
                  ) =>
                    current +
                    1
                );
              }}
              className="mt-3 min-h-9 rounded-xl bg-white px-3 text-xs font-black text-amber-800 shadow-sm"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (
    summary.conflict >
    0
  ) {
    return (
      <section className="mt-4 rounded-[20px] border border-red-200 bg-red-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            🛡️
          </span>

          <div>
            <p className="text-sm font-black text-red-900">
              Ochrona duplikatów
              działa
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              W starym katalogu
              wykryto{" "}
              {
                summary.conflict
              }{" "}
              {summary.conflict ===
              1
                ? "pewny konflikt produktu."
                : "pewnych konfliktów produktów."}{" "}
              System nie usuwa ich
              automatycznie, aby nie
              podmienić czyjegoś
              linku afiliacyjnego.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    summary.unresolved >
    0
  ) {
    return (
      <section className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            ✓
          </span>

          <div>
            <p className="text-sm font-black text-amber-900">
              Ochrona duplikatów
              jest aktywna
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              {
                summary.resolved
              }{" "}
              starszych ofert ma
              już stały
              identyfikator SHEIN.
              Dla{" "}
              {
                summary.unresolved
              }{" "}
              nie udało się go
              jednoznacznie
              rozpoznać, więc są
              nadal kontrolowane po
              linku i podobieństwie.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-[20px] border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-black text-green-700 shadow-sm">
          ✓
        </span>

        <div>
          <p className="text-sm font-black text-green-900">
            Ochrona duplikatów
            aktywna
          </p>

          <p className="mt-1 text-xs leading-5 text-green-700">
            Katalog został
            sprawdzony. Nowe oferty
            są automatycznie
            kontrolowane przed
            publikacją.
          </p>
        </div>
      </div>
    </section>
  );
}