import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lifecycleStatus, polishToday, renewalError, type LifecycleSource } from "@/lib/offer-lifecycle";

export const runtime = "nodejs";

const SHEIN_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MERCHANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type RequestBody = {
  source: LifecycleSource;
  id: string;
  action: "verify" | "extend";
  newDate: string | null;
  expectedUpdatedAt: string;
  confirmed: true;
};

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  return (!origin || origin === new URL(req.url).origin) &&
    (!site || site === "same-origin" || site === "none");
}
function parseBody(value: unknown): RequestBody | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if ((body.source !== "shein" && body.source !== "merchant") ||
    (body.action !== "verify" && body.action !== "extend") ||
    body.confirmed !== true || typeof body.id !== "string" ||
    typeof body.expectedUpdatedAt !== "string" ||
    body.expectedUpdatedAt.length > 100 || !Number.isFinite(Date.parse(body.expectedUpdatedAt)) ||
    (body.source === "shein" ? !SHEIN_ID.test(body.id) || body.id.length > 90 : !MERCHANT_ID.test(body.id)))
    return null;
  if (body.action === "extend" && typeof body.newDate !== "string") return null;
  return {
    source: body.source, action: body.action, id: body.id,
    newDate: typeof body.newDate === "string" ? body.newDate : null,
    expectedUpdatedAt: body.expectedUpdatedAt, confirmed: true,
  };
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Niedozwolone pochodzenie żądania." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "Oczekiwano JSON." }, { status: 415 });
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  const { data: admin, error: roleError } = await supabase.from("admins")
    .select("role").eq("user_id", auth.claims.sub).maybeSingle();
  if (roleError || admin?.role !== "owner")
    return NextResponse.json({ error: "Tylko właściciel może weryfikować i przedłużać oferty." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Błędny JSON." }, { status: 400 }); }
  const input = parseBody(raw);
  if (!input) return NextResponse.json({ error: "Nieprawidłowe dane lub brak potwierdzenia." }, { status: 400 });

  const table = input.source === "shein" ? "shein_campaigns" : "extension_offers";
  const { data: record, error: readError } = await supabase.from(table)
    .select("id,published,valid_until,updated_at").eq("id", input.id).maybeSingle();
  if (readError) return NextResponse.json({ error: "Nie można sprawdzić oferty." }, { status: 500 });
  if (!record) return NextResponse.json({ error: "Nie znaleziono oferty." }, { status: 404 });
  if (record.updated_at !== input.expectedUpdatedAt)
    return NextResponse.json({ error: "Oferta została już zmieniona. Odśwież panel." }, { status: 409 });

  const today = polishToday();
  const state = lifecycleStatus({ published: record.published, validUntil: record.valid_until }, today);
  const now = new Date().toISOString();
  let patch: Record<string, string | boolean>;
  if (input.action === "extend") {
    const error = renewalError({ published: record.published, validUntil: record.valid_until }, input.newDate || "", today);
    if (error) return NextResponse.json({ error }, { status: 400 });
    patch = { valid_until: input.newDate!, updated_at: now,
      // Never silently republish drafts or records disabled by cron.
      published: record.published };
  } else {
    if (state === "expired")
      return NextResponse.json({ error: "Wygasłą ofertę najpierw przedłuż i opublikuj w edytorze." }, { status: 400 });
    patch = { updated_at: now };
  }
  if (input.source === "shein") patch.last_reviewed_at = now;
  else patch.last_verified_at = now;

  const { data: updated, error: writeError } = await supabase.from(table)
    .update(patch)
    .eq("id", input.id)
    .eq("updated_at", input.expectedUpdatedAt)
    .select("id,valid_until,published,updated_at").maybeSingle();
  if (writeError) return NextResponse.json({ error: "Nie udało się zapisać zmian." }, { status: 400 });
  if (!updated) return NextResponse.json({ error: "Oferta zmieniła się w międzyczasie. Odśwież panel." }, { status: 409 });

  revalidatePath("/admin/terminy-promocji");
  revalidatePath("/admin/kody-rabatowe");
  revalidatePath("/admin/promocje-shein");
  revalidatePath("/kody-rabatowe");
  if (input.source === "shein") {
    revalidatePath("/promocje-shein");
    revalidatePath("/kody-rabatowe/shein");
  } else {
    const { data: store } = await supabase.from("extension_offers")
      .select("store_slug").eq("id", input.id).maybeSingle();
    if (store?.store_slug) revalidatePath("/kody-rabatowe/" + store.store_slug);
  }
  return NextResponse.json({ success: true, record: updated,
    notice: input.action === "extend" && !updated.published
      ? "Data przedłużona. Oferta pozostaje nieopublikowana — opublikuj ją osobno w edytorze."
      : input.action === "extend" ? "Zapisano nową datę i potwierdzono weryfikację."
        : "Potwierdzono ponowną weryfikację." });
}
