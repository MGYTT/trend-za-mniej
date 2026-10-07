export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-sm"
    >
      <div className="aspect-[4/5] animate-pulse bg-stone-200 motion-reduce:animate-none" />

      <div className="p-4 sm:p-5">
        <div className="h-7 w-24 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />

        <div className="mt-4 h-6 w-4/5 animate-pulse rounded-lg bg-stone-200 motion-reduce:animate-none" />

        <div className="mt-2 h-4 w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />

        <div className="mt-6 h-8 w-32 animate-pulse rounded-lg bg-rose-100 motion-reduce:animate-none" />

        <div className="mt-5 h-12 animate-pulse rounded-2xl bg-rose-50 motion-reduce:animate-none" />
      </div>
    </div>
  );
}