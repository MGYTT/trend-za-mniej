import Link from "next/link";

import {
  type Product,
  formatPrice,
} from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="group interactive-lift flex h-full overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-sm">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz produkt: ${product.shortName}`}
        className="flex h-full w-full flex-col"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={
              product.image
            }
            alt={
              product.name
            }
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[11px] font-black text-rose-700 shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:text-xs">
              🔥 Gorąca okazja
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 sm:text-xs">
              {
                product.category
              }
            </span>

            {product.sold && (
              <span className="text-[11px] font-medium text-stone-400 sm:text-xs">
                {
                  product.sold
                }
              </span>
            )}
          </div>

          <h3 className="mt-3 text-pretty text-lg font-black leading-snug tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:text-xl">
            {
              product.shortName
            }
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
            {
              product.description
            }
          </p>

          <div className="mt-auto pt-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-black tracking-[-0.03em] text-rose-600">
                {formatPrice(
                  product.price
                )}
              </span>

              {product.oldPrice !==
                null && (
                <span className="text-sm font-semibold text-stone-400 line-through">
                  {formatPrice(
                    product.oldPrice
                  )}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] leading-5 text-stone-400">
              Cena w chwili
              publikacji
            </p>

            <div className="mt-4 flex min-h-12 items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 font-black text-rose-700 transition group-hover:bg-rose-100">
              <span>
                Zobacz szczegóły
              </span>

              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm transition group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}