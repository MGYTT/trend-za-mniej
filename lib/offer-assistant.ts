import type {
  ParsedOffer,
} from "@/lib/offer-parser";

export type OfferAssistantFieldState =
  | "ready"
  | "review"
  | "missing"
  | "optional";

export type OfferAssistantFieldId =
  | "name"
  | "shortName"
  | "price"
  | "oldPrice"
  | "category"
  | "affiliateUrl"
  | "soldText";

export type OfferAssistantField = {
  id: OfferAssistantFieldId;
  label: string;
  value: string;
  state: OfferAssistantFieldState;
  hint: string;
};

const REQUIRED_FIELDS:
  OfferAssistantFieldId[] = [
    "name",
    "shortName",
    "price",
    "category",
    "affiliateUrl",
  ];

function isSheinOneLink(
  value: string
) {
  return /onelink\.shein\.com/i.test(
    value
  );
}

export function getOfferAssistantFields(
  parsed: ParsedOffer
): OfferAssistantField[] {
  const nameState:
    OfferAssistantFieldState =
    !parsed.name
      ? "missing"
      : parsed.confidence ===
          "low"
        ? "review"
        : "ready";

  const shortNameState:
    OfferAssistantFieldState =
    !parsed.shortName
      ? "missing"
      : parsed.confidence ===
          "low"
        ? "review"
        : "ready";

  const affiliateState:
    OfferAssistantFieldState =
    !parsed.affiliateUrl
      ? "missing"
      : isSheinOneLink(
            parsed.affiliateUrl
          )
        ? "ready"
        : "review";

  return [
    {
      id: "name",
      label: "Pełna nazwa",
      value: parsed.name,
      state: nameState,
      hint:
        parsed.name
          ? nameState ===
              "review"
            ? "Sprawdź, czy parser wybrał właściwą nazwę produktu."
            : "Nazwa została rozpoznana."
          : "Nie udało się rozpoznać nazwy.",
    },

    {
      id: "shortName",
      label: "Krótka nazwa",
      value: parsed.shortName,
      state:
        shortNameState,
      hint:
        parsed.shortName
          ? "Krótka nazwa została przygotowana automatycznie."
          : "Krótka nazwa wymaga uzupełnienia.",
    },

    {
      id: "price",
      label: "Cena",
      value:
        parsed.price
          ? `${parsed.price} zł`
          : "",
      state:
        parsed.price
          ? "ready"
          : "missing",
      hint:
        parsed.price
          ? "Cena została znaleziona we wklejonej treści."
          : "Nie znaleziono jednoznacznej ceny.",
    },

    {
      id: "oldPrice",
      label: "Stara cena",
      value:
        parsed.oldPrice
          ? `${parsed.oldPrice} zł`
          : "",
      state:
        parsed.oldPrice
          ? "review"
          : "optional",
      hint:
        parsed.oldPrice
          ? "Sprawdź, czy jest to rzeczywiście przekreślona lub poprzednia cena."
          : "To pole jest opcjonalne.",
    },

    {
      id: "category",
      label: "Kategoria",
      value:
        parsed.category,
      state:
        parsed.category
          ? "ready"
          : "missing",
      hint:
        parsed.category
          ? "Kategoria została dobrana na podstawie nazwy produktu."
          : "Wybierz kategorię ręcznie.",
    },

    {
      id: "affiliateUrl",
      label:
        "Link afiliacyjny",
      value:
        parsed.affiliateUrl,
      state:
        affiliateState,
      hint:
        !parsed.affiliateUrl
          ? "Nie znaleziono linku."
          : affiliateState ===
              "ready"
            ? "Rozpoznano link SHEIN OneLink."
            : "Link został znaleziony, ale warto sprawdzić czy jest właściwym linkiem afiliacyjnym.",
    },

    {
      id: "soldText",
      label: "Sprzedaż",
      value:
        parsed.soldText,
      state:
        parsed.soldText
          ? "review"
          : "optional",
      hint:
        parsed.soldText
          ? "Publikuj tę informację tylko jeśli dane są aktualne i zweryfikowane."
          : "To pole jest opcjonalne.",
    },
  ];
}

export function getRequiredAssistantCompletion(
  fields: OfferAssistantField[]
) {
  const required =
    fields.filter(
      (field) =>
        REQUIRED_FIELDS.includes(
          field.id
        )
    );

  const detected =
    required.filter(
      (field) =>
        field.state !==
        "missing"
    ).length;

  return {
    detected,

    total:
      required.length,

    percent:
      required.length === 0
        ? 0
        : Math.round(
            (
              detected /
              required.length
            ) *
              100
          ),
  };
}

export function buildSuggestedDescription(
  parsed: ParsedOffer
) {
  const fullName =
    parsed.name
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  const shortName =
    parsed.shortName
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  const base =
    fullName ||
    shortName;

  if (!base) {
    return "";
  }

  const firstSentence =
    base
      .replace(
        /[.!?]+$/,
        ""
      )
      .trim();

  return `${firstSentence}. Przed zakupem sprawdź dostępne warianty, rozmiar oraz aktualną cenę bezpośrednio w sklepie.`;
}