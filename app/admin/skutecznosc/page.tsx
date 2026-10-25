import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/server";
import { LOOKS } from "@/lib/stylizacje";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ days?: string }> };
type ChannelRow = { channel: string; clicks: number | string };
type RankingRow = { outfit_slug: string; clicks: number | string };
type CampaignRow = { campaign_id: string; clicks: number | string };

const SOURCES = [
  { key: "product", name: "Produkty", description: "Przejścia z kart i list produktów", href: "/admin#admin-offers", icon: "🛍️" },
  { key: "outfit", name: "Stylizacje", description: "Przejścia do produktów przez zestawy", href: "/admin/stylizacje", icon: "👗" },
  { key: "shein", name: "Promocje SHEIN", description: "Przejścia z kart kodów i kampanii", href: "/admin/promocje-shein", icon: "🏷️" },
] as const;

const value = (raw: number | string | undefined) => {
  const number = Number(raw ?? 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

export default async function AdminChannelEffectivenessPage({ searchParams }: Props) {
  const { days } = await searchParams;
  const selectedDays = days === "7" ? 7 : 30;
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (authError || !userId) redirect("/login");

  const { data: admin, error: roleError } = await supabase
    .from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (roleError || !admin) redirect("/login");

  if (admin.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-900">
        <AdminHeader />
        <div className="mx-auto max-w-4xl px-5 py-12">
          <h1 className="text-2xl font-black">Skuteczność kanałów</h1>
          <p className="mt-3 text-sm text-stone-600">Zbiorczy raport afiliacyjny jest dostępny wyłącznie dla właściciela.</p>
          <Link href="/admin/statystyki" className="mt-5 inline-flex min-h-11 items-center font-bold text-rose-700">Zobacz statystyki produktów →</Link>
        </div>
      </main>
    );
  }

  const [channelsResult, outfitsResult, sheinResult, namesResult, campaignNamesResult] = await Promise.all([
    supabase.rpc("get_affiliate_channel_stats", { p_days: selectedDays }),
    supabase.rpc("get_outfit_affiliate_stats", { p_days: selectedDays }),
    supabase.rpc("get_shein_campaign_click_stats", { p_days: selectedDays }),
    supabase.from("editorial_outfits").select("slug,title").eq("published", true),
    supabase.from("shein_campaigns").select("id,title"),
  ]);

  const statsUnavailable = Boolean(channelsResult.error);
  if (channelsResult.error) console.error("Affiliate channel analytics:", channelsResult.error.message);
  if (outfitsResult.error) console.error("Outfit attribution analytics:", outfitsResult.error.message);
  if (sheinResult.error) console.error("SHEIN channel analytics:", sheinResult.error.message);

  const bySource = new Map<string, number>(
    ((channelsResult.data ?? []) as ChannelRow[]).map(
      (item): [string, number] => [item.channel, value(item.clicks)]
    )
  );
  const knownTotal = SOURCES.reduce((sum, item) => sum + (bySource.get(item.key) ?? 0), 0);
  const unassigned = bySource.get("unassigned") ?? 0;
  const maxClicks = Math.max(1, ...SOURCES.map((item) => bySource.get(item.key) ?? 0));

  const outfitTitles = new Map<string, string>([
    ...LOOKS.map((look): [string, string] => [look.slug, look.title]),
    ...((namesResult.data ?? []) as { slug: string; title: string }[]).map(
      (look): [string, string] => [look.slug, look.title]
    ),
  ]);
  const campaignTitles = new Map<string, string>(
    ((campaignNamesResult.data ?? []) as { id: string; title: string }[]).map(
      (campaign) => [campaign.id, campaign.title]
    )
  );
  const topOutfits = ((outfitsResult.data ?? []) as RankingRow[])
    .map((row) => ({ slug: row.outfit_slug, title: outfitTitles.get(row.outfit_slug) ?? row.outfit_slug, clicks: value(row.clicks) }))
    .slice(0, 5);
  const topCampaigns = ((sheinResult.data ?? []) as CampaignRow[])
    .map((row) => ({ id: row.campaign_id, title: campaignTitles.get(row.campaign_id) ?? row.campaign_id, clicks: value(row.clicks) }))
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-28 text-stone-900 lg:pb-10">
      <AdminHeader />
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
        <nav aria-label="Okruszki nawigacyjne" className="text-xs font-bold text-stone-500">
          <Link href="/admin" className="hover:text-rose-700">Panel</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <Link href="/admin/statystyki" className="hover:text-rose-700">Statystyki</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span className="text-rose-700">Skuteczność kanałów</span>
        </nav>

        <section className="mt-5 flex flex-wrap items-end justify-between gap-5 rounded-[26px] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Trend Admin · Analityka afiliacyjna</p>
            <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.9rem)] font-black leading-tight tracking-[-0.05em] text-stone-950">
              Co przyciąga najwięcej kliknięć?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Porównaj produkty, stylizacje i kampanie SHEIN w jednym miejscu.
              To liczba przejść afiliacyjnych, nie sprzedaż, przychód ani liczba unikalnych osób.
            </p>
          </div>
          <div role="group" aria-label="Okres analizy" className="inline-flex gap-1 rounded-2xl border border-rose-100 bg-white p-1">
            {([7, 30] as const).map((period) => (
              <Link key={period} href={"/admin/skutecznosc?days=" + period}
                aria-current={selectedDays === period ? "page" : undefined}
                className={["inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-black transition",
                  selectedDays === period ? "bg-rose-600 text-white" : "text-stone-600 hover:bg-rose-50"].join(" ")}>
                {period} dni
              </Link>
            ))}
          </div>
        </section>

        {statsUnavailable ? (
          <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-900">
            Zbiorcze statystyki są chwilowo niedostępne. Nie wyświetlamy niezweryfikowanych wyników.
          </div>
        ) : (
          <>
            <section aria-labelledby="channel-kpis" className="mt-6">
              <h2 id="channel-kpis" className="mb-3 text-lg font-black tracking-tight text-stone-950">Ruch afiliacyjny · {selectedDays} dni</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                <div className="rounded-[22px] border border-rose-100 bg-rose-600 p-5 text-white shadow-sm">
                  <p className="text-xs font-bold text-white/85">Rozpoznane źródła</p>
                  <p className="mt-2 text-3xl font-black tabular-nums">{knownTotal.toLocaleString("pl-PL")}</p>
                  <p className="mt-2 text-xs text-white/75">Łącznie z trzech kanałów</p>
                </div>
                {SOURCES.map((item) => (
                  <Link key={item.key} href={item.href}
                    className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm transition hover:border-rose-300 hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-600">{item.name}</p>
                      <span aria-hidden="true" className="text-xl">{item.icon}</span>
                    </div>
                    <p className="mt-2 text-3xl font-black tabular-nums text-stone-950">{(bySource.get(item.key) ?? 0).toLocaleString("pl-PL")}</p>
                    <p className="mt-2 text-xs text-rose-700">Przejdź do sekcji →</p>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="channel-comparison" className="mt-5 rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 id="channel-comparison" className="text-xl font-black tracking-tight text-stone-950">Porównanie kanałów</h2>
              <p className="mt-2 text-xs leading-6 text-stone-500">Rzeczywiste przejścia przypisane do danego źródła od uruchomienia oznaczania kanałów.</p>
              <div className="mt-6 space-y-6">
                {SOURCES.map((item) => {
                  const clicks = bySource.get(item.key) ?? 0;
                  return (
                    <div key={item.key}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-stone-900">{item.icon} {item.name}</p>
                          <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                        </div>
                        <strong className="text-lg font-black tabular-nums text-rose-700">{clicks.toLocaleString("pl-PL")}</strong>
                      </div>
                      <div role="img" aria-label={item.name + ": " + clicks + " przejść"}
                        className="mt-2 h-3 overflow-hidden rounded-full bg-rose-50">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-300"
                          style={{ width: (clicks === 0 ? 0 : Math.max(2, clicks / maxClicks * 100)) + "%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {unassigned > 0 && (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-black text-stone-700">Historyczne kliknięcia bez źródła: {unassigned.toLocaleString("pl-PL")}</p>
                  <p className="mt-2 text-xs leading-6 text-stone-600">
                    Wcześniejsze kliknięcia produktów nie zapisywały informacji, czy pochodziły ze stylizacji.
                    Nie doliczamy ich do żadnego kanału, aby nie zawyżać wyników.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <RankingSection
            title="Najczęściej otwierane stylizacje"
            description="Zliczane są przejścia do produktów z konkretnych zestawów."
            loading={Boolean(outfitsResult.error)}
            empty="Na razie nie ma przypisanych kliknięć stylizacji w tym okresie."
            items={topOutfits.map((item) => ({ id: item.slug, name: item.title, clicks: item.clicks, href: "/stylizacje/" + item.slug }))}
          />
          <RankingSection
            title="Najczęściej otwierane promocje SHEIN"
            description="Przejścia przez linki kampanii w serwisie Trend za Mniej."
            loading={Boolean(sheinResult.error)}
            empty="Brak przejść do promocji SHEIN w tym okresie."
            items={topCampaigns.map((item) => ({ id: item.id, name: item.title, clicks: item.clicks, href: "/admin/promocje-shein" }))}
          />
        </div>
        <p className="mt-5 text-xs leading-6 text-stone-500">
          Dane są zliczane od momentu uruchomienia poszczególnych systemów pomiaru.
          Raport pokazuje kliknięcia, a nie konwersje ani rzeczywiste prowizje afiliacyjne.
        </p>
      </div>
    </main>
  );
}

function RankingSection({
  title, description, loading, empty, items,
}: {
  title: string; description: string; loading: boolean; empty: string;
  items: { id: string; name: string; clicks: number; href: string }[];
}) {
  return (
    <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black tracking-tight text-stone-950">{title}</h2>
      <p className="mt-2 text-xs leading-6 text-stone-500">{description}</p>
      {loading ? (
        <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Ranking chwilowo niedostępny.</p>
      ) : items.length === 0 ? (
        <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">{empty}</p>
      ) : (
        <ol className="mt-5 divide-y divide-stone-100">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-700">{index + 1}</span>
              <Link href={item.href} className="min-w-0 flex-1 text-sm font-bold leading-6 text-stone-900 hover:text-rose-700">{item.name}</Link>
              <strong className="shrink-0 text-sm font-black tabular-nums text-rose-700">{item.clicks.toLocaleString("pl-PL")}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
