import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSheinCampaignStudio from "@/components/admin/AdminSheinCampaignStudio";
import { createClient } from "@/lib/supabase/server";
import type { SheinCampaignRow, CampaignClickCounts } from "@/lib/shein-campaigns";

export const dynamic = "force-dynamic";

export default async function AdminSheinCampaignsPage() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (error || !userId) redirect("/login");

  const { data: admin, error: roleError } = await supabase
    .from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (roleError || !admin) redirect("/login");
  if (admin.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
        <AdminHeader />
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h1 className="text-2xl font-black">Menedżer promocji SHEIN</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
            Zarządzanie kampaniami i ich publikacją jest dostępne wyłącznie dla właściciela serwisu.
          </p>
          <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-stone-950 px-5 text-sm font-bold text-white">
            Wróć do panelu
          </Link>
        </div>
      </main>
    );
  }

  const [campaignsResult, weekResult, monthResult] = await Promise.all([
    supabase.from("shein_campaigns").select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.rpc("get_shein_campaign_click_stats", { p_days: 7 }),
    supabase.rpc("get_shein_campaign_click_stats", { p_days: 30 }),
  ]);
  const campaignsError = campaignsResult.error;
  const analyticsUnavailable = Boolean(weekResult.error || monthResult.error);
  if (weekResult.error) console.error("SHEIN 7-day analytics:", weekResult.error.message);
  if (monthResult.error) console.error("SHEIN 30-day analytics:", monthResult.error.message);

  type StatRow = { campaign_id: string; clicks: number | string };
  const clickCounts: CampaignClickCounts = {};
  if (!analyticsUnavailable) {
    for (const row of (weekResult.data ?? []) as StatRow[]) {
      clickCounts[row.campaign_id] ??= { last7: 0, last30: 0 };
      clickCounts[row.campaign_id].last7 = Number(row.clicks) || 0;
    }
    for (const row of (monthResult.data ?? []) as StatRow[]) {
      clickCounts[row.campaign_id] ??= { last7: 0, last30: 0 };
      clickCounts[row.campaign_id].last30 = Number(row.clicks) || 0;
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-28 text-stone-950 lg:pb-8">
      <AdminHeader />
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 sm:px-8 lg:pt-9">
        <nav aria-label="Okruszki administratora" className="text-xs font-bold text-stone-500">
          <Link href="/admin" className="hover:text-rose-700">Panel</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span className="text-rose-700">Promocje SHEIN</span>
        </nav>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Trend Admin · Kampanie</p>
            <h1 className="mt-2 text-[clamp(1.9rem,5vw,2.9rem)] font-black tracking-[-0.05em]">
              Menedżer promocji SHEIN
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Edytuj kody, opisy, kategorie i kolejność. Zapisz szkic lub opublikuj
              kampanię bez zmieniania kodu i ponownego wdrażania strony.
            </p>
          </div>
          <Link href="/promocje-shein" target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-700">
            Zobacz publiczne promocje ↗
          </Link>
        </div>
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-6 text-stone-700">
          <strong>Uwaga:</strong> kody i linki pochodzą z katalogu kampanii, ale nie są
          automatycznie weryfikowane w SHEIN. „Opublikowana” oznacza tylko widoczność
          na tej stronie. Potwierdź rodzaj kodu, rabat i warunki u sprzedawcy.
        </p>
        {campaignsError ? (
          <div role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-bold text-red-800">
            Nie można pobrać kampanii z Supabase. Spróbuj ponownie później.
          </div>
        ) : (
          <AdminSheinCampaignStudio
            initialCampaigns={(campaignsResult.data ?? []) as SheinCampaignRow[]}
            clickCounts={clickCounts}
            analyticsUnavailable={analyticsUnavailable}
          />
        )}
      </div>
    </main>
  );
}
