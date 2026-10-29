import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import WelcomeSheinEditor from "@/components/admin/WelcomeSheinEditor";
import { createClient } from "@/lib/supabase/server";
import { mapWelcomeRow } from "@/lib/welcome-shein-settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Oferta powitalna SHEIN",
  robots: { index: false, follow: false },
};

export default async function WelcomeSheinAdminPage() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (authError || !userId) redirect("/login");
  const { data: admin, error: adminError } = await supabase.from("admins")
    .select("role").eq("user_id", userId).maybeSingle();
  if (adminError || !admin) redirect("/login");
  if (admin.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
        <AdminHeader />
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h1 className="text-2xl font-black">Oferta powitalna SHEIN</h1>
          <p className="mt-4 text-sm text-stone-600">Te ustawienia może zmieniać tylko właściciel serwisu.</p>
          <Link href="/admin" className="mt-5 inline-block text-rose-700">Wróć do panelu →</Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase.from("welcome_shein_offer")
    .select("*").eq("id", "homepage").maybeSingle();
  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-28 text-stone-950 lg:pb-10">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-9">
        <nav aria-label="Okruszki administratora" className="mb-5 text-xs font-bold text-stone-500">
          <Link href="/admin" className="hover:text-rose-700">Panel</Link>
          <span className="mx-2">/</span>
          <span className="text-rose-700">Oferta powitalna SHEIN</span>
        </nav>
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">Trend Admin · Marketing</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Oferta powitalna SHEIN</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Zarządzaj oknem na stronie głównej — włączaj, wyłączaj, personalizuj treść,
            kod kampanii, link oraz kolory. Zobacz podgląd przed zapisaniem.
          </p>
        </div>
        {error || !data ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-800">
            Nie udało się odczytać ustawień z Supabase. Niczego nie zapisano.
            <p className="mt-2 text-xs">Sprawdź bazę danych i spróbuj odświeżyć stronę.</p>
          </div>
        ) : (
          <WelcomeSheinEditor initialSettings={mapWelcomeRow(data as Record<string, unknown>)} />
        )}
      </div>
    </main>
  );
}
