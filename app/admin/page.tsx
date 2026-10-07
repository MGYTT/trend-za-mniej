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
        .from("products")
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

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
                Centrum zarządzania
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
                Panel administratora
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
                Publikuj oferty,
                kontroluj ich
                widoczność i sprawdzaj,
                które produkty
                przyciągają najwięcej
                uwagi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link
                href="/admin/nowa-oferta"
                className="flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 sm:px-6"
              >
                <span className="mr-1.5 text-lg">
                  +
                </span>

                Dodaj ofertę
              </Link>

              <Link
                href="/admin/statystyki"
                className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:px-6"
              >
                Statystyki
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon="box"
            title="Wszystkie"
            value={
              products.length
            }
          />

          <StatCard
            icon="active"
            title="Aktywne"
            value={
              activeProducts
            }
          />

          <StatCard
            icon="hidden"
            title="Ukryte"
            value={
              hiddenProducts
            }
          />

          <StatCard
            icon="hot"
            title="Gorące"
            value={
              featuredProducts
            }
          />

          <StatCard
            icon="click"
            title="Kliknięcia"
            value={
              totalClicks
            }
            subtitle="łącznie"
          />

          <StatCard
            icon="today"
            title="Dzisiaj"
            value={
              todayClicks
            }
            subtitle="kliknięć"
          />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            href="/admin/nowa-oferta"
            icon="add"
            title="Nowa oferta"
            description="Dodaj produkt"
          />

          <QuickAction
            href="/admin/statystyki"
            icon="stats"
            title="Analityka"
            description="Sprawdź wyniki"
          />

          <QuickAction
            href="/"
            icon="external"
            title="Publiczna strona"
            description="Zobacz efekt"
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
  icon:
    | "box"
    | "active"
    | "hidden"
    | "hot"
    | "click"
    | "today";
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 text-rose-600">
          <StatIcon
            type={
              icon
            }
          />
        </span>

        <p className="text-2xl font-black tracking-[-0.04em] text-stone-900">
          {value}
        </p>
      </div>

      <p className="mt-3 text-xs font-black text-stone-700 sm:text-sm">
        {title}
      </p>

      {subtitle && (
        <p className="mt-0.5 text-[10px] text-stone-400">
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
  icon:
    | "add"
    | "stats"
    | "external";
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
      className="group flex min-h-[72px] items-center gap-3 rounded-[18px] border border-stone-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-rose-600 transition group-hover:bg-rose-50">
        <QuickIcon
          type={
            icon
          }
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-stone-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-stone-500">
          {description}
        </p>
      </div>

      <span className="ml-auto text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-500">
        →
      </span>
    </Link>
  );
}

function StatIcon({
  type,
}: {
  type:
    | "box"
    | "active"
    | "hidden"
    | "hot"
    | "click"
    | "today";
}) {
  if (
    type === "active"
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
        <path d="m5 12 4 4 10-10" />
      </svg>
    );
  }

  if (
    type === "hidden"
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
        <path d="m3 3 18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 9 4 10 8a12 12 0 0 1-2.2 4.2" />
        <path d="M6.2 6.2A11.8 11.8 0 0 0 2 12c1 4 5 8 10 8a10.8 10.8 0 0 0 3.8-.7" />
      </svg>
    );
  }

  if (
    type === "hot"
  ) {
    return (
      <span className="text-sm">
        🔥
      </span>
    );
  }

  if (
    type === "click"
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

  if (
    type === "today"
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
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    );
  }

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

function QuickIcon({
  type,
}: {
  type:
    | "add"
    | "stats"
    | "external";
}) {
  if (
    type === "add"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (
    type === "stats"
  ) {
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

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}