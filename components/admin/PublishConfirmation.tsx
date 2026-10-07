"use client";

import {
  useEffect,
  useState,
} from "react";

import ProductPreview from "@/components/admin/ProductPreview";

type Props = {
  open: boolean;
  loading: boolean;
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice: string;
  category: string;
  affiliateUrl: string;
  featured: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function PublishConfirmation({
  open,
  loading,
  name,
  shortName,
  description,
  price,
  oldPrice,
  category,
  affiliateUrl,
  featured,
  imageUrl,
  onClose,
  onConfirm,
}: Props) {
  const [
    confirmed,
    setConfirmed,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmed(false);

      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
          "Escape" &&
        !loading
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    loading,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-confirmation-title"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-stone-50 shadow-2xl">
        <div className="border-b border-rose-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-rose-600">
                Ostatni krok
              </p>

              <h2
                id="publish-confirmation-title"
                className="mt-1 text-3xl font-black"
              >
                Sprawdź ofertę przed
                publikacją
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                Produkt nie został
                jeszcze zapisany.
                Sprawdź szczególnie
                cenę, zdjęcie oraz link
                afiliacyjny.
              </p>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
              aria-label="Zamknij podgląd"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xl font-bold text-stone-500 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div>
            <ProductPreview
              name={
                name
              }
              shortName={
                shortName
              }
              description={
                description
              }
              price={
                price
              }
              oldPrice={
                oldPrice
              }
              category={
                category
              }
              featured={
                featured
              }
              imageUrl={
                imageUrl
              }
            />
          </div>

          <div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-400">
                Dane oferty
              </p>

              <div className="mt-5 space-y-5">
                <SummaryItem
                  label="Pełna nazwa"
                  value={
                    name
                  }
                />

                <SummaryItem
                  label="Krótka nazwa"
                  value={
                    shortName
                  }
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <SummaryItem
                    label="Cena"
                    value={`${price} zł`}
                  />

                  <SummaryItem
                    label="Stara cena"
                    value={
                      oldPrice.trim()
                        ? `${oldPrice} zł`
                        : "Brak"
                    }
                  />
                </div>

                <SummaryItem
                  label="Kategoria"
                  value={
                    category
                  }
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                    Link afiliacyjny
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold leading-6 text-stone-700">
                    {
                      affiliateUrl
                    }
                  </p>
                </div>

                <SummaryItem
                  label="Gorąca okazja"
                  value={
                    featured
                      ? "Tak"
                      : "Nie"
                  }
                />
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <input
                type="checkbox"
                checked={
                  confirmed
                }
                onChange={(event) =>
                  setConfirmed(
                    event.target
                      .checked
                  )
                }
                disabled={
                  loading
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-rose-600"
              />

              <div>
                <p className="font-black text-stone-900">
                  Sprawdziłem ofertę
                </p>

                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Potwierdzam, że
                  zdjęcie, cena, nazwa
                  i link afiliacyjny są
                  poprawne.
                </p>
              </div>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
                className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-4 font-bold text-stone-700 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
              >
                ← Wróć do edycji
              </button>

              <button
                type="button"
                onClick={
                  onConfirm
                }
                disabled={
                  !confirmed ||
                  loading
                }
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Publikowanie..."
                  : "Tak, opublikuj ofertę"}
              </button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              Dopiero kliknięcie
              powyższego przycisku
              zapisze produkt i zdjęcie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 font-semibold leading-6 text-stone-800">
        {value || "—"}
      </p>
    </div>
  );
}