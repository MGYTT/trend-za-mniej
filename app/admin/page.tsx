import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminProductList from "@/components/admin/AdminProductList";

import {
  createClient,
} from "@/lib/supabase/server";

type ProductStatRow = {
  product_id: string;
  clicks:
    | number
    | string;
};

export default async function AdminPage() {
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

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const [
    productsResult,
    clicksResult,
    todayClicksResult,
    productStatsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "products"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
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
        )
        .gte(
          "created_at",
          today.toISOString()
        ),

      supabase.rpc(
        "get_product_click_stats",
        {
          p_days: 30,
        }
      ),
    ]);

  const products =
    productsResult.data ??
    [];

  const activeProducts =
    products.filter(
      (product) =>
        product.active
    ).length;

  const hiddenProducts =
    products.length -
    activeProducts;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured
    ).length;

  const totalClicks =
    clicksResult.count ??
    0;

  const todayClicks =
    todayClicksResult.count ??
    0;

  const productStats = (
    (
      productStatsResult.data ??
      []
    ) as ProductStatRow[]
  ).reduce<
    Record<
      string,
      number
    >
  >(
    (
      result,
      item
    ) => {
      result[
        item.product_id
      ] =
        Number(
          item.clicks
        );

      return result;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[30px] border border-rose-100 bg-gradient-to-br from-white via-rose-50/50 to-orange-50 p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
                Centrum zarządzania
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Panel administratora
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                Dodawaj i edytuj
                oferty, kontroluj ich
                widoczność oraz
                obserwuj
                zainteresowanie.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:flex">
              <Link
                href="/admin/nowa-oferta"
                className="flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="mr-2 text-xl">
                  +
                </span>

                Dodaj ofertę
              </Link>

              <Link
                href="/admin/statystyki"
                className="flex min-h-13 items-center justify-center rounded-2xl border border-rose-200 bg-white px-6 font-black text-rose-700 shadow-sm transition hover:bg-rose-50"
              >
                Statystyki
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="horizontal-scroll -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon="🛍️"
              title="Wszystkie"
              value={
                products.length
              }
            />

            <StatCard
              icon="✅"
              title="Aktywne"
              value={
                activeProducts
              }
            />

            <StatCard
              icon="🙈"
              title="Ukryte"
              value={
                hiddenProducts
              }
            />

            <StatCard
              icon="🔥"
              title="Gorące"
              value={
                featuredProducts
              }
            />

            <StatCard
              icon="🖱️"
              title="Kliknięcia"
              value={
                totalClicks
              }
              subtitle="łącznie"
            />

            <StatCard
              icon="📈"
              title="Dzisiaj"
              value={
                todayClicks
              }
              subtitle="kliknięć"
            />
          </div>

          <p className="mt-2 text-xs font-semibold text-stone-400 sm:hidden">
            ← Przesuń, aby zobaczyć
            wszystkie statystyki →
          </p>
        </section>

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/admin/nowa-oferta"
            icon="＋"
            title="Nowa oferta"
            description="Dodaj kolejny produkt"
          />

          <QuickAction
            href="/admin/statystyki"
            icon="↗"
            title="Analityka"
            description="Sprawdź kliknięcia"
          />

          <QuickAction
            href="/"
            icon="◎"
            title="Publiczna strona"
            description="Zobacz efekt zmian"
            external
          />
        </section>

        <AdminProductList
          products={
            products
          }
          productStats={
            productStats
          }
        />
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="min-w-[155px] snap-start rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm sm:min-w-0 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-lg">
          {icon}
        </div>

        <p className="text-2xl font-black tracking-tight text-stone-900">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-black text-stone-700">
        {title}
      </p>

      {subtitle && (
        <p className="mt-0.5 text-xs text-stone-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  external = false,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      className="group flex min-h-[82px] items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-rose-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-xl font-black text-stone-700 transition group-hover:bg-rose-50 group-hover:text-rose-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="font-black text-stone-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-stone-500">
          {description}
        </p>
      </div>

      <span
        aria-hidden="true"
        className="ml-auto text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-500"
      >
        →
      </span>
    </Link>
  );
}