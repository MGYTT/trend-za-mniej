"use client";

import Link from "next/link";

import type {
  ParserConfidence,
  ParsedOffer,
} from "@/lib/offer-parser";

import type {
  OfferAssistantField,
} from "@/lib/offer-assistant";

import {
  getSheinIdentityLabel,
  type ProductDuplicateCheck,
} from "@/lib/product-duplicate";

type Props = {
  rawOffer: string;

  onRawOfferChange: (
    value: string
  ) => void;

  onAnalyze: () => void;

  onPasteAndAnalyze:
    () => void;

  clipboardLoading: boolean;

  analysis:
    | ParsedOffer
    | null;

  fields:
    OfferAssistantField[];

  detectedFields: number;
  totalFields: number;
  analysisPercent: number;

  parserMessage:
    | string
    | null;

  parserWarnings: string[];

  parserConfidence:
    | ParserConfidence
    | null;

  duplicateCheck:
    ProductDuplicateCheck;

  onGenerateDescription:
    () => void;

  onGoToMissing:
    () => void;

  nextMissingLabel:
    | string
    | null;

  onClear: () => void;

  draftRestored: boolean;

  draftSavedAt:
    | string
    | null;
};

export default function QuickStartAssistant({
  rawOffer,
  onRawOfferChange,
  onAnalyze,
  onPasteAndAnalyze,
  clipboardLoading,
  analysis,
  fields,
  detectedFields,
  totalFields,
  analysisPercent,
  parserMessage,
  parserWarnings,
  parserConfidence,
  duplicateCheck,
  onGenerateDescription,
  onGoToMissing,
  nextMissingLabel,
  onClear,
  draftRestored,
  draftSavedAt,
}: Props) {
  const hasCurrentOffer =
    Boolean(
      rawOffer.trim() ||
        analysis
    );

  return (
    <section className="overflow-hidden rounded-[20px] border border-violet-100 bg-white shadow-sm">
      <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
            ✨
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                Szybki start
              </p>

              {draftRestored && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700">
                  przywrócono szkic
                </span>
              )}
            </div>

            <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-stone-900 sm:text-xl">
              Przygotuj ofertę
              automatycznie
            </h2>

            <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
              Wklej treść produktu
              SHEIN. Asystent
              przygotuje dane,
              sprawdzi duplikaty i
              pomoże doprowadzić
              ofertę do publikacji.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-white/80 bg-white/80 p-2.5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 px-1">
              <p className="text-[10px] font-bold text-stone-500 sm:text-xs">
                {draftSavedAt
                  ? `Szkic zapisany automatycznie • ${formatDraftTime(
                      draftSavedAt
                    )}`
                  : "Szkic zapisuje się automatycznie"}
              </p>

              <p className="mt-0.5 text-[9px] leading-4 text-stone-400 sm:text-[10px]">
                {hasCurrentOffer
                  ? "Chcesz dodać inny produkt? Rozpocznij nową ofertę jednym kliknięciem."
                  : "Formularz jest gotowy na nowy produkt."}
              </p>
            </div>

            <button
              type="button"
              onClick={
                onClear
              }
              className="flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 text-xs font-black text-stone-800 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] sm:w-auto"
            >
              <span className="text-base leading-none">
                +
              </span>

              Nowy produkt
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={
              onPasteAndAnalyze
            }
            disabled={
              clipboardLoading
            }
            className="flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100 disabled:opacity-50 sm:text-sm"
          >
            {clipboardLoading
              ? "Wklejanie..."
              : "📋 Wklej ze schowka"}
          </button>

          <button
            type="button"
            onClick={
              onAnalyze
            }
            disabled={
              !rawOffer.trim()
            }
            className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            ✨ Analizuj
          </button>
        </div>

        <textarea
          value={
            rawOffer
          }
          onChange={(
            event
          ) =>
            onRawOfferChange(
              event.target.value
            )
          }
          rows={7}
          placeholder="Lub wklej tutaj tekst skopiowany z produktu SHEIN..."
          className="mt-3 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:text-sm"
        />

        {!analysis &&
          parserMessage && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
              {parserMessage}
            </div>
          )}

        {analysis && (
          <div className="mt-4">
            <div className="rounded-[16px] border border-stone-200 bg-stone-50 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-stone-900">
                    Wynik analizy
                  </p>

                  <p className="mt-0.5 text-[10px] text-stone-400 sm:text-xs">
                    Rozpoznano{" "}
                    {
                      detectedFields
                    }{" "}
                    z{" "}
                    {
                      totalFields
                    }{" "}
                    kluczowych danych
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-violet-700">
                    {
                      analysisPercent
                    }
                    %
                  </p>

                  {parserConfidence && (
                    <ConfidenceBadge
                      confidence={
                        parserConfidence
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-300"
                  style={{
                    width:
                      `${analysisPercent}%`,
                  }}
                />
              </div>
            </div>

            {parserMessage && (
              <p className="mt-3 text-xs font-semibold leading-5 text-stone-500">
                {parserMessage}
              </p>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {fields.map(
                (field) => (
                  <DetectedField
                    key={
                      field.id
                    }
                    field={
                      field
                    }
                  />
                )
              )}
            </div>

            <DuplicateGuard
              check={
                duplicateCheck
              }
            />

            {parserWarnings.length >
              0 && (
              <div className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 p-3.5">
                <p className="text-xs font-black text-amber-900">
                  Warto sprawdzić
                </p>

                <div className="mt-2 space-y-2">
                  {parserWarnings.map(
                    (
                      warning
                    ) => (
                      <p
                        key={
                          warning
                        }
                        className="flex gap-2 text-xs leading-5 text-amber-800"
                      >
                        <span className="shrink-0">
                          ⚠
                        </span>

                        <span>
                          {
                            warning
                          }
                        </span>
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={
                  onGenerateDescription
                }
                disabled={
                  !analysis.name &&
                  !analysis.shortName
                }
                className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-700 transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-40 sm:text-sm"
              >
                ✨ Przygotuj opis
              </button>

              <button
                type="button"
                onClick={
                  onGoToMissing
                }
                disabled={
                  !nextMissingLabel
                }
                className="min-h-11 rounded-xl bg-stone-900 px-3 text-xs font-black text-white transition hover:bg-stone-800 disabled:opacity-40 sm:text-sm"
              >
                {nextMissingLabel
                  ? `Uzupełnij: ${nextMissingLabel} →`
                  : "✓ Oferta kompletna"}
              </button>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-stone-400 sm:text-xs">
              Twarda blokada
              pojawia się tylko
              wtedy, gdy system ma
              jednoznaczny dowód
              duplikatu. Podobne
              nazwy są jedynie
              ostrzeżeniem.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function DuplicateGuard({
  check,
}: {
  check:
    ProductDuplicateCheck;
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
      <div className="mt-3 rounded-[16px] border border-blue-100 bg-blue-50 p-3.5">
        <p className="text-xs font-black text-blue-800">
          🔎 Sprawdzam duplikaty…
        </p>

        {check.identity && (
          <p className="mt-1 text-xs text-blue-700">
            Rozpoznano{" "}
            {getSheinIdentityLabel(
              check.identity
            )}
          </p>
        )}
      </div>
    );
  }

  if (
    check.status ===
      "blocked" &&
    check.exactMatch
  ) {
    return (
      <div className="mt-3 rounded-[18px] border border-red-200 bg-red-50 p-3.5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-red-600 shadow-sm">
            !
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-red-900">
              Ten produkt już
              istnieje
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              {check.blockingReason ===
              "shein-key"
                ? "Rozpoznano ten sam identyfikator produktu SHEIN. Inny link afiliacyjny nie tworzy nowego produktu."
                : "Dokładnie ten sam link afiliacyjny jest już przypisany do istniejącej oferty."}
            </p>
          </div>
        </div>

        {check.identity && (
          <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[10px] font-black text-red-700">
            {
              getSheinIdentityLabel(
                check.identity
              )
            }
          </div>
        )}

        <DuplicateProductCard
          product={
            check.exactMatch
          }
          blocked
        />
      </div>
    );
  }

  if (
    check.status ===
      "warning" &&
    check.similarMatches
      .length > 0
  ) {
    return (
      <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 p-3.5">
        <p className="text-xs font-black text-amber-900">
          ⚠ Znaleziono podobne
          oferty
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          To nie jest pewny
          duplikat, dlatego
          publikacja nie jest
          blokowana. Warto tylko
          szybko sprawdzić poniższe
          produkty.
        </p>

        <div className="mt-3 space-y-2">
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
              />
            )
          )}
        </div>
      </div>
    );
  }

  if (
    check.status ===
    "clear"
  ) {
    return (
      <div className="mt-3 rounded-[16px] border border-green-200 bg-green-50 p-3.5">
        <div className="flex gap-3">
          <span className="font-black text-green-700">
            ✓
          </span>

          <div>
            <p className="text-xs font-black text-green-800">
              Nie znaleziono
              duplikatu
            </p>

            <p className="mt-1 text-xs leading-5 text-green-700">
              {check.identity
                ? `${getSheinIdentityLabel(
                    check.identity
                  )} nie występuje jeszcze w bazie.`
                : "Nie znaleziono identycznego linku ani wyraźnie podobnej istniejącej oferty."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 p-3.5">
      <p className="text-xs font-black text-amber-900">
        Kontrola duplikatu
        chwilowo niedostępna
      </p>

      <p className="mt-1 text-xs leading-5 text-amber-800">
        System spróbuje ponownie
        przed publikacją.
      </p>
    </div>
  );
}

function DuplicateProductCard({
  product,
  blocked = false,
}: {
  product:
    ProductDuplicateCheck["exactMatch"] extends infer T
      ? Exclude<T, null>
      : never;

  blocked?: boolean;
}) {
  return (
    <div className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-[14px] border border-white bg-white p-2.5 shadow-sm">
      <img
        src={
          product.imageUrl
        }
        alt=""
        className="h-[72px] w-[58px] rounded-xl object-cover"
      />

      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-black leading-5 text-stone-900">
          {
            product.shortName
          }
        </p>

        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-stone-400">
          <span>
            {
              product.category
            }
          </span>

          <span>
            {Number.isFinite(
              product.price
            )
              ? `${product.price.toFixed(
                  2
                )} zł`
              : ""}
          </span>

          <span
            className={
              product.active
                ? "font-bold text-green-600"
                : "font-bold text-stone-400"
            }
          >
            {product.active
              ? "● aktywna"
              : "● ukryta"}
          </span>
        </div>

        {!blocked && (
          <p className="mt-1 text-[10px] font-black text-amber-700">
            {
              product.similarity
            }
            % podobieństwa
          </p>
        )}

        <Link
          href={`/admin/edytuj/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-[10px] font-black text-rose-600 hover:text-rose-700"
        >
          Otwórz w panelu ↗
        </Link>
      </div>
    </div>
  );
}

function DetectedField({
  field,
}: {
  field:
    OfferAssistantField;
}) {
  return (
    <div className="rounded-[14px] border border-stone-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
            {field.label}
          </p>

          <p
            className={[
              "mt-1 text-xs font-bold leading-5",
              field.value
                ? "text-stone-800"
                : "text-stone-400",
              field.id ===
              "affiliateUrl"
                ? "break-all"
                : "line-clamp-2",
            ].join(
              " "
            )}
          >
            {field.value ||
              field.hint}
          </p>
        </div>

        <FieldStateBadge
          state={
            field.state
          }
        />
      </div>

      {field.value &&
        field.state ===
          "review" && (
          <p className="mt-2 text-[10px] leading-4 text-amber-700">
            {field.hint}
          </p>
        )}
    </div>
  );
}

function FieldStateBadge({
  state,
}: {
  state:
    OfferAssistantField["state"];
}) {
  if (
    state === "ready"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-black text-green-700">
        ✓ OK
      </span>
    );
  }

  if (
    state === "review"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
        sprawdź
      </span>
    );
  }

  if (
    state === "missing"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-black text-red-700">
        brak
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[9px] font-black text-stone-500">
      opcja
    </span>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence:
    ParserConfidence;
}) {
  if (
    confidence === "high"
  ) {
    return (
      <span className="text-[9px] font-black text-green-700">
        wysoka pewność
      </span>
    );
  }

  if (
    confidence ===
    "medium"
  ) {
    return (
      <span className="text-[9px] font-black text-amber-700">
        średnia pewność
      </span>
    );
  }

  return (
    <span className="text-[9px] font-black text-red-700">
      sprawdź wynik
    </span>
  );
}

function formatDraftTime(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "teraz";
  }

  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}