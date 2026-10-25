import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

function safeCampaignUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "onelink.shein.com" ||
        url.username || url.password || url.port || url.search || url.hash ||
        !/^\/[0-9]+\/[a-z0-9]+$/.test(url.pathname)) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function warsawDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date());
}

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const fallback = new URL("/promocje-shein", request.url);
  const cacheControl = { "Cache-Control": "private, no-store, max-age=0" };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 90) {
    return NextResponse.redirect(fallback, { status: 302, headers: cacheControl });
  }

  // Public RLS excludes drafts and expired campaigns. Never resolve the
  // destination from untrusted query parameters or the archived file catalog.
  const { data: campaign, error } = await supabase
    .from("shein_campaigns")
    .select("id,affiliate_url,published,valid_until")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error || !campaign || (campaign.valid_until && campaign.valid_until < warsawDate())) {
    return NextResponse.redirect(fallback, { status: 302, headers: cacheControl });
  }

  const destination = safeCampaignUrl(campaign.affiliate_url);
  if (!destination) {
    console.error("Invalid outbound SHEIN campaign URL:", id);
    return NextResponse.redirect(fallback, { status: 302, headers: cacheControl });
  }

  // Store only campaign and timestamp (default in DB). Tracking failure must
  // never prevent an otherwise valid affiliate redirect.
  try {
    const { error: trackingError } = await createAdminClient()
      .from("shein_campaign_clicks")
      .insert({ campaign_id: campaign.id });
    if (trackingError) console.error("SHEIN click tracking error:", trackingError.message);
  } catch (trackingError) {
    console.error("SHEIN click tracking unavailable:", trackingError);
  }

  return NextResponse.redirect(destination, { status: 302, headers: cacheControl });
}
