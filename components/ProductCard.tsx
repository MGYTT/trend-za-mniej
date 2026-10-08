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
    <article className="group flex h-full overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz szczegóły produktu: ${product.shortName}`}
        className="flex h-full w-full flex-col"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-rose-700 shadow-sm backdrop-blur sm:text-[11px]">
              🔥 Gorąca okazja
            </span>
          )}

          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/95 text-stone-700 opacity-0 shadow-sm backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
            →
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <span className="truncate text-[10px] font-black uppercase tracking-[0.09em] text-rose-600 sm:text-[11px]">
              {product.category}
            </span>

            {product.sold && (
              <span className="shrink-0 text-[10px] font-semibold text-stone-400">
                {product.sold}
              </span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:text-lg">
            {product.shortName}
          </h3>

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xl font-black tracking-[-0.03em] text-stone-900 sm:text-2xl">
                {formatPrice(
                  product.price
                )}
              </span>

              {product.oldPrice !==
                null && (
                <span className="text-xs font-semibold text-stone-400 line-through">
                  {formatPrice(
                    product.oldPrice
                  )}
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] leading-5 text-stone-400">
              Cena zapisana przy
              publikacji
            </p>

            <div className="mt-3 border-t border-stone-100 pt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-rose-600 transition group-hover:text-rose-700">
                    Sprawdź szczegóły
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-stone-400">
                    Cena, opis
                    i przejście do
                    SHEIN
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-600 transition group-hover:bg-rose-100 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}