import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LOOKS } from "@/lib/stylizacje";
import { validateOutfitInput } from "@/lib/outfit-builder";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function ownerClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;
  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminError || admin?.role !== "owner") return null;
  return { supabase, userId };
}

async function parseBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const data: unknown = await request.json();
    return data && typeof data === "object" && !Array.isArray(data)
      ? data as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function refreshOutfits(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/stylizacje");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    revalidatePath("/stylizacje/" + slug);
  }
}

async function save(request: NextRequest, method: "POST" | "PATCH") {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Niedozwolone pochodzenie żądania." }, { status: 403 });
  const owner = await ownerClient();
  if (!owner) return NextResponse.json({ error: "Brak uprawnień właściciela." }, { status: 403 });
  const body = await parseBody(request);
  if (!body) return NextResponse.json({ error: "Nieprawidłowe dane formularza." }, { status: 400 });
  const id = method === "PATCH" && typeof body.id === "string" ? body.id : null;
  if (method === "PATCH" && (!id || !/^[0-9a-f-]{36}$/i.test(id))) {
    return NextResponse.json({ error: "Nieprawidłowy identyfikator zestawu." }, { status: 400 });
  }
  const { supabase, userId } = owner;
  const { data: products, error: catalogError } = await supabase
    .from("products")
    .select("id,price,active");
  if (catalogError || !products) return NextResponse.json({ error: "Nie udało się pobrać produktów." }, { status: 503 });
  const verified = validateOutfitInput(body, products);
  if ("error" in verified) return NextResponse.json({ error: verified.error }, { status: 400 });
  const outfit = verified.value;
  if (LOOKS.some((look) => look.slug === outfit.slug)) {
    return NextResponse.json({ error: "Ten adres należy do wcześniejszej stylizacji. Wybierz inny." }, { status: 409 });
  }
  let previousSlug: string | null = null;
  if (id) {
    const { data: previous, error } = await supabase
      .from("editorial_outfits")
      .select("slug,published")
      .eq("id", id)
      .maybeSingle();
    if (error || !previous) return NextResponse.json({ error: "Nie znaleziono zestawu." }, { status: 404 });
    if (previous.published && previous.slug !== outfit.slug) {
      return NextResponse.json({ error: "Nie można zmienić adresu już opublikowanej stylizacji." }, { status: 409 });
    }
    previousSlug = previous.slug;
  }
  const payload = {
    slug: outfit.slug,
    title: outfit.title,
    occasion: outfit.occasion,
    style: outfit.style,
    intro: outfit.intro,
    tip: outfit.tip,
    why_it_works: outfit.whyItWorks,
    excluded: outfit.excluded,
    product_ids: outfit.productIds,
    max_budget: outfit.maxBudget,
    published: outfit.published,
    updated_at: new Date().toISOString(),
  };
  const requestBuilder = id
    ? supabase.from("editorial_outfits").update(payload).eq("id", id)
    : supabase.from("editorial_outfits").insert({ ...payload, created_by: userId });
  const { data: saved, error: saveError } = await requestBuilder.select("id,slug,published,max_budget").single();
  if (saveError || !saved) {
    const conflict = saveError?.code === "23505";
    return NextResponse.json({
      error: conflict ? "Stylizacja o tym adresie już istnieje." : "Nie można zapisać zestawu. Sprawdź dane i spróbuj ponownie.",
    }, { status: conflict ? 409 : 400 });
  }
  refreshOutfits([saved.slug, ...(previousSlug ? [previousSlug] : [])]);
  return NextResponse.json({ outfit: saved, total: outfit.total });
}

export async function POST(request: NextRequest) {
  return save(request, "POST");
}

export async function PATCH(request: NextRequest) {
  return save(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Niedozwolone pochodzenie żądania." }, { status: 403 });
  const owner = await ownerClient();
  if (!owner) return NextResponse.json({ error: "Brak uprawnień właściciela." }, { status: 403 });
  const body = await parseBody(request);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Nieprawidłowe ID." }, { status: 400 });
  const { data: previous, error: readError } = await owner.supabase
    .from("editorial_outfits").select("slug,published").eq("id", id).maybeSingle();
  if (readError || !previous) return NextResponse.json({ error: "Nie znaleziono zestawu." }, { status: 404 });
  const { error } = await owner.supabase.from("editorial_outfits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Nie udało się usunąć zestawu." }, { status: 400 });
  refreshOutfits([previous.slug]);
  return NextResponse.json({ ok: true });
}
