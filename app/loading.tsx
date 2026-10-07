export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-6">
      <div
        role="status"
        className="text-center"
      >
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 text-2xl font-black text-white shadow-md motion-reduce:animate-none">
          T
        </div>

        <p className="mt-5 font-black text-stone-800">
          Chwileczkę…
        </p>

        <p className="mt-1 text-sm text-stone-500">
          Ładujemy zawartość
        </p>
      </div>
    </main>
  );
}