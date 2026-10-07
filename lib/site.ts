export const SITE_NAME =
  "Trend za Mniej";

export const SITE_DEFAULT_TITLE =
  "Moda damska, ubrania i okazje SHEIN | Trend za Mniej";

export const SITE_DESCRIPTION =
  "Trend za Mniej pomaga znaleźć modne ubrania, dodatki i okazje SHEIN. Wybrane produkty, ceny w chwili publikacji, kategorie i szybkie przejście do aktualnej oferty.";

export const SITE_LANGUAGE =
  "pl-PL";

export function getSiteUrl() {
  const customUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (customUrl) {
    return customUrl.replace(
      /\/$/,
      ""
    );
  }

  const vercelUrl =
    process.env
      .VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (vercelUrl) {
    const cleanUrl =
      vercelUrl
        .replace(
          /^https?:\/\//,
          ""
        )
        .replace(
          /\/$/,
          ""
        );

    return `https://${cleanUrl}`;
  }

  return "http://localhost:3000";
}