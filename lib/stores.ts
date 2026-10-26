import { supabase } from "@/lib/supabase";
import { getPublishedSheinCampaigns } from "@/lib/shein-campaigns";
import type { CatalogOffer } from "@/components/CouponCatalog";

export type StoreRecord = {
  slug: string; name: string; description: string;
  domains: string[]; website_url: string; category: string;
  published: boolean;
};
export type StoreCard = {
  slug: string; name: string; description: string; category: string;
  domains: string[]; websiteUrl: string;
  offerCount: number;
};
export type StoreOffer = CatalogOffer & { storeSlug: string | null };

const SHEIN: StoreCard = {
  slug: "shein", name: "SHEIN",
  description: "Kampanie modowe i kody do wyszukania ofert. Kody kampanii nie są kuponami do koszyka.",
  category: "Moda", domains: ["shein.com"], websiteUrl: "https://pl.shein.com/",
  offerCount: 0,
};
const allowedPath = (s: string) => /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(s) ? s : "/kody-rabatowe";
const today = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
type OfferRow = {
  id: string; store_slug: string | null; store_name: string; store_domains: string[];
  title: string; description: string; offer_type: StoreOffer["type"]; code: string | null;
  page_path: string; valid_until: string | null; last_verified_at: string | null;
};

export async function getPublicShopDirectory(): Promise<{
  stores: StoreCard[]; offers: StoreOffer[]; unavailable: boolean;
}> {
  const [s, c, o] = await Promise.all([
    supabase.from("extension_stores")
      .select("slug,name,description,domains,website_url,category,published")
      .eq("published", true).order("name").limit(300),
    getPublishedSheinCampaigns(),
    supabase.from("extension_offers")
      .select("id,store_slug,store_name,store_domains,title,description,offer_type,code,page_path,valid_until,last_verified_at")
      .eq("published", true).limit(500),
  ]);
  if (s.error) console.warn("Published stores:", s.error.code);
  if (o.error) console.warn("Published offers:", o.error.code);
  const current = today();
  const sheinOffers: StoreOffer[] = c.promotions.map(item => ({
    id: "shein:" + item.id, storeSlug: "shein", store: "SHEIN",
    title: item.title, description: item.description,
    type: item.codeKind === "coupon" ? "coupon" : "campaign",
    code: item.code, pagePath: "/promocje-shein",
    validUntil: null, verifiedAt: null,
  }));
  const publicStores: StoreCard[] = ((s.data || []) as StoreRecord[]).map(item => ({
    slug: item.slug, name: item.name, description: item.description,
    category: item.category, domains: item.domains,
    websiteUrl: item.website_url,
    offerCount: 0,
  }));
  const known = new Set(publicStores.map(store => store.slug));
  const others: StoreOffer[] = ((o.data || []) as OfferRow[])
    .filter(item => !item.valid_until || item.valid_until >= current)
    .filter(item => item.store_slug !== null && known.has(item.store_slug))
    .map(item => ({
      id: item.id, store: item.store_name, storeSlug: item.store_slug,
      title: item.title, description: item.description,
      type: item.offer_type, code: item.code,
      pagePath: allowedPath(item.page_path),
      validUntil: item.valid_until, verifiedAt: item.last_verified_at,
    }));
  const stores = [SHEIN, ...publicStores].map(store => ({
    ...store, offerCount: [...sheinOffers, ...others].filter(o => o.storeSlug === store.slug).length,
  }));
  return { stores, offers: [...sheinOffers, ...others], unavailable: Boolean(s.error || o.error || c.unavailable) };
}
