export const SITE_NAME =
  "Trend za Mniej";

export const SITE_DESCRIPTION =
  "Modne ubrania, dodatki, promocje i najlepsze okazje w jednym miejscu.";

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
    const cleanUrl = vercelUrl
      .replace(
        /^https?:\/\//,
        ""
      )
      .replace(/\/$/, "");

    return `https://${cleanUrl}`;
  }

  return "http://localhost:3000";
}