import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminProductList from "@/components/admin/AdminProductList";
import DuplicateProtectionStatus from "@/components/admin/DuplicateProtectionStatus";

import {
  type AdminRole,
  type AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/server";

type ProductStatRow = {
  product_id: string;

  clicks:
    | number
    | string;
};

type IdentityStatus =
  | "pending"
  | "resolved"
  | "unresolved"
  | "conflict";

type AdminRow = {
  user_id: string;

  display_name:
    | string
    | null;

  role:
    AdminRole;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams:
    Promise<{
      notice?: string;
    }>;
}) {
  const params =
    await searchParams;

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

  if (!userId) {
    redirect(
      "/login"
    );
  }

  const [
    currentAdminResult,
    ownerModeResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "admins"
        )
        .select(
          "user_id, display_name, role"
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle(),

      supabase.rpc(
        "owner_role_exists"
      ),
    ]);

  if (
    !currentAdminResult.data
  ) {
    redirect(
      "/login"
    );
  }

  const currentAdmin =
    currentAdminResult.data as
      AdminRow;

  const currentRole =
    currentAdmin.role;

  const ownerModeActive =
    Boolean(
      ownerModeResult.data
    );

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
        .select(
          "*"
        )
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

            head:
              true,
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

  let adminRows:
    AdminRow[] = [
      currentAdmin,
    ];

  if (
    currentRole ===
    "owner"
  ) {
    const {
      data:
        adminsData,
    } =
      await supabase
        .from(
          "admins"
        )
        .select(
          "user_id, display_name, role"
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          }
        );

    adminRows =
      (
        adminsData ??
        []
      ) as AdminRow[];
  }

  const productCounts =
    new Map<
      string,
      number
    >();

  for (
    const product
    of products
  ) {
    if (
      !product.created_by
    ) {
      continue;
    }

    productCounts.set(
      product.created_by,
      (
        productCounts.get(
          product.created_by
        ) ??
        0
      ) +
        1
    );
  }

  const teamMembers:
    AdminTeamMember[] =
    adminRows.map(
      (
        admin
      ) => ({
        userId:
          admin.user_id,

        displayName:
          admin.display_name
            ?.trim() ||
          "Administrator",

        role:
          admin.role,

        productCount:
          productCounts.get(
            admin.user_id
          ) ??
          0,
      })
    );

  const activeProducts =
    products.filter(
      (
        product
      ) =>
        product.active
    ).length;

  const hiddenProducts =
    products.length -
    activeProducts;

  const featuredProducts =
    products.filter(
      (
        product
      ) =>
        product.featured
    ).length;

  const totalClicks =
    clicksResult.count ??
    0;

  const todayClicks =
    todayClicksResult.count ??
    0;

  const identitySummary = {
    pending: 0,
    resolved: 0,
    unresolved: 0,
    conflict: 0,
  };

  for (
    const product
    of products
  ) {
    const status =
      product.shein_identity_status as
        | IdentityStatus
        | null
        | undefined;

    if (
      status &&
      status in
        identitySummary
    ) {
      identitySummary[
        status
      ] += 1;
    } else if (
      product.shein_product_key
    ) {
      identitySummary.resolved +=
        1;
    } else {
      identitySummary.pending +=
        1;
    }
  }

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
        {params.notice ===
          "foreign-offer" && (
          <div className="mb-4 rounded-[18px] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-900">
              🔒 Oferta jest
              chroniona
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800 sm:text-sm">
              Ta oferta należy do
              innego administratora.
              Możesz ją zobaczyć w
              katalogu, ale nie
              możesz zmieniać jej
              danych ani linku
              afiliacyjnego.
            </p>
          </div>
        )}

        <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
                Centrum zarządzania
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
                Panel administratora
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[10px] font-black",
                    currentRole ===
                    "owner"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-blue-50 text-blue-700",
                  ].join(
                    " "
                  )}
                >
                  {currentRole ===
                  "owner"
                    ? "👑 Właściciel"
                    : "Administrator"}
                </span>

                {ownerModeActive && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-700">
                    ✓ Własność ofert
                    aktywna
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
                Publikuj oferty,
                kontroluj ich
                widoczność i
                zarządzaj produktami
                zgodnie z
                przypisanym
                właścicielem.
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
                href="/admin/zespol"
                className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:px-6"
              >
                Zespół
              </Link>
            </div>
          </div>
        </section>

        <DuplicateProtectionStatus
          initialSummary={
            identitySummary
          }
        />

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
            href="/admin/zespol"
            icon="team"
            title="Zespół"
            description="Role i właściciele"
          />
        </section>

        <AdminProductList
          products={
            products
          }
          productStats={
            productStats
          }
          currentUserId={
            userId
          }
          currentRole={
            currentRole
          }
          ownerModeActive={
            ownerModeActive
          }
          teamMembers={
            teamMembers
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
}: {
  href: string;

  icon:
    | "add"
    | "stats"
    | "team";

  title: string;
  description: string;
}) {
  return (
    <Link
      href={
        href
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
    type ===
    "active"
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
    type ===
    "hidden"
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
    type ===
    "hot"
  ) {
    return (
      <span className="text-sm">
        🔥
      </span>
    );
  }

  if (
    type ===
    "click"
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
    type ===
    "today"
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
    | "team";
}) {
  if (
    type ===
    "add"
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
    type ===
    "team"
  ) {
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
        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <path d="M3 20a6 6 0 0 1 12 0" />

        <circle
          cx="17"
          cy="9"
          r="2"
        />

        <path d="M16 15a5 5 0 0 1 5 5" />
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
    >
      <path d="M5 20V10" />

      <path d="M12 20V4" />

      <path d="M19 20v-7" />
    </svg>
  );
}