
import Link from "next/link";

import ProductPhoto from "@/components/ProductPhoto";

import {
  formatPrice,
  type Product,
} from "@/lib/products";

type ProductCardProps = {
  product: Product;
  compactOnMobile?: boolean;
};

export default function ProductCard({
  product,
  compactOnMobile = false,
}: ProductCardProps) {
  const name =
    product.shortName?.trim() ||
    product.name?.trim() ||
    "Produkt";

  const category =
    product.category?.trim() ||
    "Znalezisko";

  const soldText = product.sold?.trim();

  const validOldPrice =
    product.oldPrice !== null &&
    Number.isFinite(product.oldPrice) &&
    Number.isFinite(product.price) &&
    product.oldPrice > 0 &&
    product.price >= 0 &&
    product.oldPrice > product.price;

  const percent =
    validOldPrice &&
    product.oldPrice !== null
      ? Math.round(
          (
            1 -
            product.price / product.oldPrice
          ) * 100
        )
      : 0;

  return (
    <article
      className={`group flex h-full min-w-0 overflow-hidden border border-stone-200 bg-white shadow-[0_4px_18px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md focus-within:ring-2 focus-within:ring-rose-200 motion-reduce:transform-none ${
        compactOnMobile
          ? "rounded-[16px] sm:rounded-[24px]"
          : "rounded-[24px]"
      }`}
    >
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz szczegóły produktu: ${name}`}
        className="flex h-full w-full min-w-0 flex-col focus-visible:outline-none"
      >
        {/* ZOPTYMALIZOWANE ZDJĘCIE */}

        <div
          className={`relative w-full overflow-hidden bg-[#F6F4F2] ${
            compactOnMobile
              ? "aspect-square md:aspect-[4/5]"
              : "aspect-[4/5]"
          }`}
        >
          <ProductPhoto
            src={product.image}
            alt={product.name || name}
            sizes={
              compactOnMobile
                ? "(max-width: 767px) 47vw, (max-width: 1279px) 31vw, 24vw"
                : "(max-width: 419px) 94vw, (max-width: 767px) 48vw, (max-width: 1279px) 31vw, 24vw"
            }
            className="transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"
          />

          {/* OZNACZENIA */}

          {(product.featured ||
            (percent >= 1 &&
              percent <= 99)) && (
            <div className="absolute left-2 top-2 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
              {product.featured && (
                <span className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-rose-700 shadow-sm sm:px-3 sm:py-1.5 sm:text-xs">
                  Wybrane
                </span>
              )}

              {percent >= 1 &&
                percent <= 99 && (
                  <span className="rounded-full bg-rose-600 px-2 py-1 text-[10px] font-black text-white sm:px-3 sm:py-1.5 sm:text-xs">
                    −{percent}%
                  </span>
                )}
            </div>
          )}
        </div>

        {/* TREŚĆ */}

        <div
          className={`flex min-w-0 flex-1 flex-col ${
            compactOnMobile
              ? "p-2.5 sm:p-4"
              : "p-3.5 sm:p-4"
          }`}
        >
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.06em] text-rose-700 sm:text-xs">
            {category}
          </p>

          <h3
            className={`mt-1.5 line-clamp-2 min-h-[2.55em] font-extrabold leading-[1.3] tracking-[-0.02em] text-stone-900 group-hover:text-rose-700 ${
              compactOnMobile
                ? "text-[13px] sm:text-base"
                : "text-[15px] sm:text-base"
            }`}
          >
            {name}
          </h3>

          {soldText && (
            <p
              className={`mt-1 truncate text-xs text-stone-500 ${
                compactOnMobile
                  ? "hidden sm:block"
                  : "block"
              }`}
            >
              {soldText}
            </p>
          )}

          {/* CENA */}

          <div className="mt-auto pt-3 sm:pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong
                className={`font-black leading-tight tracking-[-0.04em] text-stone-950 ${
                  compactOnMobile
                    ? "text-[18px] sm:text-2xl"
                    : "text-xl sm:text-2xl"
                }`}
              >
                {formatPrice(product.price)}
              </strong>

              {validOldPrice &&
                product.oldPrice !== null && (
                  <span className="text-[10px] font-semibold text-stone-500 line-through sm:text-xs">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </span>
                )}
            </div>

            <p
              className={`mt-1 text-xs leading-5 text-stone-500 ${
                compactOnMobile
                  ? "hidden sm:block"
                  : "block"
              }`}
            >
              Cena zapisana przy publikacji
            </p>

            {/* PRZYCISK */}

            <span className="mt-3 flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-2 text-xs font-extrabold text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white sm:mt-4 sm:min-h-11 sm:text-sm">
              {compactOnMobile ? (
                <>
                  <span className="sm:hidden">
                    Zobacz
                  </span>

                  <span className="hidden sm:inline">
                    Zobacz szczegóły
                  </span>
                </>
              ) : (
                "Zobacz szczegóły"
              )}

              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
