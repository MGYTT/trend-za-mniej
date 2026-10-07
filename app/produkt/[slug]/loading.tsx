import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="mb-6 h-5 w-64 max-w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

        <div
          role="status"
          aria-label="Ładowanie produktu"
          className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-12"
        >
          <section>
            <div className="aspect-[4/5] max-h-[760px] animate-pulse rounded-[30px] border border-stone-200 bg-stone-200 motion-reduce:animate-none sm:rounded-[36px]" />

            <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />
          </section>

          <section>
            <div className="flex gap-2">
              <div className="h-9 w-24 animate-pulse rounded-full bg-rose-100 motion-reduce:animate-none" />

              <div className="h-9 w-32 animate-pulse rounded-full bg-orange-100 motion-reduce:animate-none" />
            </div>

            <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-stone-200 motion-reduce:animate-none" />

            <div className="mt-3 h-10 w-4/5 animate-pulse rounded-xl bg-stone-200 motion-reduce:animate-none" />

            <div className="mt-6 h-5 w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

            <div className="mt-2 h-5 w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

            <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

            <div className="mt-8 rounded-[28px] border border-rose-100 bg-white p-6">
              <div className="h-4 w-40 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

              <div className="mt-4 h-12 w-48 animate-pulse rounded-xl bg-rose-100 motion-reduce:animate-none" />

              <div className="mt-6 h-14 animate-pulse rounded-2xl bg-rose-200 motion-reduce:animate-none" />
            </div>

            <div className="mt-5 h-32 animate-pulse rounded-3xl bg-amber-50 motion-reduce:animate-none" />

            <span className="sr-only">
              Ładowanie produktu…
            </span>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}