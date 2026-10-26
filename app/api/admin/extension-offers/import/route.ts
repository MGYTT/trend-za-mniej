import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateExtensionOffer } from "@/lib/extension-offer-validation";
import { merchantDestination } from "@/lib/store-destination";
import { MAX_IMPORT_ROWS, offerDraftFingerprint, type OfferDraft } from "@/lib/offer-draft-import";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  return (!origin || origin === new URL(request.url).origin) &&
    (!site || ["same-origin", "none"].includes(site));
}

/** One atomic batch, owner-only. Never accepts a published/verified flag from the browser. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Niedozwolone pochodzenie." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "Oczekiwano JSON." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 70000)
    return NextResponse.json({ error: "Przekroczono limit importu." }, { status: 413 });

  const supabase = await createClient();
  const { data: auth, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !auth?.claims?.sub)
    return NextResponse.json({ error: "Zaloguj się do panelu." }, { status: 401 });
  const { data: admin, error: roleError } = await supabase.from("admins")
    .select("role").eq("user_id", auth.claims.sub).maybeSingle();
  if (roleError || admin?.role !== "owner")
    return NextResponse.json({ error: "Tylko właściciel może importować promocje." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
    !("rows" in body) || !Array.isArray(body.rows) ||
    body.rows.length < 1 || body.rows.length > MAX_IMPORT_ROWS)
    return NextResponse.json({ error: "Podaj od 1 do 20 wierszy." }, { status: 400 });
  const entries = body.rows as unknown[];
  const slugs = [...new Set(entries.map(entry =>
    entry && typeof entry === "object" && !Array.isArray(entry) && "storeSlug" in entry
      ? String(entry.storeSlug) : ""))];
  if (slugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))
    return NextResponse.json({ error: "Wybierz sklepy istniejące w katalogu." }, { status: 400 });

  const { data: stores, error: storesError } = await supabase.from("extension_stores")
    .select("slug,name,domains").in("slug", slugs);
  if (storesError || !stores || stores.length !== slugs.length)
    return NextResponse.json({ error: "Nie znaleziono jednego ze sklepów." }, { status: 400 });
  const storeMap = new Map(stores.map(store => [store.slug, store]));
  const payloads: Array<Record<string, unknown>> = [];
  const checkedRows: OfferDraft[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];

  entries.forEach((entry, index) => {
    const row = entry && typeof entry === "object" && !Array.isArray(entry)
      ? entry as Record<string, unknown> : null;
    const prefix = "Wiersz " + (index + 2) + ": ";
    if (!row || typeof row.storeSlug !== "string" || typeof row.title !== "string" ||
      typeof row.description !== "string" || typeof row.offerType !== "string" ||
      (row.code != null && typeof row.code !== "string") ||
      (row.validUntil != null && typeof row.validUntil !== "string") ||
      (row.destinationUrl != null && typeof row.destinationUrl !== "string")) {
      errors.push(prefix + "nieprawidłowe dane."); return;
    }
    const store = storeMap.get(row.storeSlug);
    if (!store) { errors.push(prefix + "nieznany sklep."); return; }
    if (row.offerType === "promotion" && typeof row.code === "string" && row.code.trim()) {
      errors.push(prefix + "promocja bez kodu nie może zawierać kodu rabatowego."); return;
    }
    const checked = validateExtensionOffer({
      id: null, storeSlug: store.slug, storeName: store.name, storeDomains: store.domains,
      title: row.title, description: row.description, offerType: row.offerType,
      code: row.code ?? null, validUntil: row.validUntil ?? null,
      destinationUrl: row.destinationUrl ?? null,
      pagePath: "/kody-rabatowe/" + store.slug, published: false, verified: false,
    });
    if ("error" in checked) { errors.push(prefix + checked.error); return; }
    const offer = checked.value;
    if (offer.destinationUrl && !merchantDestination(offer.destinationUrl, store.domains)) {
      errors.push(prefix + "link musi prowadzić do oficjalnej domeny sklepu."); return;
    }
    const normalized: OfferDraft = {
      storeSlug: store.slug, title: offer.title, description: offer.description,
      offerType: offer.offerType, code: offer.code, validUntil: offer.validUntil,
      destinationUrl: offer.destinationUrl,
    };
    const fingerprint = offerDraftFingerprint(normalized);
    if (seen.has(fingerprint)) {
      errors.push(prefix + "duplikat w importowanej tabeli."); return;
    }
    seen.add(fingerprint);
    checkedRows.push(normalized);
    payloads.push({
      store_slug: store.slug, store_name: store.name, store_domains: store.domains,
      title: offer.title, description: offer.description,
      offer_type: offer.offerType, code: offer.code, page_path: offer.pagePath,
      destination_url: offer.destinationUrl, valid_until: offer.validUntil,
      published: false, last_verified_at: null, created_by: auth.claims.sub,
    });
  });
  if (errors.length) return NextResponse.json({ error: errors.slice(0, 5).join(" ") }, { status: 400 });

  // Best-effort duplicate detection against existing rows; fail closed on truncated reads.
  const { data: existing, error: existingError } = await supabase.from("extension_offers")
    .select("store_slug,title,offer_type,code").in("store_slug", slugs).limit(10000);
  if (existingError || !existing || existing.length >= 10000)
    return NextResponse.json({ error: "Nie można bezpiecznie sprawdzić duplikatów." }, { status: 500 });
  const known = new Set(existing.map(item => offerDraftFingerprint({
    storeSlug: item.store_slug || "", title: item.title,
    offerType: item.offer_type as OfferDraft["offerType"], code: item.code,
  })));
  const duplicates = checkedRows.map((row, i) => known.has(offerDraftFingerprint(row)) ? i + 2 : null)
    .filter((i): i is number => i !== null);
  if (duplicates.length)
    return NextResponse.json({
      error: "Podobne oferty już są zapisane. Sprawdź wiersze: " + duplicates.join(", ") + ".",
    }, { status: 409 });

  // A single PostgREST bulk insert is transactional: no partially published records.
  const { data: inserted, error: insertError } = await supabase.from("extension_offers")
    .insert(payloads).select("id");
  if (insertError || !inserted || inserted.length !== payloads.length)
    return NextResponse.json({ error: "Import nie powiódł się. Żaden kod nie został opublikowany." }, { status: 400 });

  revalidatePath("/admin/kody-rabatowe");
  return NextResponse.json({ created: inserted.length, published: 0 });
}
