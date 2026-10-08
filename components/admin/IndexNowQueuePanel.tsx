"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  configured: boolean;

  pendingCount: number;

  failedCount: number;
};

type ProcessResponse = {
  success?: boolean;

  processed?: number;

  attempted?: number;

  pending?: number;

  status?: number;

  message?: string;

  error?: string;
};

export default function IndexNowQueuePanel({
  configured,
  pendingCount,
  failedCount,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    message,
    setMessage,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function processQueue() {
    setLoading(
      true
    );

    setMessage(
      null
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          "/api/admin/indexnow/process",
          {
            method:
              "POST",

            credentials:
              "same-origin",

            cache:
              "no-store",
          }
        );

      let data:
        ProcessResponse =
        {};

      try {
        data =
          await response.json() as
            ProcessResponse;
      } catch {
        // Obsłużymy poniżej.
      }

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.error ??
            data.message ??
            "Nie udało się wysłać zmian."
        );

        setLoading(
          false
        );

        router.refresh();

        return;
      }

      setMessage(
        data.processed &&
        data.processed >
          0
          ? `Przekazano ${data.processed} adresów do IndexNow.`
          : "Kolejka jest już aktualna."
      );

      setLoading(
        false
      );

      router.refresh();
    } catch {
      setError(
        "Nie udało się połączyć z mechanizmem synchronizacji."
      );

      setLoading(
        false
      );
    }
  }

  return (
    <section className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.13em] text-rose-600">
            IndexNow
          </p>

          <h2 className="mt-1 text-xl font-black text-stone-900">
            Kolejka zmian
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Nowe, zmienione i
            usunięte strony trafiają
            automatycznie do kolejki.
            Nie wpływa to na
            publikowanie ofert.
          </p>
        </div>

        <div
          className={[
            "w-fit rounded-full px-3 py-1.5 text-[10px] font-black",
            configured
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700",
          ].join(
            " "
          )}
        >
          {configured
            ? "✓ Aktywny"
            : "Wymaga konfiguracji"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-stone-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Oczekujące
          </p>

          <p className="mt-1 text-2xl font-black text-stone-900">
            {
              pendingCount
            }
          </p>
        </div>

        <div className="rounded-[16px] bg-stone-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Z błędem
          </p>

          <p
            className={[
              "mt-1 text-2xl font-black",
              failedCount >
              0
                ? "text-amber-700"
                : "text-stone-900",
            ].join(
              " "
            )}
          >
            {
              failedCount
            }
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-bold leading-5 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={
          processQueue
        }
        disabled={
          loading ||
          !configured
        }
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-black text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {loading
          ? "Synchronizacja..."
          : pendingCount >
              0
            ? `Wyślij oczekujące (${pendingCount})`
            : "Sprawdź synchronizację"}
      </button>

      {!configured && (
        <p className="mt-3 text-[10px] leading-5 text-stone-400 sm:text-xs">
          Lokalnie IndexNow jest
          celowo wyłączony. Do
          działania potrzebny jest
          publiczny adres HTTPS oraz
          zmienna INDEXNOW_KEY.
        </p>
      )}
    </section>
  );
}