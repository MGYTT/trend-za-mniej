import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isStoreSlug, validateStore } from "@/lib/store-validation";

export const runtime = "nodejs";
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  return (!origin || origin === new URL(request.url).origin) &&
    (!site || site === "same-origin" || site === "none");
}
async function getOwner() {
  const client = await createClient();
  const { data: auth, error } = await client.auth.getClaims();
  if (error || !auth?.claims?.sub) return null;
  const { data } = await client.from("admins").select("role").eq("user_id", auth.claims.sub).maybeSingle();
  return data?.role === "owner" ? { client, userId: auth.claims.sub } : null;
}
async function requestBody(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}
function refresh(slug: string) {
  revalidatePath("/kody-rabatowe");
  revalidatePath("/kody-rabatowe/" + slug);
  revalidatePath("/admin/kody-rabatowe");
}
async function save(request: NextRequest, edit: boolean) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Złe pochodzenie." }, { status: 403 });
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Tylko właściciel." }, { status: 403 });
  const checked = validateStore(await requestBody(request));
  if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
  const input = checked.value;
  const payload = {
    slug: input.slug, name: input.name, description: input.description,
    domains: input.domains, website_url: input.websiteUrl,
    category: input.category, cashback_state: input.cashbackState,
    published: input.published, updated_at: new Date().toISOString(),
  };
  const operation = edit
    ? owner.client.from("extension_stores").update(payload).eq("slug", input.slug)
    : owner.client.from("extension_stores").insert({ ...payload, created_by: owner.userId });
  const { data, error } = await operation.select("slug").single();
  if (error || !data) {
    console.warn("Store update:", error?.code);
    return NextResponse.json({ error: "Nie udało się zapisać sklepu. Sprawdź slug, domeny i migrację." }, { status: 400 });
  }
  refresh(input.slug);
  return NextResponse.json({ slug: data.slug });
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PATCH(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Złe pochodzenie." }, { status: 403 });
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Tylko właściciel." }, { status: 403 });
  const body = await requestBody(request);
  const slug = body && typeof body === "object" && "slug" in body ? (body as { slug: unknown }).slug : null;
  if (typeof slug !== "string" || !isStoreSlug(slug) || slug === "shein")
    return NextResponse.json({ error: "Zły slug sklepu." }, { status: 400 });
  const { error } = await owner.client.from("extension_stores").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: "Nie udało się usunąć sklepu." }, { status: 400 });
  refresh(slug);
  return NextResponse.json({ ok: true });
}
