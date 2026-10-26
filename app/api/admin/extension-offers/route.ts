import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateExtensionOffer } from "@/lib/extension-offer-validation";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (!origin || origin === new URL(request.url).origin) &&
    (!fetchSite || ["same-origin", "none"].includes(fetchSite));
}

async function ownerClient() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (error || !userId) return null;
  const { data: admin } = await supabase.from("admins")
    .select("role").eq("user_id", userId).maybeSingle();
  return admin?.role === "owner" ? { supabase, userId } : null;
}

async function save(request: NextRequest, edit: boolean) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Niedozwolone pochodzenie." }, { status: 403 });
  const owner = await ownerClient();
  if (!owner) return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Błędny JSON." }, { status: 400 }); }
  const checked = validateExtensionOffer(body);
  if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
  const input = checked.value;
  if (edit && !input.id) return NextResponse.json({ error: "Brak ID." }, { status: 400 });
  if (!edit && input.id) return NextResponse.json({ error: "Nowy wpis nie może mieć ID." }, { status: 400 });
  const payload = {
    store_name: input.storeName, store_domains: input.storeDomains,
    store_slug: input.storeSlug,
    title: input.title, description: input.description,
    offer_type: input.offerType, code: input.code,
    page_path: input.pagePath, published: input.published,
    valid_until: input.validUntil,
    last_verified_at: input.verified ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const query = edit
    ? owner.supabase.from("extension_offers").update(payload).eq("id", input.id!)
    : owner.supabase.from("extension_offers").insert({ ...payload, created_by: owner.userId });
  const { data, error } = await query.select("id").single();
  if (error || !data) {
    console.warn("Extension offer save:", error?.code);
    return NextResponse.json({ error: "Zapis nie powiódł się. Sprawdź dane lub migrację bazy." }, { status: 400 });
  }
  revalidatePath("/kody-rabatowe");
  if (input.storeSlug) revalidatePath("/kody-rabatowe/" + input.storeSlug);
  revalidatePath("/admin/kody-rabatowe");
  return NextResponse.json({ id: data.id });
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PATCH(request: NextRequest) { return save(request, true); }

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Niedozwolone pochodzenie." }, { status: 403 });
  const owner = await ownerClient();
  if (!owner) return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Błędny JSON." }, { status: 400 }); }
  const id = (body && typeof body === "object" && "id" in body)
    ? (body as { id: unknown }).id : null;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ error: "Błędne ID." }, { status: 400 });
  const { error } = await owner.supabase.from("extension_offers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Nie udało się usunąć wpisu." }, { status: 400 });
  revalidatePath("/kody-rabatowe");
  revalidatePath("/admin/kody-rabatowe");
  return NextResponse.json({ ok: true });
}