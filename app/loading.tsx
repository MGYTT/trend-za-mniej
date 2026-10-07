export default function Loading() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-6">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-rose-600 motion-reduce:animate-none" />
        </div>

        <p className="mt-5 font-black text-stone-900">
          Ładujemy zawartość
        </p>

        <p className="mt-1 text-sm leading-6 text-stone-500">
          To powinno potrwać tylko
          chwilę.
        </p>

        <span className="sr-only">
          Trwa ładowanie strony.
        </span>
      </div>
    </main>
  );
}