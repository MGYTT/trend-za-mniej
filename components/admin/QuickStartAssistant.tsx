"use client";

import type {
  ParserConfidence,
  ParsedOffer,
} from "@/lib/offer-parser";

import type {
  OfferAssistantField,
} from "@/lib/offer-assistant";

export type DuplicateCheckState =
  | "idle"
  | "checking"
  | "unique"
  | "duplicate"
  | "error";

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

  duplicateState:
    DuplicateCheckState;

  duplicateProductName:
    | string
    | null;

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
  duplicateState,
  duplicateProductName,
  onGenerateDescription,
  onGoToMissing,
  nextMissingLabel,
  onClear,
  draftRestored,
  draftSavedAt,
}: Props) {
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
                Szybki start 2.0
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
              rozpozna najważniejsze
              dane i wpisze je do
              formularza.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold text-stone-400 sm:text-xs">
            {draftSavedAt
              ? `Szkic zapisuje się automatycznie • ostatni zapis ${formatDraftTime(
                  draftSavedAt
                )}`
              : "Szkic zapisuje się automatycznie"}
          </p>

          {(rawOffer.trim() ||
            analysis) && (
            <button
              type="button"
              onClick={
                onClear
              }
              className="text-[10px] font-black text-stone-400 transition hover:text-red-600 sm:text-xs"
            >
              Wyczyść i zacznij od nowa
            </button>
          )}
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

            <DuplicateStatus
              state={
                duplicateState
              }
              productName={
                duplicateProductName
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
              Dane oznaczone jako
              „sprawdź” nie są
              blokowane. Asystent ma
              pomagać, ale przed
              publikacją nadal masz
              pełną kontrolę nad
              ofertą.
            </p>
          </div>
        )}
      </div>
    </section>
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

function DuplicateStatus({
  state,
  productName,
}: {
  state:
    DuplicateCheckState;

  productName:
    | string
    | null;
}) {
  if (
    state === "idle"
  ) {
    return null;
  }

  if (
    state ===
    "checking"
  ) {
    return (
      <div className="mt-3 rounded-[14px] border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-700">
        Sprawdzam, czy ten link
        nie został już użyty…
      </div>
    );
  }

  if (
    state === "unique"
  ) {
    return (
      <div className="mt-3 rounded-[14px] border border-green-200 bg-green-50 p-3 text-xs font-bold text-green-700">
        ✓ Link nie występuje
        jeszcze w bazie ofert.
      </div>
    );
  }

  if (
    state ===
    "duplicate"
  ) {
    return (
      <div className="mt-3 rounded-[14px] border border-red-200 bg-red-50 p-3">
        <p className="text-xs font-black text-red-800">
          ⚠ Ten link jest już
          używany
        </p>

        <p className="mt-1 text-xs leading-5 text-red-700">
          {productName
            ? `Znaleziono ofertę: „${productName}”.`
            : "Produkt z tym linkiem znajduje się już w bazie."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
      Nie udało się teraz
      sprawdzić duplikatu. Link
      zostanie sprawdzony ponownie
      przed publikacją.
    </div>
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