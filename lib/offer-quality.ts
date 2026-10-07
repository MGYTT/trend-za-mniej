export type OfferQualityInput = {
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice: string;
  affiliateUrl: string;
  soldText: string;
  imageSelected: boolean;
};

export type OfferQualityIssue = {
  id: string;
  message: string;
};

function parsePrice(
  value: string
) {
  const normalized =
    value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function getHostname(
  value: string
) {
  try {
    return new URL(
      value.trim()
    ).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function getOfferQualityIssues(
  input: OfferQualityInput
): OfferQualityIssue[] {
  const issues: OfferQualityIssue[] =
    [];

  const price =
    parsePrice(
      input.price
    );

  const oldPrice =
    parsePrice(
      input.oldPrice
    );

  if (
    input.price.trim() &&
    (
      price === null ||
      price <= 0
    )
  ) {
    issues.push({
      id: "invalid-price",
      message:
        "Cena wygląda na niepoprawną. Sprawdź wpisaną wartość.",
    });
  }

  if (
    price !== null &&
    price > 0 &&
    price < 5
  ) {
    issues.push({
      id: "very-low-price",
      message:
        "Cena jest bardzo niska. Upewnij się, że nie brakuje cyfry.",
    });
  }

  if (
    input.oldPrice.trim() &&
    oldPrice !== null &&
    price !== null &&
    oldPrice <= price
  ) {
    issues.push({
      id: "old-price",
      message:
        "Stara cena powinna być wyższa od aktualnej ceny.",
    });
  }

  if (
    input.description.trim() &&
    input.description
      .trim()
      .length < 80
  ) {
    issues.push({
      id: "short-description",
      message:
        "Opis jest dość krótki. Warto dodać kilka informacji o fasonie, zastosowaniu lub stylu.",
    });
  }

  if (
    input.shortName
      .trim()
      .length > 70
  ) {
    issues.push({
      id: "long-short-name",
      message:
        "Krótka nazwa ma ponad 70 znaków i może wyglądać źle na kafelku produktu.",
    });
  }

  if (
    input.name.trim() &&
    input.name
      .trim()
      .length < 8
  ) {
    issues.push({
      id: "short-name",
      message:
        "Pełna nazwa produktu wygląda na bardzo krótką.",
    });
  }

  if (
    input.affiliateUrl.trim()
  ) {
    const hostname =
      getHostname(
        input.affiliateUrl
      );

    if (!hostname) {
      issues.push({
        id: "invalid-url",
        message:
          "Link afiliacyjny nie wygląda jak poprawny adres internetowy.",
      });
    } else if (
      hostname !==
        "onelink.shein.com"
    ) {
      issues.push({
        id: "unexpected-domain",
        message:
          "Link nie prowadzi przez onelink.shein.com. Sprawdź, czy to na pewno właściwy link afiliacyjny SHEIN.",
      });
    }
  }

  if (
    input.soldText.trim()
  ) {
    issues.push({
      id: "sales-data",
      message:
        "Wpisałeś informację o liczbie sprzedaży. Publikuj ją tylko wtedy, gdy jest aktualna i została zweryfikowana.",
    });
  }

  if (
    (
      input.name.trim() ||
      input.price.trim() ||
      input.affiliateUrl.trim()
    ) &&
    !input.imageSelected
  ) {
    issues.push({
      id: "missing-image",
      message:
        "Oferta nie ma jeszcze zdjęcia produktu.",
    });
  }

  return issues;
}