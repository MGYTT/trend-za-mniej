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
  id:
    OfferAssistantFieldId;

  label:
    string;

  value:
    string;

  state:
    OfferAssistantFieldState;

  hint:
    string;
};

const REQUIRED_FIELDS:
  OfferAssistantFieldId[] =
  [
    "name",
    "shortName",
    "price",
    "category",
    "affiliateUrl",
  ];

function isSheinOneLink(
  value: string
) {
  try {
    return (
      new URL(
        value
      ).hostname.toLowerCase() ===
      "onelink.shein.com"
    );
  } catch {
    return false;
  }
}

function isSheinUrl(
  value: string
) {
  try {
    const host =
      new URL(
        value
      ).hostname.toLowerCase();

    return (
      host ===
        "shein.com" ||
      host.endsWith(
        ".shein.com"
      )
    );
  } catch {
    return false;
  }
}

export function getOfferAssistantFields(
  parsed: ParsedOffer
): OfferAssistantField[] {
  const nameState:
    OfferAssistantFieldState =
    !parsed.name
      ? "missing"
      : parsed.diagnostics
            .nameConfidence ===
          "low"
        ? "review"
        : "ready";

  const shortNameState:
    OfferAssistantFieldState =
    !parsed.shortName
      ? "missing"
      : nameState ===
          "review"
        ? "review"
        : "ready";

  const priceState:
    OfferAssistantFieldState =
    !parsed.price
      ? "missing"
      : parsed.diagnostics
            .priceConfidence ===
          "low"
        ? "review"
        : "ready";

  const categoryState:
    OfferAssistantFieldState =
    !parsed.category
      ? "missing"
      : parsed.diagnostics
            .categoryConfidence ===
          "high"
        ? "ready"
        : "review";

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
      id:
        "name",

      label:
        "Pełna nazwa",

      value:
        parsed.name,

      state:
        nameState,

      hint:
        !parsed.name
          ? "Nie udało się rozpoznać nazwy."
          : nameState ===
              "review"
            ? "Sprawdź, czy system wybrał właściwą nazwę produktu."
            : parsed.diagnostics
                .productType
              ? `Rozpoznano typ: ${parsed.diagnostics.productType}.`
              : "Nazwa została rozpoznana.",
    },

    {
      id:
        "shortName",

      label:
        "Krótka nazwa",

      value:
        parsed.shortName,

      state:
        shortNameState,

      hint:
        !parsed.shortName
          ? "Krótka nazwa wymaga uzupełnienia."
          : shortNameState ===
              "review"
            ? "Krótka nazwa powstała na podstawie niepewnej nazwy produktu."
            : "Krótka nazwa została przygotowana automatycznie.",
    },

    {
      id:
        "price",

      label:
        "Cena",

      value:
        parsed.price
          ? `${parsed.price} zł`
          : "",

      state:
        priceState,

      hint:
        !parsed.price
          ? "Nie znaleziono jednoznacznej ceny."
          : priceState ===
              "review"
            ? "Sprawdź rozpoznaną kwotę."
            : "Aktualna cena została rozpoznana.",
    },

    {
      id:
        "oldPrice",

      label:
        "Stara cena",

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
          ? "Sprawdź ją przed publikacją."
          : "Pole opcjonalne.",
    },

    {
      id:
        "category",

      label:
        "Kategoria",

      value:
        parsed.category,

      state:
        categoryState,

      hint:
        !parsed.category
          ? "Wybierz kategorię ręcznie."
          : parsed.diagnostics
              .productType
            ? `Rozpoznano ${parsed.diagnostics.productType}.`
            : "Kategoria została rozpoznana.",
    },

    {
      id:
        "affiliateUrl",

      label:
        "Link afiliacyjny",

      value:
        parsed.affiliateUrl,

      state:
        affiliateState,

      hint:
        !parsed.affiliateUrl
          ? "Nie znaleziono linku."
          : isSheinOneLink(
                parsed.affiliateUrl
              )
            ? "Rozpoznano SHEIN OneLink."
            : isSheinUrl(
                  parsed.affiliateUrl
                )
              ? "Rozpoznano link SHEIN — sprawdź, czy jest właściwym linkiem afiliacyjnym."
              : "Link pochodzi spoza SHEIN — sprawdź go ręcznie.",
    },

    {
      id:
        "soldText",

      label:
        "Sprzedaż",

      value:
        parsed.soldText,

      state:
        parsed.soldText
          ? "review"
          : "optional",

      hint:
        parsed.soldText
          ? "Publikuj tylko wtedy, gdy informacja jest nadal aktualna."
          : "Pole opcjonalne.",
    },
  ];
}

export function getRequiredAssistantCompletion(
  fields:
    OfferAssistantField[]
) {
  const required =
    fields.filter(
      (
        field
      ) =>
        REQUIRED_FIELDS.includes(
          field.id
        )
    );

  const detected =
    required.filter(
      (
        field
      ) =>
        field.state !==
        "missing"
    ).length;

  const ready =
    required.filter(
      (
        field
      ) =>
        field.state ===
        "ready"
    ).length;

  const review =
    required.filter(
      (
        field
      ) =>
        field.state ===
        "review"
    ).length;

  return {
    detected,

    ready,

    review,

    total:
      required.length,

    percent:
      required.length ===
        0
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
  parsed:
    ParsedOffer
) {
  const name =
    (
      parsed.name ||
      parsed.shortName
    )
      .replace(
        /\s+/g,
        " "
      )
      .replace(
        /[.!?]+$/,
        ""
      )
      .trim();

  if (
    !name
  ) {
    return "";
  }

  return `${name}. Przed zakupem sprawdź dostępne warianty, rozmiar, aktualną cenę oraz dostępność bezpośrednio w sklepie.`;
}