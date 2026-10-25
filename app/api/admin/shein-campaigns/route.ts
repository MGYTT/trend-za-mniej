import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateSheinCampaign } from "@/lib/shein-campaign-validation";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function ownerClient() {
  const supabase = await createClient();
  const { data: claims, error: claimError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (claimError || !userId) return null;
  const { data: admin, error } = await supabase
    .from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (error || admin?.role !== "owner") return null;
  return { supabase, userId };
}

async function bodyFrom(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await request.json();
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

async function save(request: NextRequest, edit: boolean) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Niedozwolone pochodzenie żądania." }, { status: 403 });
  }
  const owner = await ownerClient();
  if (!owner) return NextResponse.json({ error: "Tylko właściciel może zmieniać kampanie." }, { status: 403 });
  const body = await bodyFrom(request);
  const checked = validateSheinCampaign(body);
  if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
  const input = checked.value;
  const payload = {
    title: input.title,
    badge: input.badge,
    description: input.description,
    code: input.code,
    affiliate_url: input.affiliateUrl,
    cta_label: input.ctaLabel,
    note: input.note,
    category: input.category,
    code_kind: input.codeKind,
    sort_order: input.sortOrder,
    published: input.published,
    valid_until: input.validUntil,
    updated_at: new Date().toISOString(),
  };
  const query = edit
    ? owner.supabase.from("shein_campaigns").update(payload).eq("id", input.id)
    : owner.supabase.from("shein_campaigns").insert({
        id: input.id, ...payload, created_by: owner.userId,
      });
  const { data, error } = await query.select("id,published,updated_at").single();
  if (error || !data) {
    const conflict = error?.code === "23505";
    const missing = edit && error?.code === "PGRST116";
    return NextResponse.json({
      error: missing ? "Nie znaleziono kampanii." : conflict
        ? "Ten identyfikator lub kod już istnieje."
        : "Nie udało się zapisać kampanii. Sprawdź dane i spróbuj ponownie.",
    }, { status: missing ? 404 : conflict ? 409 : 400 });
  }
  revalidatePath("/promocje-shein");
  revalidatePath("/admin/promocje-shein");
  return NextResponse.json({ campaign: data });
}

export async function POST(request: NextRequest) {
  return save(request, false);
}
export async function PATCH(request: NextRequest) {
  return save(request, true);
}
