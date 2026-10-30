import { supabase } from "@/lib/supabase";
import type { SheinPromotion } from "@/lib/shein-promotions";
import type { CampaignCategory } from "@/lib/shein-campaign-validation";
import { SHEIN_PROMOTIONS_UPDATED_AT } from "@/lib/shein-promotions";

export type CampaignClickCounts = Record<string, { last7: number; last30: number }>;

export type SheinCampaignRow = {
  id: string; title: string; badge: string; description: string; code: string;
  affiliate_url: string; cta_label: string; note: string; category: CampaignCategory;
  code_kind: "campaign" | "coupon"; sort_order: number; published: boolean;
  valid_until: string | null; last_reviewed_at: string | null;
  created_at: string; updated_at: string;
};

export function campaignToPromotion(row: SheinCampaignRow): SheinPromotion {
  return {
    id: row.id,
    title: row.title,
    badge: row.badge,
    description: row.description,
    code: row.code,
    affiliateUrl: row.affiliate_url,
    ctaLabel: row.cta_label,
    note: row.note,
    category: row.category,
    codeKind: row.code_kind,
    sortOrder: row.sort_order,
  };
}

/** Public uses only database rows permitted by RLS; hidden codes never reappear from a stale fallback. */
export async function getPublishedSheinCampaigns(): Promise<{
  promotions: SheinPromotion[];
  updatedAt: string;
  unavailable: boolean;
}> {
  const { data, error } = await supabase
    .from("shein_campaigns")
    .select("id,title,badge,description,code,affiliate_url,cta_label,note,category,code_kind,sort_order,published,valid_until,last_reviewed_at,created_at,updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Unable to fetch published SHEIN campaigns:", error.message);
    return { promotions: [], updatedAt: SHEIN_PROMOTIONS_UPDATED_AT, unavailable: true };
  }
  const rows = (data ?? []) as SheinCampaignRow[];
  // RLS excludes expired offers as well; this is additional defense in depth.
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  // Publication and expiration determine visibility. A missing review timestamp
  // is NOT an automatic deletion: legacy published campaigns may not have one.
  // Preserve them and explicitly disclose their verification status in the UI.
  const reviewCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const current = rows.filter((row) => !row.valid_until || row.valid_until >= today);
  const latest = current.reduce((last, row) => (
    Date.parse(row.updated_at) > Date.parse(last) ? row.updated_at : last
  ), SHEIN_PROMOTIONS_UPDATED_AT);
  return {
    promotions: current.map((row) => ({
      ...campaignToPromotion(row),
      reviewedRecently: row.last_reviewed_at !== null &&
        Number.isFinite(Date.parse(row.last_reviewed_at)) &&
        Date.parse(row.last_reviewed_at) >= reviewCutoff,
    })),
    updatedAt: latest,
    unavailable: false,
  };
}
