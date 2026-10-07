import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import ClicksChart from "@/components/admin/ClicksChart";

import {
  createClient,
} from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    days?: string;
  }>;
};

type DayRow = {
  day: string;
  clicks:
    | number
    | string;
};

type ProductStatRow = {
  product_id: string;
  short_name: string;
  image_url: string;
  active: boolean;
  clicks:
    | number
    | string;
};

export default async function StatisticsPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const selectedDays =
    params.days === "7"
      ? 7
      : 30;

  const supabase =
    await createClient();

  const {
    data: authData,
  } =
    await supabase.auth.getClaims();

  if (
    !authData?.claims
  ) {
    redirect(
      "/login"
    );
  }

  const [
    chartResult,
    rankingResult,
    allClicksResult,
  ] =
    await Promise.all([
      supabase.rpc(
        "get_clicks_by_day",
        {
          p_days:
            selectedDays,
        }
      ),

      supabase.rpc(
        "get_product_click_stats",
        {
          p_days:
            selectedDays,
        }
      ),

      supabase
        .from(
          "affiliate_clicks"
        )
        .select(
          "*",
          {
            count:
              "exact",
            head: true,
          }
        ),
    ]);

  if (
    chartResult.error
  ) {
    console.error(
      "Błąd statystyk dziennych:",
      chartResult.error
    );
  }

  if (
    rankingResult.error
  ) {
    console.error(
      "Błąd rankingu:",
      rankingResult.error
    );
  }

  const chartData = (
    (
      chartResult.data ??
      []
    ) as DayRow[]
  ).map(
    (item) => ({
      day:
        item.day,

      clicks:
        Number(
          item.clicks
        ),
    })
  );

  const ranking = (
    (
      rankingResult.data ??
      []
    ) as ProductStatRow[]
  ).map(
    (item) => ({
      ...item,

      clicks:
        Number(
          item.clicks
        ),
    })
  );

  const periodClicks =
    chartData.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.clicks,
      0
    );

  const daysWithClicks =
    chartData.filter(
      (item) =>
        item.clicks >
        0
    ).length;

  const average =
    selectedDays > 0
      ? periodClicks /
        selectedDays
      : 0;

  const bestDay =
    chartData.length > 0
      ? chartData.reduce(
          (
            best,
            current
          ) =>
            current.clicks >
            best.clicks
              ? current
              : best
        )
      : null;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              Analityka
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
              Statystyki kliknięć
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              Sprawdź, które
              produkty najbardziej
              interesują
              odwiedzających.
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
            <PeriodLink
              href="/admin/statystyki?days=7"
              active={
                selectedDays ===
                7
              }
            >
              7 dni
            </PeriodLink>

            <PeriodLink
              href="/admin/statystyki?days=30"
              active={
                selectedDays ===
                30
              }
            >
              30 dni
            </PeriodLink>
          </div>
        </div>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title={`Kliknięcia / ${selectedDays} dni`}
            value={
              periodClicks.toString()
            }
          />

          <StatCard
            title="Łącznie"
            value={String(
              allClicksResult.count ??
                0
            )}
          />

          <StatCard
            title="Średnio / dzień"
            value={
              average.toFixed(
                1
              )
            }
          />

          <StatCard
            title="Aktywne dni"
            value={`${daysWithClicks}/${selectedDays}`}
          />
        </section>

        <section className="mt-5 overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-4 py-4 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
              Ruch
            </p>

            <h2 className="mt-1 text-lg font-black sm:text-xl">
              Kliknięcia w czasie
            </h2>
          </div>

          <div className="p-3 sm:p-5">
            <ClicksChart
              data={
                chartData
              }
            />
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
          <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
                Ranking
              </p>

              <h2 className="mt-1 text-xl font-black">
                Najczęściej klikane
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                Ostatnie{" "}
                {
                  selectedDays
                }{" "}
                dni
              </p>
            </div>

            {ranking.length ===
            0 ? (
              <div className="p-10 text-center text-sm text-stone-500">
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
                      className="grid grid-cols-[32px_48px_minmax(0,1fr)_auto] items-center gap-2.5 p-3 sm:grid-cols-[36px_56px_minmax(0,1fr)_auto] sm:gap-4 sm:p-4"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-black text-stone-600">
                        {
                          index +
                          1
                        }
                      </span>

                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.short_name
                        }
                        className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-black sm:text-sm">
                          {
                            product.short_name
                          }
                        </p>

                        <p
                          className={[
                            "mt-1 text-[10px] font-bold",
                            product.active
                              ? "text-green-600"
                              : "text-stone-400",
                          ].join(
                            " "
                          )}
                        >
                          {product.active
                            ? "● Aktywna"
                            : "● Ukryta"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-stone-900 sm:text-xl">
                          {
                            product.clicks
                          }
                        </p>

                        <p className="text-[9px] text-stone-400 sm:text-[10px]">
                          kliknięć
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <InsightCard
              label="Najlepszy dzień"
              value={
                bestDay
                  ? new Intl.DateTimeFormat(
                      "pl-PL",
                      {
                        day:
                          "numeric",
                        month:
                          "long",
                      }
                    ).format(
                      new Date(
                        `${bestDay.day}T12:00:00`
                      )
                    )
                  : "Brak danych"
              }
              metric={
                bestDay
                  ? `${bestDay.clicks} kliknięć`
                  : undefined
              }
            />

            <InsightCard
              label="Najlepszy produkt"
              value={
                ranking[0]
                  ?.short_name ??
                "Brak danych"
              }
              metric={
                ranking[0]
                  ? `${ranking[0].clicks} kliknięć`
                  : undefined
              }
            />

            <div className="rounded-[20px] border border-stone-200 bg-white p-4">
              <p className="text-sm font-black">
                Wskazówka
              </p>

              <p className="mt-2 text-xs leading-6 text-stone-500">
                Produkty z dużą
                liczbą kliknięć
                warto wykorzystywać
                częściej w
                materiałach na
                Pinterest,
                Instagramie czy
                TikToku.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function PeriodLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex min-h-9 items-center justify-center rounded-lg px-4 text-xs font-black transition sm:text-sm",
        active
          ? "bg-rose-600 text-white"
          : "text-stone-500 hover:bg-stone-50",
      ].join(
        " "
      )}
    >
      {children}
    </Link>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-stone-400 sm:text-xs">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  metric,
}: {
  label: string;
  value: string;
  metric?: string;
}) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-black leading-5 text-stone-900">
        {value}
      </p>

      {metric && (
        <p className="mt-2 text-xs font-black text-rose-600">
          {metric}
        </p>
      )}
    </div>
  );
}