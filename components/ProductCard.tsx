
import Link from "next/link";

import {
  formatPrice,
  type Product,
} from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const name =
    product.shortName?.trim() ||
    product.name?.trim() ||
    "Produkt";

  const category =
    product.category?.trim() ||
    "Znalezisko";

  const imageUrl =
    product.image?.trim();

  const soldText =
    product.sold?.trim();

  // Porównanie cen pokazujemy wyłącznie,
  // gdy obie wartości są poprawne.
  const hasPreviousPrice =
    product.oldPrice !== null &&
    Number.isFinite(product.oldPrice) &&
    Number.isFinite(product.price) &&
    product.oldPrice > 0 &&
    product.price >= 0 &&
    product.oldPrice > product.price;

  // Różnica wynika z cen zapisanych w katalogu.
  // Nie oznacza gwarantowanej aktualnej promocji.
  const priceDifference =
    hasPreviousPrice &&
    product.oldPrice !== null
      ? Math.round(
          (1 -
            product.price /
              product.oldPrice) *
            100
        )
      : null;

  const showDifference =
    priceDifference !== null &&
    priceDifference >= 1 &&
    priceDifference <= 99;

  return (
    <article
      className="
        group flex h-full min-w-0 overflow-hidden
        rounded-[24px] border border-stone-200
        bg-white
        shadow-[0_6px_24px_rgba(28,25,23,0.05)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-rose-200
        hover:shadow-[0_16px_36px_rgba(28,25,23,0.1)]
        focus-within:border-rose-300
        focus-within:ring-2
        focus-within:ring-rose-100
        motion-reduce:transform-none
        motion-reduce:transition-none
      "
    >
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz szczegóły produktu: ${name}`}
        className="
          flex h-full w-full min-w-0 flex-col
          focus-visible:outline-none
        "
      >
        {/* ZDJĘCIE PRODUKTU */}
        <div
          className="
            relative aspect-[4/5] w-full
            overflow-hidden bg-stone-100
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name || name}
              loading="lazy"
              decoding="async"
              className="
                h-full w-full object-cover
                transition-transform duration-500
                motion-safe:group-hover:scale-[1.035]
                motion-reduce:transition-none
              "
            />
          ) : (
            <div
              className="
                flex h-full w-full flex-col
                items-center justify-center gap-3
                bg-gradient-to-br
                from-rose-50 to-stone-100
                px-4 text-center text-stone-500
              "
            >
              <PhotoIcon />

              <span className="text-xs font-semibold">
                Zdjęcie niedostępne
              </span>
            </div>
          )}

          {/* OZNACZENIA PRODUKTU */}
          {(product.featured ||
            showDifference) && (
            <div
              className="
                absolute left-2.5 top-2.5
                flex max-w-[calc(100%-1.25rem)]
                flex-col items-start gap-1.5
                sm:left-3 sm:top-3
              "
            >
              {product.featured && (
                <span
                  className="
                    rounded-full
                    border border-white/80
                    bg-white/95
                    px-3 py-1.5
                    text-xs font-extrabold
                    text-rose-700 shadow-sm
                    backdrop-blur-sm
                  "
                >
                  Wybrane
                </span>
              )}

              {showDifference && (
                <span
                  className="
                    rounded-full bg-rose-600
                    px-3 py-1.5
                    text-xs font-black
                    text-white shadow-sm
                  "
                >
                  -{priceDifference}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* INFORMACJE O PRODUKCIE */}
        <div
          className="
            flex min-w-0 flex-1 flex-col
            p-3.5 sm:p-4
          "
        >
          <p
            className="
              truncate text-xs font-extrabold
              uppercase tracking-[0.075em]
              text-rose-700
            "
          >
            {category}
          </p>

          <h3
            className="
              mt-2 line-clamp-2
              min-h-[2.6em]
              text-[15px] font-extrabold
              leading-[1.3]
              tracking-[-0.02em]
              text-stone-900
              transition-colors
              group-hover:text-rose-700
              sm:text-base
            "
          >
            {name}
          </h3>

          {soldText && (
            <p
              className="
                mt-1 truncate
                text-xs leading-5
                text-stone-500
              "
            >
              {soldText}
            </p>
          )}

          {/* CENY I PRZEJŚCIE DO SZCZEGÓŁÓW */}
          <div className="mt-auto pt-4">
            <div
              className="
                flex flex-wrap items-baseline
                gap-x-2 gap-y-1
              "
            >
              <strong
                className="
                  text-xl font-black
                  leading-tight
                  tracking-[-0.035em]
                  text-stone-950
                  sm:text-2xl
                "
              >
                {formatPrice(product.price)}
              </strong>

              {hasPreviousPrice &&
                product.oldPrice !== null && (
                  <span
                    className="
                      text-xs font-semibold
                      text-stone-500 line-through
                      decoration-stone-400
                    "
                  >
                    {formatPrice(
                      product.oldPrice
                    )}
                  </span>
                )}
            </div>

            <p
              className="
                mt-1 text-xs leading-5
                text-stone-500
              "
            >
              Cena zapisana przy publikacji
            </p>

            <span
              className="
                mt-4 flex min-h-11
                items-center justify-center
                gap-2 rounded-xl
                bg-rose-50 px-3
                text-sm font-extrabold
                text-rose-700
                transition-colors
                group-hover:bg-rose-600
                group-hover:text-white
              "
            >
              Zobacz szczegóły

              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* IKONA STRZAŁKI */

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
      className="
        h-4 w-4 shrink-0
        transition-transform
        group-hover:translate-x-0.5
      "
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

/* IKONA ZASTĘPCZA PRZY BRAKU ZDJĘCIA */

function PhotoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10 text-rose-300"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
      />

      <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
      />

      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}
