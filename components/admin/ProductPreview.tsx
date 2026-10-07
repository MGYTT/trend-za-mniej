type ProductPreviewProps = {
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice: string;
  category: string;
  featured: boolean;
  imageUrl: string | null;
};

function parsePreviewPrice(
  value: string
) {
  const normalized =
    value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : null;
}

function formatPrice(
  value: string
) {
  const price =
    parsePreviewPrice(value);

  if (price === null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "pl-PL",
    {
      style: "currency",
      currency: "PLN",
    }
  ).format(price);
}

export default function ProductPreview({
  name,
  shortName,
  description,
  price,
  oldPrice,
  category,
  featured,
  imageUrl,
}: ProductPreviewProps) {
  const displayName =
    shortName.trim() ||
    name.trim() ||
    "Nazwa produktu";

  const displayCategory =
    category.trim() ||
    "Kategoria";

  const oldPriceValue =
    parsePreviewPrice(
      oldPrice
    );

  const currentPriceValue =
    parsePreviewPrice(
      price
    );

  const showOldPrice =
    oldPriceValue !== null &&
    currentPriceValue !== null &&
    oldPriceValue >
      currentPriceValue;

  return (
    <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-stone-100 to-rose-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Podgląd produktu"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl">
              📷
            </div>

            <p className="mt-3 text-sm font-bold text-stone-500">
              Dodaj zdjęcie produktu
            </p>
          </div>
        )}

        {featured && (
          <div className="absolute left-4 top-4 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black text-orange-700 shadow-sm">
            🔥 Gorąca okazja
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
          {displayCategory}
        </div>

        <h3 className="mt-3 text-xl font-black leading-snug text-stone-900">
          {displayName}
        </h3>

        {description.trim() ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-500">
            {description}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Tutaj pojawi się krótki
            opis produktu.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-black text-rose-600">
            {formatPrice(
              price
            )}
          </span>

          {showOldPrice && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(
                oldPrice
              )}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-stone-400">
          Cena w chwili publikacji
        </p>

        <div className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 font-black text-white shadow-sm">
          Zobacz okazję →
        </div>

        <p className="mt-3 text-center text-[11px] leading-5 text-stone-400">
          To tylko podgląd. Przycisk
          nie prowadzi jeszcze do
          sklepu.
        </p>
      </div>
    </div>
  );
}