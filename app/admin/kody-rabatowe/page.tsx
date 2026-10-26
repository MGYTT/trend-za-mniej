import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCouponStudio from "@/components/admin/AdminCouponStudio";
import AdminStoreStudio from "@/components/admin/AdminStoreStudio";
import AdminBulkOfferImporter from "@/components/admin/AdminBulkOfferImporter";
import type { StoreRecord } from "@/lib/stores";
import { createClient } from "@/lib/supabase/server";
import type { ExtensionOfferRow } from "@/components/admin/AdminCouponStudio";

export const dynamic = "force-dynamic";

export default async function AdminCouponPage() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (error || !userId) redirect("/login");
  const { data: admin } = await supabase.from("admins")
    .select("role").eq("user_id", userId).maybeSingle();
  if (!admin) redirect("/login");
  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-24 text-stone-950">
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link href="/admin" className="text-xs font-black text-rose-700">← Wróć do panelu</Link>
        <h1 className="mt-4 text-3xl font-black">Kody rabatowe i promocje sklepów</h1>
        <Link href="/admin/terminy-promocji" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-700">Terminy, wygasające oferty i weryfikacja →</Link>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Dodawaj zweryfikowane kupony i promocje innych sklepów.
          Dotychczasowe kampanie SHEIN pozostają w osobnym menedżerze.
        </p>
        {admin.role !== "owner" ? (
          <p className="mt-7 rounded-2xl bg-white p-6 text-sm text-stone-700">Tylko właściciel zarządza bazą kodów.</p>
        ) : <OfferManager supabase={supabase} />}
      </div>
    </main>
  );
}

async function OfferManager({ supabase }: { supabase: Awaited<ReturnType<typeof createClient>> }) {
  const storeResult = await supabase.from("extension_stores").select("*").order("name").limit(300);
  const { data, error } = await supabase.from("extension_offers")
    .select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return (
    <p role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-900">
      Nie można pobrać kodów. Sprawdź, czy migracja tabeli extension_offers została wykonana.
    </p>
  );
  if (storeResult.error) return <p role="alert" className="mt-6 text-sm text-red-700">Błąd pobierania sklepów. Sprawdź migrację.</p>;
  const stores = (storeResult.data || []) as StoreRecord[];
  return <>
    <AdminStoreStudio stores={stores} />
    <AdminBulkOfferImporter stores={stores} existingOffers={(data || []) as ExtensionOfferRow[]} />
    <div className="mt-10 border-t border-stone-200 pt-8">
      <h2 className="text-2xl font-black">Kody i promocje sklepów</h2>
      <AdminCouponStudio initialOffers={(data || []) as ExtensionOfferRow[]} stores={stores} />
    </div>
  </>;
}