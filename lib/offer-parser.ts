export type ParsedOffer = {
  name: string;
  price: string;
  oldPrice: string;
  affiliateUrl: string;
};

function normalizePrice(
  value: string
) {
  return value
    .replace(/\s/g, "")
    .replace(".", ",");
}

function cleanLine(
  value: string
) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

export function parseOfferText(
  text: string
): ParsedOffer {
  const normalizedText =
    text.replace(/\r/g, "");

  const lines =
    normalizedText
      .split("\n")
      .map(cleanLine)
      .filter(Boolean);

  const urlMatch =
    normalizedText.match(
      /https?:\/\/[^\s<>"']+/i
    );

  const affiliateUrl =
    urlMatch?.[0]
      ?.replace(
        /[),.;]+$/,
        ""
      ) ?? "";

  const pricePatterns = [
    /(?:cena|price)\s*[:=\[]?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:zł|pln)?\]?/i,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:zł|pln)/i,
  ];

  let price = "";

  for (
    const pattern of
    pricePatterns
  ) {
    const match =
      normalizedText.match(
        pattern
      );

    if (match?.[1]) {
      price =
        normalizePrice(
          match[1]
        );

      break;
    }
  }

  const oldPricePatterns = [
    /(?:stara cena|cena regularna|regularna cena|old price)\s*[:=\[]?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:zł|pln)?\]?/i,
    /(?:było|przedtem)\s*[:=]?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:zł|pln)/i,
  ];

  let oldPrice = "";

  for (
    const pattern of
    oldPricePatterns
  ) {
    const match =
      normalizedText.match(
        pattern
      );

    if (match?.[1]) {
      oldPrice =
        normalizePrice(
          match[1]
        );

      break;
    }
  }

  const ignoredLinePatterns = [
    /^https?:\/\//i,
    /^cena\b/i,
    /^price\b/i,
    /^stara cena\b/i,
    /^cena regularna\b/i,
    /^kupon\b/i,
    /^kod\b/i,
    /^rabat\b/i,
    /^link\b/i,
    /^affiliate\b/i,
    /^promocja\b/i,
    /^sprzedano\b/i,
    /^sold\b/i,
  ];

  const name =
    lines.find(
      (line) => {
        if (
          ignoredLinePatterns.some(
            (pattern) =>
              pattern.test(
                line
              )
          )
        ) {
          return false;
        }

        if (
          /^(\d+(?:[.,]\d{1,2})?)\s*(?:zł|pln)$/i.test(
            line
          )
        ) {
          return false;
        }

        return (
          line.length >= 5
        );
      }
    ) ?? "";

  return {
    name,
    price,
    oldPrice,
    affiliateUrl,
  };
}