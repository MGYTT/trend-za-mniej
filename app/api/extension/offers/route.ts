import { NextResponse } from "next/server";
import { getPublicShopDirectory } from "@/lib/stores";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=0, s-maxage=120",
};
export async function OPTIONS() { return new Response(null, { status: 204, headers }); }
export async function GET() {
  const { stores, offers, unavailable } = await getPublicShopDirectory();
  if (unavailable && stores.length === 0)
    return NextResponse.json({ error: "Katalog chwilowo niedostępny." },
      { status: 503, headers: { ...headers, "Cache-Control": "no-store" } });
  return NextResponse.json({
    version: 2,
    generatedAt: new Date().toISOString(),
    stores: stores.map(s => ({
      slug: s.slug, name: s.name, category: s.category, domains: s.domains,
      offerCount: s.offerCount, websiteUrl: s.websiteUrl,
      pageUrl: new URL("/kody-rabatowe/" + s.slug, getSiteUrl()).toString(),
    })),
    offers: offers.map(o => {
      const store = stores.find(s => s.slug === o.storeSlug);
      return {
        id: o.id, store: o.store, storeSlug: o.storeSlug,
        domains: store?.domains ?? [], title: o.title,
        description: o.description, type: o.type, code: o.code,
        pageUrl: new URL("/kody-rabatowe/" + (o.storeSlug ?? ""), getSiteUrl()).toString(),
        validUntil: o.validUntil, verifiedAt: o.verifiedAt,
      };
    }),
  }, { headers });
}
