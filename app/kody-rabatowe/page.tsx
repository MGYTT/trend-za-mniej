import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CouponCatalog, { type CatalogOffer } from "@/components/CouponCatalog";
import { getPublishedSheinCampaigns } from "@/lib/shein-campaigns";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Kody rabatowe, kampanie i promocje sklepów | Trend za Mniej",
  description: "Znajdź aktualnie opublikowane promocje i kody w wielu sklepach. Rozróżniamy kupony w koszyku od kodów kampanii.",
  alternates: { canonical: "/kody-rabatowe" },
};
export const dynamic = "force-dynamic";

type OtherOffer = {
  id: string; store_name: string; title: string; description: string;
  offer_type: CatalogOffer["type"]; code: string | null;
  page_path: string; valid_until: string | null; last_verified_at: string | null;
};
const currentDate = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export default async function CouponsPage() {
  const [shein, generic] = await Promise.all([
    getPublishedSheinCampaigns(),
    supabase.from("extension_offers")
      .select("id,store_name,title,description,offer_type,code,page_path,valid_until,last_verified_at")
      .eq("published", true).order("created_at", { ascending: false }).limit(500),
  ]);
  const today = currentDate();
  const offers: CatalogOffer[] = [
    ...shein.promotions.map((item) => ({
      id: "shein:" + item.id, store: "SHEIN", title: item.title,
      description: item.description,
      type: item.codeKind, code: item.code, pagePath: "/promocje-shein",
      validUntil: null, verifiedAt: null,
    })),
    ...((generic.data || []) as OtherOffer[])
      .filter((item) => !item.valid_until || item.valid_until >= today)
      .map((item) => ({
        id: item.id, store: item.store_name, title: item.title,
        description: item.description, type: item.offer_type, code: item.code,
        pagePath: /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(item.page_path) ? item.page_path : "/kody-rabatowe",
        validUntil: item.valid_until, verifiedAt: item.last_verified_at,
      })),
  ];
  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <header className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">Trend za Mniej · Promocje</p>
          <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.5rem)] font-black tracking-tight">Kody i promocje wielu sklepów</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Szukaj promocji, kopiuj dostępne kody i poznaj warunki. W tej bazie znajdują się
            zarówno kupony, jak i kody kampanii — nie każdy kod obniża cenę w koszyku.
          </p>
        </div>
      </header>
      {generic.error && <p role="status" className="mx-auto mt-6 max-w-6xl px-5 text-sm text-amber-900">Oferty innych sklepów chwilowo niedostępne.</p>}
      <CouponCatalog offers={offers} />
      <SiteFooter />
    </main>
  );
}