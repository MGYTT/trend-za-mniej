import { redirect } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminOutfitStudio from "@/components/admin/AdminOutfitStudio";
import { createClient } from "@/lib/supabase/server";
import { LOOKS } from "@/lib/stylizacje";
import type { ManagedOutfitRow } from "@/lib/editorial-outfits";

export const dynamic = "force-dynamic";

export default async function AdminOutfitsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: admin } = await supabase.from("admins")
    .select("role").eq("user_id", userId).maybeSingle();

  if (!admin) redirect("/login");

  if (admin.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
        <AdminHeader />
        <div className="mx-auto max-w-4xl px-5 py-12">
          <h1 className="text-2xl font-black">Kreator stylizacji</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
            Publikowaniem i edycją stylizacji zarządza właściciel serwisu.
            Edytorzy mogą zarządzać swoimi ofertami produktów zgodnie z obecnymi uprawnieniami.
          </p>
          <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-stone-900 px-5 text-sm font-bold text-white">
            Wróć do panelu
          </Link>
        </div>
      </main>
    );
  }

  const [catalogResult, outfitsResult] = await Promise.all([
    supabase.from("products")
      .select("id,slug,name,short_name,category,price,image_url,active")
      .eq("active", true).order("created_at", { ascending: false }),
    supabase.from("editorial_outfits").select("*").order("updated_at", { ascending: false }),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-28 text-stone-950 lg:pb-8">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-7 sm:px-8 sm:pt-10">
        <nav aria-label="Okruszki administratora" className="text-xs font-bold text-stone-500">
          <Link href="/admin" className="hover:text-rose-700">Panel</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-rose-700">Stylizacje</span>
        </nav>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Trend Admin</p>
            <h1 className="mt-2 text-[clamp(1.9rem,6vw,2.8rem)] font-black tracking-[-0.05em]">
              Kreator stylizacji
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Łącz aktywne produkty, podglądaj zestaw i publikuj bez edytowania kodu.
              Suma cen i budżet wyliczają się automatycznie.
            </p>
          </div>
          <Link href="/stylizacje" target="_blank"
            className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-700">
            Zobacz stronę publiczną ↗
          </Link>
        </div>
        {catalogResult.error || outfitsResult.error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm font-bold text-red-900">
            Nie udało się pobrać danych kreatora. Odśwież stronę lub skontaktuj się z administratorem bazy.
          </div>
        ) : (
          <AdminOutfitStudio
            catalog={(catalogResult.data ?? []).map((p) => ({
              id: p.id, slug: p.slug, name: p.name, shortName: p.short_name,
              category: p.category, price: Number(p.price),
              image: p.image_url, active: Boolean(p.active),
            }))}
            existing={(outfitsResult.data ?? []) as ManagedOutfitRow[]}
            legacyCount={LOOKS.length}
          />
        )}
      </div>
    </main>
  );
}
