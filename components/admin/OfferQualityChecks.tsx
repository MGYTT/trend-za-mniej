import {
  getOfferQualityIssues,
} from "@/lib/offer-quality";

type Props = {
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice: string;
  affiliateUrl: string;
  soldText: string;
  imageSelected: boolean;
};

export default function OfferQualityChecks({
  name,
  shortName,
  description,
  price,
  oldPrice,
  affiliateUrl,
  soldText,
  imageSelected,
}: Props) {
  const hasStarted =
    Boolean(
      name.trim() ||
        shortName.trim() ||
        description.trim() ||
        price.trim() ||
        oldPrice.trim() ||
        affiliateUrl.trim() ||
        soldText.trim() ||
        imageSelected
    );

  const issues =
    getOfferQualityIssues({
      name,
      shortName,
      description,
      price,
      oldPrice,
      affiliateUrl,
      soldText,
      imageSelected,
    });

  if (!hasStarted) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="font-black">
          🛡️ Kontrola jakości
        </p>

        <p className="mt-2 text-sm leading-6 text-stone-500">
          Podczas uzupełniania
          oferty pojawią się tutaj
          ostrzeżenia dotyczące
          danych produktu.
        </p>
      </div>
    );
  }

  if (
    issues.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-5">
        <p className="font-black text-green-800">
          ✅ Kontrola jakości
        </p>

        <p className="mt-2 text-sm leading-6 text-green-700">
          Nie znaleziono
          oczywistych problemów w
          uzupełnionych danych.
          Zawsze wykonaj jeszcze
          końcowe sprawdzenie przed
          publikacją.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div>
        <p className="font-black text-amber-900">
          ⚠️ Kontrola jakości
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-800">
          Sprawdź poniższe elementy
          przed publikacją.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {issues.map(
          (issue) => (
            <div
              key={
                issue.id
              }
              className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-sm font-semibold leading-6 text-stone-700"
            >
              ⚠️{" "}
              {issue.message}
            </div>
          )
        )}
      </div>
    </div>
  );
}