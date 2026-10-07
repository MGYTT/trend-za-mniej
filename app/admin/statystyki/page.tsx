import Link from "next/link";
import { redirect } from "next/navigation";

import ClicksChart from "@/components/admin/ClicksChart";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    days?: string;
  }>;
};

type DayRow = {
  day: string;
  clicks: number | string;
};

type ProductStatRow = {
  product_id: string;
  short_name: string;
  image_url: string;
  active: boolean;
  clicks: number | string;
};

export default async function StatisticsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const selectedDays =
    params.days === "7" ? 7 : 30;

  const supabase = await createClient();

  const { data: authData } =
    await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const [
    chartResult,
    rankingResult,
    allClicksResult,
  ] = await Promise.all([
    supabase.rpc(
      "get_clicks_by_day",
      {
        p_days: selectedDays,
      }
    ),

    supabase.rpc(
      "get_product_click_stats",
      {
        p_days: selectedDays,
      }
    ),

    supabase
      .from("affiliate_clicks")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  if (chartResult.error) {
    console.error(
      "Błąd statystyk dziennych:",
      chartResult.error
    );
  }

  if (rankingResult.error) {
    console.error(
      "Błąd rankingu:",
      rankingResult.error
    );
  }

  const chartData = (
    (chartResult.data ?? []) as DayRow[]
  ).map((item) => ({
    day: item.day,
    clicks: Number(item.clicks),
  }));

  const ranking = (
    (rankingResult.data ??
      []) as ProductStatRow[]
  ).map((item) => ({
    ...item,
    clicks: Number(item.clicks),
  }));

  const periodClicks =
    chartData.reduce(
      (sum, item) =>
        sum + item.clicks,
      0
    );

  const daysWithClicks =
    chartData.filter(
      (item) => item.clicks > 0
    ).length;

  const average =
    selectedDays > 0
      ? periodClicks /
        selectedDays
      : 0;

  const bestDay =
    chartData.length > 0
      ? chartData.reduce(
          (best, current) =>
            current.clicks >
            best.clicks
              ? current
              : best
        )
      : null;

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-2xl font-black">
              Trend za Mniej
            </p>

            <p className="text-sm text-stone-500">
              Statystyki
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold transition hover:border-rose-300 hover:text-rose-600"
          >
            ← Panel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-rose-600">
              📊 Analityka
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Statystyki kliknięć
            </h1>

            <p className="mt-2 text-stone-500">
              Sprawdź, które produkty
              najbardziej interesują odwiedzających.
            </p>
          </div>

          <div className="flex rounded-2xl border border-rose-100 bg-white p-1 shadow-sm">
            <Link
              href="/admin/statystyki?days=7"
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                selectedDays === 7
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-rose-600"
              }`}
            >
              7 dni
            </Link>

            <Link
              href="/admin/statystyki?days=30"
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                selectedDays === 30
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-rose-600"
              }`}
            >
              30 dni
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="🖱️"
            title={`Kliknięcia / ${selectedDays} dni`}
            value={periodClicks.toString()}
          />

          <StatCard
            icon="🌍"
            title="Kliknięcia łącznie"
            value={String(
              allClicksResult.count ??
                0
            )}
          />

          <StatCard
            icon="📅"
            title="Średnio dziennie"
            value={average.toFixed(1)}
          />

          <StatCard
            icon="🔥"
            title="Aktywne dni"
            value={`${daysWithClicks}/${selectedDays}`}
          />
        </section>

        <section className="mt-8">
          <ClicksChart
            data={chartData}
          />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
            <div className="border-b border-stone-100 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">
                🏆 Ranking
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Najczęściej klikane produkty
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Ostatnie{" "}
                {selectedDays} dni.
              </p>
            </div>

            {ranking.length ===
            0 ? (
              <div className="p-12 text-center text-stone-500">
                Brak danych.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {ranking.map(
                  (
                    product,
                    index
                  ) => (
                    <div
                      key={
                        product.product_id
                      }
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 font-black text-rose-600">
                        {index + 1}
                      </div>

                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.short_name
                        }
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">
                          {
                            product.short_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {product.active
                            ? "● Opublikowana"
                            : "● Ukryta"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-rose-600">
                          {
                            product.clicks
                          }
                        </p>

                        <p className="text-xs text-stone-400">
                          kliknięć
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-7">
            <div className="text-4xl">
              💡
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Co warto obserwować?
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Produkty z największą
              liczbą kliknięć warto
              częściej promować na
              Pinterest, Instagramie
              i TikToku.
            </p>

            <div className="mt-7 rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-500">
                Najlepszy dzień
              </p>

              {bestDay ? (
                <>
                  <p className="mt-1 text-xl font-black">
                    {new Intl.DateTimeFormat(
                      "pl-PL",
                      {
                        day: "numeric",
                        month: "long",
                      }
                    ).format(
                      new Date(
                        `${bestDay.day}T12:00:00`
                      )
                    )}
                  </p>

                  <p className="mt-2 font-bold text-rose-600">
                    {
                      bestDay.clicks
                    }{" "}
                    kliknięć
                  </p>
                </>
              ) : (
                <p className="mt-2">
                  Brak danych
                </p>
              )}
            </div>

            {ranking[0] && (
              <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-500">
                  Najlepszy produkt
                </p>

                <p className="mt-2 font-black">
                  {
                    ranking[0]
                      .short_name
                  }
                </p>

                <p className="mt-2 font-bold text-rose-600">
                  {
                    ranking[0]
                      .clicks
                  }{" "}
                  kliknięć
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-stone-500">
        {title}
      </p>

      <p className="mt-1 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}