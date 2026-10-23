export const SITE_NAME =
  "Trend za Mniej";

export const SITE_DEFAULT_TITLE =
  "Stylizacje damskie i poradniki modowe | Trend za Mniej";

export const SITE_DESCRIPTION =
  "Gotowe stylizacje damskie do 100–200 zł, praktyczne poradniki i produkty SHEIN. Poznaj skład zestawów, porównaj budżety i sprawdź ceny u sprzedawcy.";

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

  return "https://trendzamniej.pl";
}