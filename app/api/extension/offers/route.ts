import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

// Public catalog: no cookies, logins, personalized tracking or affiliate links.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=0, s-maxage=120",
};

type Row = {
  id: string; store_name: string; store_domains: string[];
  title: string; description: string; offer_type: string;
  code: string | null; page_path: string; valid_until: string | null;
  last_verified_at: string | null;
};
type Shein = {
  id: string; title: string; description: string; code: string;
  code_kind: string; valid_until: string | null; last_reviewed_at: string | null;
};

function pageUrl(path: string) {
  return new URL(/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(path) ? path : "/", getSiteUrl()).toString();
}

function currentDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export async function GET() {
  const [campaignResult, offerResult] = await Promise.all([
    supabase.from("shein_campaigns")
      .select("id,title,description,code,code_kind,valid_until,last_reviewed_at")
      .eq("published", true).limit(300),
    supabase.from("extension_offers")
      .select("id,store_name,store_domains,title,description,offer_type,code,page_path,valid_until,last_verified_at")
      .eq("published", true).limit(500),
  ]);
  if (campaignResult.error) console.warn("Extension SHEIN read:", campaignResult.error.code);
  if (offerResult.error) console.warn("Extension offers read:", offerResult.error.code);
  if (campaignResult.error && offerResult.error)
    return NextResponse.json({ error: "Oferty chwilowo niedostępne." }, {
      status: 503, headers: { ...headers, "Cache-Control": "no-store" },
    });
  const today = currentDate();
  const fresh = (date: string | null) => !date || date >= today;
  const campaigns = ((campaignResult.data || []) as Shein[])
    .filter((o) => fresh(o.valid_until))
    .map((o) => ({
      id: "shein:" + o.id, store: "SHEIN", domains: ["shein.com"],
      title: o.title, description: o.description,
      type: o.code_kind === "coupon" ? "coupon" : "campaign",
      code: o.code, pageUrl: pageUrl("/promocje-shein"),
      validUntil: o.valid_until, verifiedAt: o.last_reviewed_at,
    }));
  const offers = ((offerResult.data || []) as Row[])
    .filter((o) => fresh(o.valid_until))
    .map((o) => ({
      id: "other:" + o.id, store: o.store_name, domains: o.store_domains,
      title: o.title, description: o.description,
      type: o.offer_type, code: o.code, pageUrl: pageUrl(o.page_path),
      validUntil: o.valid_until, verifiedAt: o.last_verified_at,
    }));
  const all = [...campaigns, ...offers].sort((a, b) =>
    a.store.localeCompare(b.store, "pl") || a.title.localeCompare(b.title, "pl"));
  return NextResponse.json({ version: 1, generatedAt: new Date().toISOString(), offers: all }, { headers });
}