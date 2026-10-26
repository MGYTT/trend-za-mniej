import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import OfferLifecycleStudio from "@/components/admin/OfferLifecycleStudio";
import { polishToday, type LifecycleRow } from "@/lib/offer-lifecycle";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SheinRecord = {
  id: string; title: string; published: boolean; valid_until: string | null;
  updated_at: string; last_reviewed_at: string | null;
};
type MerchantRecord = {
  id: string; store_name: string; title: string; published: boolean;
  valid_until: string | null; updated_at: string; last_verified_at: string | null;
};

export default async function OfferDeadlinesPage() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getClaims();
  if (error || !auth?.claims?.sub) redirect("/login");
  const { data: admin, error: roleError } = await supabase.from("admins")
    .select("role").eq("user_id", auth.claims.sub).maybeSingle();
  if (roleError || admin?.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
        <AdminHeader />
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h1 className="text-2xl font-black">Terminy promocji</h1>
          <p className="mt-4 text-sm text-stone-600">Ta sekcja jest dostępna tylko dla właściciela.</p>
          <Link href="/admin" className="mt-5 inline-flex text-sm font-bold text-rose-700">Wróć do panelu →</Link>
        </div>
      </main>
    );
  }

  const [shein, merchants] = await Promise.all([
    supabase.from("shein_campaigns")
      .select("id,title,published,valid_until,updated_at,last_reviewed_at")
      .order("updated_at", { ascending: false }).limit(500),
    supabase.from("extension_offers")
      .select("id,store_name,title,published,valid_until,updated_at,last_verified_at")
      .order("updated_at", { ascending: false }).limit(500),
  ]);
  const unavailable = Boolean(shein.error || merchants.error);
  const rows: LifecycleRow[] = unavailable ? [] : [
    ...((shein.data || []) as SheinRecord[]).map(item => ({
      source: "shein" as const, id: item.id, store: "SHEIN", title: item.title,
      published: item.published, validUntil: item.valid_until,
      verifiedAt: item.last_reviewed_at, updatedAt: item.updated_at,
    })),
    ...((merchants.data || []) as MerchantRecord[]).map(item => ({
      source: "merchant" as const, id: item.id, store: item.store_name, title: item.title,
      published: item.published, validUntil: item.valid_until,
      verifiedAt: item.last_verified_at, updatedAt: item.updated_at,
    })),
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-24 text-stone-950">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <nav aria-label="Okruszki administratora" className="text-xs font-bold text-stone-500">
          <Link href="/admin" className="hover:text-rose-700">Panel</Link>
          <span className="mx-2">/</span>
          <span className="text-rose-700">Terminy promocji</span>
        </nav>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-700">Centrum kontroli ofert</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Terminy i weryfikacja promocji</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Jeden panel do monitorowania kampanii SHEIN i promocji pozostałych sklepów.
              Zobacz, co wkrótce wygaśnie, a po sprawdzeniu warunków przedłuż datę.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/kody-rabatowe"
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-xs font-black text-stone-900">
              Edytuj oferty sklepów →
            </Link>
            <Link href="/admin/promocje-shein"
              className="inline-flex min-h-11 items-center rounded-xl bg-stone-950 px-4 text-xs font-black text-white">
              Edytuj SHEIN →
            </Link>
          </div>
        </div>
        {unavailable ? (
          <p role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-900">
            Nie udało się pobrać wszystkich ofert. Żadna zmiana nie jest obecnie możliwa — odśwież stronę później.
          </p>
        ) : <OfferLifecycleStudio initialRows={rows} today={polishToday()} />}
      </div>
    </main>
  );
}
