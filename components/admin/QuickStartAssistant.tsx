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
  rawOffer:
    string;

  onRawOfferChange:
    (
      value:
        string
    ) => void;

  onAnalyze:
    () => void;

  onPasteAndAnalyze:
    () => void;

  clipboardLoading:
    boolean;

  analysis:
    | ParsedOffer
    | null;

  fields:
    OfferAssistantField[];

  detectedFields:
    number;

  totalFields:
    number;

  analysisPercent:
    number;

  parserMessage:
    | string
    | null;

  parserWarnings:
    string[];

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

  onClear:
    () => void;

  draftRestored:
    boolean;

  draftSavedAt:
    | string
    | null;
};

type DuplicateCandidate =
  NonNullable<
    ProductDuplicateCheck[
      "exactMatch"
    ]
  >;

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

  const readyFields =
    fields.filter(
      (
        field
      ) =>
        field.state ===
        "ready"
    ).length;

  const reviewFields =
    fields.filter(
      (
        field
      ) =>
        field.state ===
        "review"
    ).length;

  const missingFields =
    fields.filter(
      (
        field
      ) =>
        field.state ===
        "missing"
    ).length;

  return (
    <section className="overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 bg-gradient-to-br from-violet-50/80 via-white to-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-violet-100 text-lg">
            ✨
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-violet-600">
                Szybki start 2.0
              </p>

              {draftRestored && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black text-blue-700">
                  przywrócono szkic
                </span>
              )}
            </div>

            <h2 className="mt-1 text-base font-black tracking-[-0.02em] text-stone-900 sm:text-lg">
              Przygotuj ofertę
              automatycznie
            </h2>

            <p className="mt-1 max-w-xl text-[11px] leading-5 text-stone-500 sm:text-xs">
              Wklej dane produktu.
              System rozpozna nazwę,
              cenę, kategorię i link,
              a następnie sprawdzi
              możliwy duplikat.
            </p>
          </div>

          {hasCurrentOffer && (
            <button
              type="button"
              onClick={
                onClear
              }
              className="hidden min-h-9 shrink-0 items-center rounded-xl border border-stone-200 bg-white px-3 text-[10px] font-black text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex"
            >
              + Nowy
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
          <p className="min-w-0 truncate text-[9px] font-semibold text-stone-400 sm:text-[10px]">
            {draftSavedAt
              ? `Autozapis • ${formatDraftTime(
                  draftSavedAt
                )}`
              : "Szkic zapisuje się automatycznie"}
          </p>

          <span className="shrink-0 text-[9px] font-bold text-stone-400">
            Bez pobierania danych
            ze sklepu
          </span>
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
            className="flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
          >
            {clipboardLoading
              ? "Wklejam..."
              : "📋 Wklej i analizuj"}
          </button>

          <button
            type="button"
            onClick={
              onAnalyze
            }
            disabled={
              !rawOffer.trim()
            }
            className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {analysis
              ? "↻ Analizuj ponownie"
              : "✨ Analizuj"}
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
          rows={
            analysis
              ? 4
              : 6
          }
          placeholder="Wklej tekst produktu, cenę i link SHEIN..."
          className="mt-3 w-full resize-y rounded-[14px] border border-stone-200 bg-stone-50 px-3.5 py-3 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:text-sm"
        />

        <div className="mt-1.5 flex items-center justify-between gap-3 px-1">
          <p className="text-[9px] leading-4 text-stone-400">
            Możesz wkleić nawet
            nieuporządkowany tekst.
          </p>

          <p className="shrink-0 text-[9px] font-bold text-stone-400">
            {
              rawOffer.length
            }{" "}
            znaków
          </p>
        </div>

        {!analysis &&
          parserMessage && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-800">
            {
              parserMessage
            }
          </div>
        )}

        {analysis && (
          <div className="mt-4 space-y-3">
            <AnalysisSummary
              analysis={
                analysis
              }
              detectedFields={
                detectedFields
              }
              totalFields={
                totalFields
              }
              analysisPercent={
                analysisPercent
              }
              confidence={
                parserConfidence
              }
              readyFields={
                readyFields
              }
              reviewFields={
                reviewFields
              }
              missingFields={
                missingFields
              }
            />

            {parserMessage && (
              <p className="px-1 text-[10px] font-semibold leading-5 text-stone-500 sm:text-xs">
                {
                  parserMessage
                }
              </p>
            )}

            <DuplicateGuard
              check={
                duplicateCheck
              }
            />

            <details className="overflow-hidden rounded-[14px] border border-stone-200 bg-white">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-xs font-black text-stone-700">
                <span>
                  Rozpoznane dane
                </span>

                <span className="text-[10px] font-bold text-stone-400">
                  {
                    detectedFields
                  }
                  /
                  {
                    totalFields
                  }{" "}
                  kluczowych
                </span>
              </summary>

              <div className="border-t border-stone-100 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {fields.map(
                    (
                      field
                    ) => (
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
              </div>
            </details>

            {parserWarnings.length >
              0 && (
              <details className="overflow-hidden rounded-[14px] border border-amber-200 bg-amber-50">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2">
                  <span className="text-xs font-black text-amber-900">
                    ⚠ Warto sprawdzić
                  </span>

                  <span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-black text-amber-700">
                    {
                      parserWarnings.length
                    }
                  </span>
                </summary>

                <div className="space-y-2 border-t border-amber-200 px-3.5 py-3">
                  {parserWarnings.map(
                    (
                      warning
                    ) => (
                      <p
                        key={
                          warning
                        }
                        className="flex gap-2 text-[11px] leading-5 text-amber-800"
                      >
                        <span className="shrink-0">
                          •
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
              </details>
            )}

            {analysis.diagnostics
              .signals.length >
              0 && (
              <details className="rounded-[14px] border border-stone-200 bg-stone-50">
                <summary className="cursor-pointer px-3.5 py-3 text-[10px] font-black text-stone-500">
                  Szczegóły analizy
                </summary>

                <div className="border-t border-stone-200 px-3.5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.diagnostics
                      .signals.map(
                        (
                          signal
                        ) => (
                          <span
                            key={
                              signal
                            }
                            className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-stone-600 ring-1 ring-stone-200"
                          >
                            ✓{" "}
                            {
                              signal
                            }
                          </span>
                        )
                      )}
                  </div>

                  <p className="mt-3 text-[9px] leading-4 text-stone-400">
                    Przeanalizowano{" "}
                    {
                      analysis
                        .diagnostics
                        .sourceLines
                    }{" "}
                    wierszy
                    {analysis
                      .diagnostics
                      .ignoredNoiseLines >
                      0
                      ? ` • pominięto ${analysis.diagnostics.ignoredNoiseLines} elementów interfejsu`
                      : ""}
                    .
                  </p>
                </div>
              </details>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={
                  onGenerateDescription
                }
                disabled={
                  !analysis.name &&
                  !analysis.shortName
                }
                className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-700 transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-40"
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
                className="min-h-11 rounded-xl bg-stone-950 px-3 text-xs font-black text-white transition hover:bg-stone-800 disabled:opacity-40"
              >
                {nextMissingLabel
                  ? `Uzupełnij: ${nextMissingLabel} →`
                  : "✓ Kluczowe dane gotowe"}
              </button>
            </div>

            <button
              type="button"
              onClick={
                onClear
              }
              className="flex min-h-10 w-full items-center justify-center text-[10px] font-black text-stone-400 transition hover:text-red-600 sm:hidden"
            >
              + Rozpocznij nowy produkt
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function AnalysisSummary({
  analysis,
  detectedFields,
  totalFields,
  analysisPercent,
  confidence,
  readyFields,
  reviewFields,
  missingFields,
}: {
  analysis:
    ParsedOffer;

  detectedFields:
    number;

  totalFields:
    number;

  analysisPercent:
    number;

  confidence:
    | ParserConfidence
    | null;

  readyFields:
    number;

  reviewFields:
    number;

  missingFields:
    number;
}) {
  const productType =
    analysis.diagnostics
      .productType;

  return (
    <div className="overflow-hidden rounded-[16px] border border-stone-200 bg-stone-50">
      <div className="flex items-center gap-3 p-3.5">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black",
            analysisPercent ===
            100
              ? "bg-green-100 text-green-700"
              : "bg-violet-100 text-violet-700",
          ].join(
            " "
          )}
        >
          {
            analysisPercent
          }
          %
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs font-black text-stone-900">
              {detectedFields ===
              totalFields
                ? "Najważniejsze dane rozpoznane"
                : `Rozpoznano ${detectedFields} z ${totalFields} danych`}
            </p>

            {confidence && (
              <ConfidenceBadge
                confidence={
                  confidence
                }
              />
            )}
          </div>

          <p className="mt-1 truncate text-[10px] text-stone-400">
            {productType
              ? `${productType}${
                  analysis.category
                    ? ` • ${analysis.category}`
                    : ""
                }`
              : analysis.category ||
                "Sprawdź rozpoznane informacje"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-stone-200 bg-white">
        <SummaryMetric
          value={
            readyFields
          }
          label="pewne"
          tone="green"
        />

        <SummaryMetric
          value={
            reviewFields
          }
          label="sprawdź"
          tone="amber"
        />

        <SummaryMetric
          value={
            missingFields
          }
          label="braki"
          tone="red"
        />
      </div>
    </div>
  );
}

function SummaryMetric({
  value,
  label,
  tone,
}: {
  value:
    number;

  label:
    string;

  tone:
    | "green"
    | "amber"
    | "red";
}) {
  const toneClass =
    tone ===
    "green"
      ? "text-green-700"
      : tone ===
          "amber"
        ? "text-amber-700"
        : "text-red-700";

  return (
    <div className="border-r border-stone-100 px-2 py-2.5 text-center last:border-r-0">
      <p
        className={[
          "text-sm font-black",
          toneClass,
        ].join(
          " "
        )}
      >
        {value}
      </p>

      <p className="text-[8px] font-black uppercase tracking-[0.08em] text-stone-400">
        {label}
      </p>
    </div>
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
      <div className="rounded-[14px] border border-blue-100 bg-blue-50 px-3.5 py-3">
        <p className="text-xs font-black text-blue-800">
          🔎 Sprawdzam, czy produkt
          już istnieje…
        </p>

        {check.identity && (
          <p className="mt-1 text-[10px] text-blue-700">
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
      <div className="rounded-[16px] border border-red-200 bg-red-50 p-3.5">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-red-600 shadow-sm">
            !
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-red-900">
              Ten produkt już
              istnieje
            </p>

            <p className="mt-1 text-[11px] leading-5 text-red-700">
              {check.blockingReason ===
              "shein-key"
                ? "Rozpoznano ten sam produkt SHEIN."
                : "Ten sam link afiliacyjny jest już zapisany przy innej ofercie."}
            </p>
          </div>
        </div>

        {check.identity && (
          <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-[9px] font-black text-red-700">
            {getSheinIdentityLabel(
              check.identity
            )}
          </p>
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
      .length >
      0
  ) {
    return (
      <details className="overflow-hidden rounded-[14px] border border-amber-200 bg-amber-50">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2">
          <div>
            <p className="text-xs font-black text-amber-900">
              ⚠ Podobne produkty
            </p>

            <p className="mt-0.5 text-[9px] text-amber-700">
              Nie blokuje publikacji
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
            Nazwy są podobne, ale
            system nie ma dowodu,
            że jest to ten sam
            produkt.
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
            Nie znaleziono
            duplikatu
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
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
      <p className="text-[10px] font-black text-amber-900">
        Nie udało się teraz
        sprawdzić duplikatów.
      </p>

      <p className="mt-1 text-[9px] text-amber-700">
        Kontrola zostanie wykonana
        ponownie przed publikacją.
      </p>
    </div>
  );
}

function DuplicateProductCard({
  product,
  blocked = false,
}: {
  product:
    DuplicateCandidate;

  blocked?:
    boolean;
}) {
  return (
    <div className="mt-2 grid grid-cols-[48px_minmax(0,1fr)] gap-2.5 rounded-xl border border-white bg-white p-2 shadow-sm">
      <img
        src={
          product.imageUrl
        }
        alt=""
        className="h-[60px] w-[48px] rounded-lg object-cover"
      />

      <div className="min-w-0">
        <p className="line-clamp-2 text-[10px] font-black leading-4 text-stone-900">
          {
            product.shortName
          }
        </p>

        <div className="mt-1 flex flex-wrap gap-x-2 text-[9px] text-stone-400">
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
        </div>

        {!blocked && (
          <p className="mt-1 text-[9px] font-black text-amber-700">
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
          className="mt-1.5 inline-flex text-[9px] font-black text-rose-600"
        >
          Otwórz ↗
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
    <div
      className={[
        "rounded-xl border p-2.5",
        field.state ===
        "ready"
          ? "border-green-100 bg-green-50/30"
          : field.state ===
              "review"
            ? "border-amber-100 bg-amber-50/30"
            : field.state ===
                "missing"
              ? "border-red-100 bg-red-50/20"
              : "border-stone-200 bg-stone-50/50",
      ].join(
        " "
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black uppercase tracking-[0.09em] text-stone-400">
            {
              field.label
            }
          </p>

          <p
            className={[
              "mt-1 text-[11px] font-bold leading-4",
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
          <p className="mt-2 border-t border-amber-100 pt-2 text-[9px] leading-4 text-amber-700">
            {
              field.hint
            }
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
    state ===
    "ready"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[8px] font-black text-green-700">
        ✓ OK
      </span>
    );
  }

  if (
    state ===
    "review"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[8px] font-black text-amber-700">
        sprawdź
      </span>
    );
  }

  if (
    state ===
    "missing"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[8px] font-black text-red-700">
        brak
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[8px] font-black text-stone-500">
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
    confidence ===
    "high"
  ) {
    return (
      <span className="rounded-full bg-green-50 px-2 py-1 text-[8px] font-black text-green-700">
        wysoka pewność
      </span>
    );
  }

  if (
    confidence ===
    "medium"
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-700">
        średnia pewność
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-700">
      sprawdź wynik
    </span>
  );
}

function formatDraftTime(
  value: string
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "zapisano";
  }

  return date.toLocaleTimeString(
    "pl-PL",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}