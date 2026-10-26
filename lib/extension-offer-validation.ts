export type ExtensionOfferInput = {
  id: string | null;
  storeName: string;
  storeSlug: string | null;
  storeDomains: string[];
  title: string;
  description: string;
  offerType: "coupon" | "campaign" | "promotion";
  code: string | null;
  pagePath: string;
  destinationUrl: string | null;
  published: boolean;
  verified: boolean;
  validUntil: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMAIN = /^(?!-)[a-z0-9-]{1,63}(?:\.[a-z0-9-]{1,63})+$/;
const PAGE_PATH = /^\/(?!\/)[a-zA-Z0-9/_-]*$/;

export function validCalendarDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(day + "T12:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

export function validateExtensionOffer(raw: unknown):
  | { value: ExtensionOfferInput }
  | { error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return { error: "Nieprawidłowy formularz." };
  const o = raw as Record<string, unknown>;
  const str = (field: string) => typeof o[field] === "string" ? (o[field] as string).trim() : "";
  const id = o.id === null || o.id === undefined || o.id === "" ? null : str("id");
  if (id !== null && !UUID.test(id)) return { error: "Nieprawidłowe ID oferty." };
  const storeName = str("storeName");
  const storeSlug = str("storeSlug") || null;
  if (storeSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(storeSlug)) return { error: "Nieprawidłowy identyfikator sklepu." };
  const title = str("title");
  const description = str("description");
  if (storeName.length < 2 || storeName.length > 120) return { error: "Nazwa sklepu: 2–120 znaków." };
  if (title.length < 5 || title.length > 180) return { error: "Tytuł: 5–180 znaków." };
  if (description.length > 1500) return { error: "Opis jest za długi." };
  const domains = Array.isArray(o.storeDomains) ? o.storeDomains : str("storeDomains").split(/[,;\s]+/);
  if (!Array.isArray(domains) || domains.length === 0 || domains.length > 12 ||
      !domains.every((v) => typeof v === "string"))
    return { error: "Dodaj 1–12 domen sklepów." };
  const storeDomains = [...new Set((domains as string[]).map((v) => v.toLowerCase().replace(/^www\./, "").trim()))];
  if (storeDomains.length === 0 || storeDomains.some((v) => !DOMAIN.test(v)))
    return { error: "Nieprawidłowa domena. Podaj np. sklep.pl, bez https://." };
  const offerType = str("offerType");
  if (!["coupon", "campaign", "promotion"].includes(offerType))
    return { error: "Nieprawidłowy typ promocji." };
  const code = str("code") || null;
  if (code && (code.length > 90 || /\s/.test(code)))
    return { error: "Kod nie może mieć spacji ani więcej niż 90 znaków." };
  if (offerType !== "promotion" && (!code || code.length < 2))
    return { error: "Ten typ promocji wymaga kodu." };
  const pagePath = str("pagePath") || "/kody-rabatowe";
  if (!PAGE_PATH.test(pagePath)) return { error: "Podaj bezpieczną ścieżkę na Trendzamniej, np. /kody-rabatowe." };
  const destinationUrl = o.destinationUrl === null || o.destinationUrl === undefined || o.destinationUrl === "" ? null : str("destinationUrl");
  if (destinationUrl !== null) {
    try {
      const u = new URL(destinationUrl);
      if (u.protocol !== "https:" || u.username || u.password || u.port ||
        destinationUrl.length > 2000) return { error: "Link musi używać HTTPS i nie może zawierać danych logowania." };
    } catch { return { error: "Nieprawidłowy link oferty." }; }
  }
  const validUntil = o.validUntil == null || o.validUntil === "" ? null : str("validUntil");
  if (validUntil !== null && !validCalendarDay(validUntil))
    return { error: "Nieprawidłowa data ważności." };
  if (typeof o.published !== "boolean" || typeof o.verified !== "boolean")
    return { error: "Nieprawidłowe pola publikacji lub weryfikacji." };
  if (o.published && !storeSlug) return { error: "Wybierz zapisany sklep przed publikacją." };
  if (o.published && !o.verified)
    return { error: "Przed publikacją potwierdź sprawdzenie oferty i warunków." };
  if (o.published && validUntil && validUntil < new Date().toISOString().slice(0, 10))
    return { error: "Nie publikuj wygasłej oferty." };
  return { value: {
    id, storeName, storeSlug, storeDomains, title, description,
    offerType: offerType as ExtensionOfferInput["offerType"],
    code: offerType === "promotion" ? null : code,
    pagePath, destinationUrl, published: o.published, verified: o.verified, validUntil,
  } };
}