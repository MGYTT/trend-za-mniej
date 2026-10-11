"use client";

import Link from "next/link";

import {
  getSheinIdentityLabel,
  type ProductDuplicateCandidate,
  type ProductDuplicateCheck,
} from "@/lib/product-duplicate";

export default function DuplicateReviewCard({
  check,
  compact = false,
}: {
  check:
    ProductDuplicateCheck;

  compact?: boolean;
}) {
  if (
    check.status ===
    "idle"
  ) {
    return null;
  }

  if (
    check.status ===
    "checking"
  ) {
    return (
      <div className="rounded-[14px] border border-blue-100 bg-blue-50 px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <Spinner />

          <div>
            <p className="text-xs font-black text-blue-800">
              Sprawdzam możliwe duplikaty…
            </p>

            <p className="mt-1 text-[10px] leading-5 text-blue-700">
              Analizuję tożsamość produktu, link SHEIN i podobieństwo do istniejących ofert.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    check.status ===
      "blocked" &&
    check.exactMatch
  ) {
    return (
      <div className="rounded-[16px] border border-orange-200 bg-orange-50 p-3.5">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-orange-700 shadow-sm">
            !
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-orange-950">
              Bardzo prawdopodobny duplikat
            </p>

            <p className="mt-1 text-[11px] leading-5 text-orange-800">
              {check.blockingReason ===
              "shein-key"
                ? "System rozpoznał ten sam produkt SHEIN mimo innego linku afiliacyjnego."
                : "Ten link wygląda jak ten sam link SHEIN po usunięciu parametrów śledzących."}
            </p>

            <p className="mt-1 text-[10px] font-black text-orange-700">
              To jest ostrzeżenie — możesz kontynuować publikację, jeśli jest to zamierzone.
            </p>
          </div>
        </div>

        {check.identity && (
          <div className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-[9px] font-black text-orange-800">
            {getSheinIdentityLabel(
              check.identity
            )}
          </div>
        )}

        <DuplicateProductCard
          product={
            check.exactMatch
          }
          tone="strong"
          compact={
            compact
          }
        />
      </div>
    );
  }

  if (
    check.status ===
      "warning" &&
    check.similarMatches
      .length >
      0
  ) {
    return (
      <details
        open={
          !compact
        }
        className="overflow-hidden rounded-[14px] border border-amber-200 bg-amber-50"
      >
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2">
          <div>
            <p className="text-xs font-black text-amber-900">
              Możliwy duplikat
            </p>

            <p className="mt-0.5 text-[9px] text-amber-700">
              Sprawdź przed publikacją • nie blokuje zapisu
            </p>
          </div>

          <span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-black text-amber-700">
            {
              check.similarMatches
                .length
            }
          </span>
        </summary>

        <div className="border-t border-amber-200 px-3 py-3">
          <p className="text-[10px] leading-5 text-amber-800">
            System znalazł podobne produkty na podstawie nazwy, kategorii i ceny. To nie jest dowód, że produkt jest identyczny.
          </p>

          <div className="mt-2 space-y-2">
            {check.similarMatches.map(
              (
                product
              ) => (
                <DuplicateProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  tone="possible"
                  compact={
                    compact
                  }
                />
              )
            )}
          </div>
        </div>
      </details>
    );
  }

  if (
    check.status ===
    "clear"
  ) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5">
        <span className="font-black text-green-700">
          ✓
        </span>

        <div>
          <p className="text-[10px] font-black text-green-800">
            Nie znaleziono istotnych podobieństw
          </p>

          {check.identity && (
            <p className="mt-0.5 text-[9px] text-green-700">
              {getSheinIdentityLabel(
                check.identity
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
      <p className="text-[10px] font-black text-stone-800">
        Nie udało się teraz sprawdzić duplikatów.
      </p>

      <p className="mt-1 text-[9px] leading-4 text-stone-500">
        Możesz kontynuować dodawanie produktu. System duplikatów ma charakter pomocniczy i nie blokuje publikacji.
      </p>
    </div>
  );
}

function DuplicateProductCard({
  product,
  tone,
  compact,
}: {
  product:
    ProductDuplicateCandidate;

  tone:
    | "strong"
    | "possible";

  compact:
    boolean;
}) {
  return (
    <div className="mt-2 grid grid-cols-[48px_minmax(0,1fr)] gap-2.5 rounded-xl border border-white bg-white p-2 shadow-sm">
      <img
        src={
          product.imageUrl
        }
        alt=""
        loading="lazy"
        decoding="async"
        className="h-[60px] w-[48px] rounded-lg object-cover"
      />

      <div className="min-w-0">
        <p className="line-clamp-2 text-[10px] font-black leading-4 text-stone-900">
          {
            product.shortName
          }
        </p>

        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-stone-400">
          <span>
            {
              product.category
            }
          </span>

          {Number.isFinite(
            product.price
          ) && (
            <span>
              {product.price.toFixed(
                2
              )} zł
            </span>
          )}
        </div>

        {tone ===
          "possible" && (
          <p className="mt-1 text-[9px] font-black text-amber-700">
            {
              product.similarity
            }
            % podobieństwa
          </p>
        )}

        {(product.signals ?? []).length >
          0 &&
          !compact && (
            <p className="mt-1 text-[9px] leading-4 text-stone-500">
              {(product.signals ?? []).join(
                " • "
              )}
            </p>
          )}

        <Link
          href={`/admin/edytuj/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "mt-1.5 inline-flex text-[9px] font-black",
            tone ===
            "strong"
              ? "text-orange-700"
              : "text-amber-700",
          ].join(" ")}
        >
          Otwórz istniejącą ofertę ↗
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-300 border-r-blue-700"
    />
  );
}