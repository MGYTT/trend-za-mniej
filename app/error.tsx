"use client";

import {
  useEffect,
} from "react";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      "Błąd aplikacji:",
      error
    );
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-12 text-stone-900 sm:px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />

            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-rose-600">
          Coś poszło nie tak
        </p>

        <h1 className="mt-2 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl">
          Nie udało się wyświetlić
          tej strony
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-7 text-stone-500 sm:text-base">
          Spróbuj ponownie. Jeśli
          problem jest chwilowy,
          strona powinna za moment
          działać normalnie.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              reset()
            }
            className="min-h-12 rounded-xl bg-rose-600 px-6 font-black text-white shadow-sm transition hover:bg-rose-700"
          >
            Spróbuj ponownie
          </button>

          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-6 font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
          >
            Strona główna
          </Link>
        </div>

        <p className="mt-7 text-xs leading-5 text-stone-400">
          Jeżeli problem będzie się
          powtarzał, spróbuj ponownie
          później.
        </p>
      </div>
    </main>
  );
}