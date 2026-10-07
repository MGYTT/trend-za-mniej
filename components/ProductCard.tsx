import Link from "next/link";
import {
  Product,
  formatPrice,
} from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/produkt/${product.slug}`}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-rose-50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {product.featured && (
            <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
              🔥 Gorąca okazja
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-stone-500">
            {product.category}
          </span>

          {product.sold && (
            <span className="text-xs text-stone-400">
              {product.sold}
            </span>
          )}
        </div>

        <Link href={`/produkt/${product.slug}`}>
          <h3 className="mt-2 text-xl font-bold leading-snug text-stone-900 transition hover:text-rose-600">
            {product.shortName}
          </h3>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-black text-rose-600">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice !== null && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-stone-400">
          Cena w chwili publikacji
        </p>

        <Link
          href={`/produkt/${product.slug}`}
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:from-rose-600 hover:to-pink-600 hover:shadow-lg"
        >
          Zobacz okazję
          <span className="ml-2">→</span>
        </Link>
      </div>
    </article>
  );
}