/** Shared Poland-local lifecycle rules for SHEIN campaigns and multi-store promotions. */
export type LifecycleSource = "shein" | "merchant";
export type LifecycleStatus = "active" | "expiring" | "expired" | "draft";
export type LifecycleFilter = "all" | LifecycleStatus;

export type LifecycleRow = {
  id: string;
  source: LifecycleSource;
  store: string;
  title: string;
  published: boolean;
  validUntil: string | null;
  updatedAt: string;
  verifiedAt: string | null;
};

export function polishToday(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function validOfferDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function daysUntil(date: string, today: string): number {
  const parsed = Date.parse(date + "T12:00:00Z") - Date.parse(today + "T12:00:00Z");
  return Math.round(parsed / 86400000);
}

/** Expired takes priority over draft, including offers disabled by Supabase cron. */
export function lifecycleStatus(
  row: Pick<LifecycleRow, "published" | "validUntil">,
  today: string,
): LifecycleStatus {
  if (row.validUntil && row.validUntil < today) return "expired";
  if (!row.published) return "draft";
  if (row.validUntil && daysUntil(row.validUntil, today) <= 3) return "expiring";
  return "active";
}

export function renewalError(
  row: Pick<LifecycleRow, "published" | "validUntil">,
  newDate: string,
  today: string,
): string | null {
  if (!validOfferDay(newDate) || newDate <= today)
    return "Nowa data musi przypadać po dzisiejszym dniu.";
  if (!row.validUntil) return "Ta oferta nie ma daty końcowej.";
  if (newDate <= row.validUntil) return "Nowa data musi być późniejsza niż poprzednia.";
  const state = lifecycleStatus(row, today);
  if (state !== "expiring" && state !== "expired")
    return "Można szybko przedłużyć tylko ofertę wygasającą lub wygasłą.";
  return null;
}
