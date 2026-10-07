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
      document.body.style
        .overflow;

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
      className="fixed inset-0 z-[100] flex items-end bg-stone-950/55 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-confirmation-title"
    >
      <div className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-stone-50 shadow-2xl sm:max-w-5xl sm:rounded-[28px]">
        <div className="shrink-0 border-b border-stone-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600 sm:text-xs">
                Ostatni krok
              </p>

              <h2
                id="publish-confirmation-title"
                className="mt-1 text-xl font-black tracking-[-0.03em] sm:text-3xl"
              >
                Sprawdź ofertę
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
                Produkt nie został
                jeszcze
                opublikowany.
                Sprawdź najważniejsze
                dane.
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition hover:bg-stone-200 disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:grid lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-6">
            <div className="hidden lg:block">
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
              <div className="rounded-[18px] border border-stone-200 bg-white p-3 sm:hidden">
                <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-stone-100">
                    {imageUrl ? (
                      <img
                        src={
                          imageUrl
                        }
                        alt="Podgląd produktu"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        📷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 py-0.5">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-black text-rose-700">
                        {category ||
                          "Kategoria"}
                      </span>

                      {featured && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-orange-700">
                          🔥 Gorąca
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-stone-900">
                      {shortName ||
                        name ||
                        "Nazwa produktu"}
                    </p>

                    <p className="mt-2 text-lg font-black text-stone-900">
                      {price
                        ? `${price} zł`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-[18px] border border-stone-200 bg-white p-4 sm:mt-0 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400">
                  Dane oferty
                </p>

                <div className="mt-4 space-y-4">
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

                  <div className="grid grid-cols-2 gap-3">
                    <SummaryItem
                      label="Cena"
                      value={
                        price
                          ? `${price} zł`
                          : "—"
                      }
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
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
                      Link afiliacyjny
                    </p>

                    <p className="mt-1 break-all text-xs font-semibold leading-5 text-stone-700 sm:text-sm">
                      {
                        affiliateUrl ||
                        "—"
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

              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    confirmed
                  }
                  onChange={(
                    event
                  ) =>
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
                  <p className="text-sm font-black text-stone-900">
                    Sprawdziłem ofertę
                  </p>

                  <p className="mt-1 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                    Zdjęcie, nazwa,
                    cena i link są
                    poprawne.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-stone-200 bg-white px-4 pt-3 sm:px-6"
          style={{
            paddingBottom:
              "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto grid max-w-2xl grid-cols-[105px_minmax(0,1fr)] gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
              className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-600 transition hover:border-rose-200 hover:text-rose-700 disabled:opacity-50 sm:text-sm"
            >
              Wróć
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
              className="min-h-12 rounded-xl bg-rose-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Publikowanie..."
                : "Opublikuj ofertę"}
            </button>
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
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-5 text-stone-800">
        {value || "—"}
      </p>
    </div>
  );
}