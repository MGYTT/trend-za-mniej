export const WELCOME_THEME_OPTIONS = ["peach", "rose", "lavender"] as const;
export type WelcomeTheme = typeof WELCOME_THEME_OPTIONS[number];

export type WelcomeSheinSettings = {
  enabled: boolean;
  eyebrow: string;
  greeting: string;
  headline: string;
  discountPercent: number;
  discountPrefix: string;
  discountSuffix: string;
  audience: string;
  instruction: string;
  campaignCode: string;
  affiliateUrl: string;
  ctaLabel: string;
  dismissLabel: string;
  extraNote: string;
  theme: WelcomeTheme;
  delaySeconds: number;
  campaignVersion: number;
  validUntil: string | null;
};

export const DEFAULT_WELCOME_SHEIN: WelcomeSheinSettings = {
  enabled: true,
  eyebrow: "🎁 Oferta powitalna SHEIN",
  greeting: "Gratulacje! 🎉",
  headline: "Ekskluzywna oferta dla Ciebie! 🎁",
  discountPercent: 60,
  discountPrefix: "Do",
  discountSuffix: "zniżki",
  audience: "Tylko dla kwalifikujących się nowych użytkowników",
  instruction: "🌟 Wyszukaj poniższy kod w aplikacji SHEIN, aby sprawdzić ofertę:",
  campaignCode: "SBNSL5D",
  affiliateUrl: "https://onelink.shein.com/58/66hx4q3nwzrl",
  ctaLabel: "Sprawdź ofertę w SHEIN",
  dismissLabel: "Nie teraz, przeglądaj stylizacje",
  extraNote: "",
  theme: "peach",
  delaySeconds: 10,
  campaignVersion: 1,
  validUntil: null,
};

export const WELCOME_AFFILIATE_DISCLOSURE =
  "Link afiliacyjny. Kod do wyszukania oferty nie gwarantuje rabatu w koszyku. " +
  "Wysokość zniżki, kwalifikacja konta i pozostałe warunki zależą od SHEIN.";

const VALID_CODES = /^[A-Z0-9]{4,14}$/;
const validDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + "T12:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
};

export function validateWelcomeSheinSettings(raw: unknown):
  | { value: WelcomeSheinSettings }
  | { error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Nieprawidłowe ustawienia oferty." };
  const input = raw as Record<string, unknown>;
  if (typeof input.enabled !== "boolean") return { error: "Wybierz stan włączenia oferty." };
  const ranges: Record<string, [number, number]> = {
    eyebrow: [3, 90], greeting: [3, 100], headline: [5, 150],
    discountPrefix: [1, 12], discountSuffix: [1, 24],
    audience: [5, 200], instruction: [10, 300],
    ctaLabel: [5, 100], dismissLabel: [5, 100], extraNote: [0, 400],
  };
  const strings: Record<string, string> = {};
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (typeof input[key] !== "string") return { error: "Brakuje pola: " + key };
    const value = (input[key] as string).trim();
    if (value.length < min || value.length > max) return { error: "Pole " + key + " musi mieć " + min + "–" + max + " znaków." };
    strings[key] = value;
  }
  const campaignCode = typeof input.campaignCode === "string" ? input.campaignCode.trim().toUpperCase() : "";
  if (!VALID_CODES.test(campaignCode)) return { error: "Kod SHEIN: od 4 do 14 liter A–Z lub cyfr." };
  const affiliateUrl = typeof input.affiliateUrl === "string" ? input.affiliateUrl.trim() : "";
  try {
    const u = new URL(affiliateUrl);
    if (u.protocol !== "https:" || u.hostname !== "onelink.shein.com" ||
        !/^\/[0-9]+\/[a-z0-9]+$/.test(u.pathname) ||
        u.username || u.password || u.port || u.search || u.hash ||
        affiliateUrl !== u.href) throw Error("unsafe");
  } catch {
    return { error: "Link musi prowadzić do https://onelink.shein.com/NUMER/KOD, bez parametrów i przekierowań." };
  }
  const theme = input.theme;
  if (theme !== "peach" && theme !== "rose" && theme !== "lavender")
    return { error: "Wybierz jeden z dostępnych motywów kolorystycznych." };
  const discountPercent = input.discountPercent;
  const delaySeconds = input.delaySeconds;
  const campaignVersion = input.campaignVersion;
  if (!Number.isInteger(discountPercent) || (discountPercent as number) < 1 || (discountPercent as number) > 100)
    return { error: "Rabat musi być liczbą od 1 do 100%." };
  if (!Number.isInteger(delaySeconds) || (delaySeconds as number) < 3 || (delaySeconds as number) > 60)
    return { error: "Opóźnienie wyświetlania: 3–60 sekund." };
  if (!Number.isInteger(campaignVersion) || (campaignVersion as number) < 1 || (campaignVersion as number) > 1000000)
    return { error: "Nieprawidłowa wersja kampanii." };
  const validUntil = input.validUntil === "" || input.validUntil === null ? null : input.validUntil;
  if (validUntil !== null && (typeof validUntil !== "string" || !validDate(validUntil)))
    return { error: "Podaj poprawną datę zakończenia albo pozostaw pole puste." };

  return {
    value: {
      enabled: input.enabled,
      eyebrow: strings.eyebrow,
      greeting: strings.greeting,
      headline: strings.headline,
      discountPercent: discountPercent as number,
      discountPrefix: strings.discountPrefix,
      discountSuffix: strings.discountSuffix,
      audience: strings.audience,
      instruction: strings.instruction,
      campaignCode,
      affiliateUrl,
      ctaLabel: strings.ctaLabel,
      dismissLabel: strings.dismissLabel,
      extraNote: strings.extraNote,
      theme,
      delaySeconds: delaySeconds as number,
      campaignVersion: campaignVersion as number,
      validUntil: validUntil as string | null,
    },
  };
}

export function mapWelcomeRow(row: Record<string, unknown>): WelcomeSheinSettings {
  return {
    enabled: row.enabled as boolean,
    eyebrow: row.eyebrow as string,
    greeting: row.greeting as string,
    headline: row.headline as string,
    discountPercent: row.discount_percent as number,
    discountPrefix: row.discount_prefix as string,
    discountSuffix: row.discount_suffix as string,
    audience: row.audience as string,
    instruction: row.instruction as string,
    campaignCode: row.campaign_code as string,
    affiliateUrl: row.affiliate_url as string,
    ctaLabel: row.cta_label as string,
    dismissLabel: row.dismiss_label as string,
    extraNote: row.extra_note as string,
    theme: row.theme as WelcomeTheme,
    delaySeconds: row.delay_seconds as number,
    campaignVersion: row.campaign_version as number,
    validUntil: (row.valid_until as string | null) ?? null,
  };
}

export function welcomeSettingsToRow(value: WelcomeSheinSettings, userId: string) {
  return {
    enabled: value.enabled,
    eyebrow: value.eyebrow,
    greeting: value.greeting,
    headline: value.headline,
    discount_percent: value.discountPercent,
    discount_prefix: value.discountPrefix,
    discount_suffix: value.discountSuffix,
    audience: value.audience,
    instruction: value.instruction,
    campaign_code: value.campaignCode,
    affiliate_url: value.affiliateUrl,
    cta_label: value.ctaLabel,
    dismiss_label: value.dismissLabel,
    extra_note: value.extraNote,
    theme: value.theme,
    delay_seconds: value.delaySeconds,
    campaign_version: value.campaignVersion,
    valid_until: value.validUntil,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
}
