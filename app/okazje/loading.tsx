import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function OffersLoading() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="border-b border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="max-w-2xl">
            <div className="h-4 w-32 animate-pulse rounded bg-rose-100 motion-reduce:animate-none" />

            <div className="mt-4 h-11 w-72 max-w-full animate-pulse rounded-xl bg-stone-200 motion-reduce:animate-none" />

            <div className="mt-4 h-5 w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="h-6 w-44 animate-pulse rounded bg-stone-200 motion-reduce:animate-none" />

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="h-12 animate-pulse rounded-2xl bg-stone-100 motion-reduce:animate-none" />

            <div className="h-12 w-full animate-pulse rounded-2xl bg-rose-100 motion-reduce:animate-none sm:w-28" />
          </div>
        </div>

        <div className="mt-9">
          <div className="h-8 w-60 animate-pulse rounded-lg bg-stone-200 motion-reduce:animate-none" />

          <div
            role="status"
            aria-label="Ładowanie ofert"
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <ProductCardSkeleton
                key={index}
              />
            ))}

            <span className="sr-only">
              Ładowanie ofert…
            </span>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}