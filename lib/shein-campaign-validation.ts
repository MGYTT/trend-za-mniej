export const CAMPAIGN_CATEGORIES = [
  "new-users", "fashion", "beauty", "accessories", "home", "kids", "sale",
] as const;
export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];
export type CodeKind = "campaign" | "coupon";

export type CampaignInput = {
  id: string; title: string; badge: string; description: string; code: string;
  affiliateUrl: string; ctaLabel: string; note: string; category: CampaignCategory;
  codeKind: CodeKind; sortOrder: number; published: boolean; validUntil: string | null;
};

export function validateSheinCampaign(input: unknown):
  | { value: CampaignInput }
  | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Nieprawidłowe dane kampanii." };
  }
  const raw = input as Record<string, unknown>;
  const field = (name: string, min: number, max: number) => {
    const value = raw[name];
    return typeof value === "string" && value.trim().length >= min && value.trim().length <= max
      ? value.trim() : null;
  };
  const id = field("id", 5, 90);
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return { error: "Adres kampanii: 5–90 znaków (małe litery, cyfry i myślniki)." };
  }
  const title = field("title", 8, 160);
  const badge = field("badge", 2, 75);
  const description = field("description", 10, 1200);
  const note = field("note", 15, 1000);
  const ctaLabel = field("ctaLabel", 5, 90);
  if (!title || !badge || !description || !note || !ctaLabel) {
    return { error: "Wypełnij tytuł, etykietę, opis, warunki i tekst przycisku." };
  }
  const code = field("code", 4, 14)?.toUpperCase();
  if (!code || !/^[A-Z0-9]{4,14}$/.test(code)) {
    return { error: "Kod musi zawierać 4–14 liter A–Z lub cyfr." };
  }
  let affiliateUrl: string;
  try {
    affiliateUrl = new URL(String(raw.affiliateUrl)).href;
    const url = new URL(affiliateUrl);
    if (url.protocol !== "https:" || url.hostname !== "onelink.shein.com" ||
        !/^\/[0-9]+\/[a-z0-9]+$/.test(url.pathname) || url.username || url.password ||
        url.port || url.search || url.hash) throw Error("invalid link");
  } catch {
    return { error: "Podaj prawidłowy link afiliacyjny https://onelink.shein.com/..." };
  }
  if (!CAMPAIGN_CATEGORIES.includes(raw.category as CampaignCategory)) {
    return { error: "Wybierz prawidłową kategorię." };
  }
  if (raw.codeKind !== "campaign" && raw.codeKind !== "coupon") {
    return { error: "Wybierz rodzaj kodu: kampanii lub kupon." };
  }
  if (!Number.isInteger(raw.sortOrder) || (raw.sortOrder as number) < 0 ||
      (raw.sortOrder as number) > 9999) {
    return { error: "Kolejność musi być liczbą całkowitą od 0 do 9999." };
  }
  if (typeof raw.published !== "boolean") {
    return { error: "Nieprawidłowy stan publikacji." };
  }
  const validUntil = raw.validUntil === "" || raw.validUntil == null ? null : raw.validUntil;
  if (validUntil !== null && (
    typeof validUntil !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(validUntil) ||
    !Number.isFinite(Date.parse(validUntil + "T00:00:00Z")) ||
    new Date(validUntil + "T00:00:00Z").toISOString().slice(0, 10) !== validUntil
  )) {
    return { error: "Data końca musi mieć format RRRR-MM-DD." };
  }
  return {
    value: {
      id, title, badge, description, note, ctaLabel, code, affiliateUrl,
      category: raw.category as CampaignCategory, codeKind: raw.codeKind as CodeKind,
      sortOrder: raw.sortOrder as number, published: raw.published,
      validUntil: validUntil as string | null,
    },
  };
}
