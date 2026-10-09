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
  searchParams:
    Promise<{
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
    params.days ===
    "7"
      ? 7
      : 30;

  const supabase =
    await createClient();

  const {
    data:
      authData,
  } =
    await supabase.auth
      .getClaims();

  const userId =
    authData
      ?.claims
      ?.sub;

  if (
    !userId
  ) {
    redirect(
      "/login"
    );
  }

  const {
    data:
      adminData,
  } =
    await supabase
      .from(
        "admins"
      )
      .select(
        "user_id"
      )
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();

  if (
    !adminData
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

            head:
              true,
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

  if (
    allClicksResult.error
  ) {
    console.error(
      "Błąd liczby kliknięć:",
      allClicksResult.error
    );
  }

  const chartData =
    (
      (
        chartResult.data ??
        []
      ) as DayRow[]
    ).map(
      (
        item
      ) => ({
        day:
          item.day,

        clicks:
          Number(
            item.clicks
          ),
      })
    );

  const ranking =
    (
      (
        rankingResult.data ??
        []
      ) as ProductStatRow[]
    ).map(
      (
        item
      ) => ({
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
      (
        item
      ) =>
        item.clicks >
        0
    ).length;

  const average =
    selectedDays >
    0
      ? periodClicks /
        selectedDays
      : 0;

  const bestDay =
    chartData.length >
    0
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

  const bestProduct =
    ranking[0] ??
    null;

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <section className="relative overflow-hidden rounded-[28px] bg-stone-950 p-5 text-white shadow-[0_18px_50px_rgba(28,25,23,0.16)] sm:bg-white sm:p-7 sm:text-stone-900 sm:shadow-sm sm:ring-1 sm:ring-stone-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-rose-500/25 blur-3xl sm:hidden"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-300 sm:text-xs sm:text-rose-600">
                Analityka
              </p>

              <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em] sm:text-4xl">
                Statystyki
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/55 sm:text-base sm:leading-7 sm:text-stone-500">
                Zobacz,
                które produkty
                najbardziej
                interesują
                użytkowników.
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-[16px] bg-white/10 p-1 backdrop-blur-xl sm:border sm:border-stone-200 sm:bg-stone-50">
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
        </section>

        <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="W okresie"
            value={
              periodClicks.toString()
            }
            helper={`${selectedDays} dni`}
            icon="period"
          />

          <StatCard
            title="Łącznie"
            value={String(
              allClicksResult.count ??
                0
            )}
            helper="wszystkie kliknięcia"
            icon="total"
          />

          <StatCard
            title="Średnio"
            value={
              average.toFixed(
                1
              )
            }
            helper="na dzień"
            icon="average"
          />

          <StatCard
            title="Aktywne dni"
            value={`${daysWithClicks}/${selectedDays}`}
            helper="z ruchem"
            icon="days"
          />
        </section>

        <section className="mt-4 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Ruch
              </p>

              <h2 className="mt-1 text-lg font-black tracking-[-0.03em] sm:text-xl">
                Kliknięcia w czasie
              </h2>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">
              <ChartIcon />
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <ClicksChart
              data={
                chartData
              }
            />
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_340px]">
          <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
            <div className="flex items-end justify-between gap-4 border-b border-stone-100 p-4 sm:p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                  Ranking
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">
                  Najpopularniejsze
                </h2>

                <p className="mt-1 text-[10px] font-semibold text-stone-400 sm:text-xs">
                  Ostatnie{" "}
                  {
                    selectedDays
                  }{" "}
                  dni
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-black text-stone-500">
                {
                  ranking.length
                }{" "}
                produktów
              </span>
            </div>

            {ranking.length ===
            0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-black text-stone-700">
                  Brak danych
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Ranking pojawi
                  się po pierwszych
                  kliknięciach.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {ranking.map(
                  (
                    product,
                    index
                  ) => (
                    <article
                      key={
                        product.product_id
                      }
                      className="p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                            index ===
                            0
                              ? "bg-amber-100 text-amber-800"
                              : index ===
                                  1
                                ? "bg-stone-200 text-stone-700"
                                : index ===
                                    2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-stone-100 text-stone-500",
                          ].join(
                            " "
                          )}
                        >
                          {
                            index +
                            1
                          }
                        </span>

                        <img
                          src={
                            product.image_url
                          }
                          alt=""
                          className="h-14 w-12 shrink-0 rounded-[14px] object-cover sm:h-16 sm:w-14"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-black leading-5 text-stone-900 sm:text-sm">
                            {
                              product.short_name
                            }
                          </p>

                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={[
                                "h-2 w-2 rounded-full",
                                product.active
                                  ? "bg-emerald-500"
                                  : "bg-stone-300",
                              ].join(
                                " "
                              )}
                            />

                            <span className="text-[9px] font-black text-stone-400">
                              {product.active
                                ? "Aktywna"
                                : "Ukryta"}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xl font-black tracking-[-0.04em] text-stone-950">
                            {
                              product.clicks
                            }
                          </p>

                          <p className="text-[9px] font-semibold text-stone-400">
                            kliknięć
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/admin/social/${product.product_id}`}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[13px] bg-stone-950 px-3 text-[10px] font-black text-white"
                        >
                          <PhoneIcon />

                          Social
                        </Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <InsightCard
              icon="day"
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
              icon="product"
              label="Najlepszy produkt"
              value={
                bestProduct
                  ?.short_name ??
                "Brak danych"
              }
              metric={
                bestProduct
                  ? `${bestProduct.clicks} kliknięć`
                  : undefined
              }
            />

            {bestProduct && (
              <Link
                href={`/admin/social/${bestProduct.product_id}`}
                className="flex min-h-14 items-center justify-between rounded-[20px] bg-stone-950 px-4 text-white shadow-sm"
              >
                <div>
                  <p className="text-sm font-black">
                    Wykorzystaj wynik
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold text-white/45">
                    Przygotuj grafikę
                    top produktu
                  </p>
                </div>

                <span className="text-xl">
                  →
                </span>
              </Link>
            )}
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
  href:
    string;

  active:
    boolean;

  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={
        href
      }
      className={[
        "flex min-h-9 items-center justify-center rounded-[12px] px-5 text-xs font-black transition",
        active
          ? "bg-white text-stone-950 shadow-sm sm:bg-stone-950 sm:text-white"
          : "text-white/45 sm:text-stone-400",
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
  helper,
  icon,
}: {
  title:
    string;

  value:
    string;

  helper:
    string;

  icon:
    | "period"
    | "total"
    | "average"
    | "days";
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-stone-100 text-stone-600">
          <MetricIcon
            type={
              icon
            }
          />
        </span>

        <p className="text-2xl font-black tracking-[-0.05em] text-stone-950">
          {value}
        </p>
      </div>

      <p className="mt-3 text-xs font-black text-stone-700">
        {title}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-stone-400">
        {helper}
      </p>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  value,
  metric,
}: {
  icon:
    "day" |
    "product";

  label:
    string;

  value:
    string;

  metric?:
    string;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">
          {icon ===
          "day" ? (
            <CalendarIcon />
          ) : (
            <ProductIcon />
          )}
        </span>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
            {label}
          </p>

          <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-stone-900">
            {value}
          </p>

          {metric && (
            <p className="mt-2 text-xs font-black text-rose-600">
              {metric}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricIcon({
  type,
}: {
  type:
    | "period"
    | "total"
    | "average"
    | "days";
}) {
  if (
    type ===
    "days"
  ) {
    return (
      <CalendarIcon />
    );
  }

  if (
    type ===
    "average"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 17 10 12l3 3 6-8" />
      </svg>
    );
  }

  if (
    type ===
    "total"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 3 7 17 2.5-6.5L21 11Z" />
      </svg>
    );
  }

  return (
    <ChartIcon />
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7 12 3l8 4-8 4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />
    </svg>
  );
}