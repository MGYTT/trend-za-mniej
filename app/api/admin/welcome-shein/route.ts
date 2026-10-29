import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateWelcomeSheinSettings, welcomeSettingsToRow } from "@/lib/welcome-shein-settings";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (!origin || origin === new URL(request.url).origin) &&
    (!fetchSite || ["same-origin", "none"].includes(fetchSite));
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Niedozwolone pochodzenie żądania." }, { status: 403 });
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (authError || !userId)
    return NextResponse.json({ error: "Zaloguj się ponownie." }, { status: 401 });
  const { data: admin, error: adminError } = await supabase
    .from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (adminError || admin?.role !== "owner")
    return NextResponse.json({ error: "Tylko właściciel może edytować ofertę powitalną." }, { status: 403 });

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: "Błędny format danych." }, { status: 400 }); }
  const checked = validateWelcomeSheinSettings(raw);
  if ("error" in checked)
    return NextResponse.json({ error: checked.error }, { status: 400 });

  const { data, error } = await supabase.from("welcome_shein_offer")
    .update(welcomeSettingsToRow(checked.value, userId))
    .eq("id", "homepage")
    .select("id,updated_at").single();
  if (error || !data) {
    console.error("Welcome offer update failed", error?.message);
    return NextResponse.json({ error: "Nie udało się zapisać. Sprawdź uprawnienia lub połączenie." }, { status: 500 });
  }
  revalidatePath("/", "page");
  revalidatePath("/admin/oferta-powitalna");
  return NextResponse.json({ saved: true, updatedAt: data.updated_at });
}
