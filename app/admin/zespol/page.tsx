import {
  redirect,
} from "next/navigation";

import AdminActivityPanel, {
  type AdminActivityEntry,
  type AdminActivityMember,
} from "@/components/admin/AdminActivityPanel";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminTeamManager from "@/components/admin/AdminTeamManager";

import {
  type AdminRole,
  type AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/server";

type AdminRow = {
  user_id: string;

  display_name:
    | string
    | null;

  role:
    AdminRole;
};

type ProductRow = {
  created_by:
    | string
    | null;

  active:
    boolean;

  created_at:
    string;
};

type PresenceRow = {
  user_id: string;

  last_seen_at:
    string;

  last_login_at:
    | string
    | null;

  last_logout_at:
    | string
    | null;

  session_started_at:
    | string
    | null;

  current_path:
    | string
    | null;

  login_count:
    number;
};

type ActivityRow = {
  id:
    number;

  actor_id:
    | string
    | null;

  product_name:
    string;

  action:
    | "created"
    | "updated"
    | "deleted";

  changed_fields:
    | string[]
    | null;

  created_at:
    string;
};

type ProductSummary = {
  total:
    number;

  active:
    number;

  added7:
    number;

  added30:
    number;

  lastProductAt:
    | string
    | null;
};

export default async function AdminTeamPage() {
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

  const [
    profileResult,
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
    !profileResult.data
  ) {
    redirect(
      "/login"
    );
  }

  const currentProfile =
    profileResult.data as
      AdminRow;

  const ownerModeActive =
    Boolean(
      ownerModeResult.data
    );

  let admins:
    AdminRow[] = [
      currentProfile,
    ];

  if (
    currentProfile.role ===
    "owner"
  ) {
    const {
      data:
        teamData,
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

    admins =
      (
        teamData ??
        []
      ) as AdminRow[];
  }

  const [
    productsResult,
    presenceResult,
    activityResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "products"
        )
        .select(
          "created_by, active, created_at"
        ),

      supabase
        .from(
          "admin_presence"
        )
        .select(
          "user_id, last_seen_at, last_login_at, last_logout_at, session_started_at, current_path, login_count"
        ),

      supabase
        .from(
          "product_activity"
        )
        .select(
          "id, actor_id, product_name, action, changed_fields, created_at"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(
          30
        ),
    ]);

  const products =
    (
      productsResult.data ??
      []
    ) as ProductRow[];

  const presence =
    (
      presenceResult.data ??
      []
    ) as PresenceRow[];

  const activity =
    (
      activityResult.data ??
      []
    ) as ActivityRow[];

  const serverNow =
    new Date();

  const sevenDaysAgo =
    new Date(
      serverNow.getTime() -
        7 *
          24 *
          60 *
          60 *
          1000
    );

  const thirtyDaysAgo =
    new Date(
      serverNow.getTime() -
        30 *
          24 *
          60 *
          60 *
          1000
    );

  const productSummaries =
    new Map<
      string,
      ProductSummary
    >();

  for (
    const admin
    of admins
  ) {
    productSummaries.set(
      admin.user_id,
      {
        total:
          0,

        active:
          0,

        added7:
          0,

        added30:
          0,

        lastProductAt:
          null,
      }
    );
  }

  for (
    const product
    of products
  ) {
    if (
      !product.created_by
    ) {
      continue;
    }

    const summary =
      productSummaries.get(
        product.created_by
      );

    if (
      !summary
    ) {
      continue;
    }

    summary.total +=
      1;

    if (
      product.active
    ) {
      summary.active +=
        1;
    }

    const productDate =
      new Date(
        product.created_at
      );

    if (
      productDate >=
      sevenDaysAgo
    ) {
      summary.added7 +=
        1;
    }

    if (
      productDate >=
      thirtyDaysAgo
    ) {
      summary.added30 +=
        1;
    }

    if (
      !summary.lastProductAt ||
      productDate.getTime() >
        new Date(
          summary.lastProductAt
        ).getTime()
    ) {
      summary.lastProductAt =
        product.created_at;
    }
  }

  const presenceMap =
    new Map<
      string,
      PresenceRow
    >();

  for (
    const row
    of presence
  ) {
    presenceMap.set(
      row.user_id,
      row
    );
  }

  const members:
    AdminTeamMember[] =
    admins.map(
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
          productSummaries.get(
            admin.user_id
          )
            ?.total ??
          0,
      })
    );

  const activityMembers:
    AdminActivityMember[] =
    admins.map(
      (
        admin
      ) => {
        const summary =
          productSummaries.get(
            admin.user_id
          ) ?? {
            total:
              0,

            active:
              0,

            added7:
              0,

            added30:
              0,

            lastProductAt:
              null,
          };

        const presenceRow =
          presenceMap.get(
            admin.user_id
          );

        return {
          userId:
            admin.user_id,

          displayName:
            admin.display_name
              ?.trim() ||
            "Administrator",

          role:
            admin.role,

          totalProducts:
            summary.total,

          activeProducts:
            summary.active,

          addedLast7Days:
            summary.added7,

          addedLast30Days:
            summary.added30,

          lastProductAt:
            summary.lastProductAt,

          lastSeenAt:
            presenceRow
              ?.last_seen_at ??
            null,

          lastLoginAt:
            presenceRow
              ?.last_login_at ??
            null,

          lastLogoutAt:
            presenceRow
              ?.last_logout_at ??
            null,

          sessionStartedAt:
            presenceRow
              ?.session_started_at ??
            null,

          currentPath:
            presenceRow
              ?.current_path ??
            null,

          loginCount:
            presenceRow
              ?.login_count ??
            0,
        };
      }
    );

  const recentActivity:
    AdminActivityEntry[] =
    activity.map(
      (
        row
      ) => ({
        id:
          row.id,

        actorId:
          row.actor_id,

        productName:
          row.product_name,

        action:
          row.action,

        changedFields:
          row.changed_fields ??
          [],

        createdAt:
          row.created_at,
      })
    );

  const onlineNow =
    activityMembers.filter(
      (
        member
      ) => {
        if (
          !member.lastSeenAt
        ) {
          return false;
        }

        return (
          serverNow.getTime() -
          new Date(
            member.lastSeenAt
          ).getTime()
        ) <=
          2 *
            60 *
            1000;
      }
    ).length;

  const displayName =
    currentProfile.display_name
      ?.trim() ||
    "Administrator";

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
        <section className="relative overflow-hidden rounded-[28px] bg-stone-950 p-5 text-white shadow-[0_18px_50px_rgba(28,25,23,0.16)] sm:bg-white sm:p-7 sm:text-stone-900 sm:shadow-sm sm:ring-1 sm:ring-stone-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl sm:hidden"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-rose-500/20 blur-3xl sm:hidden"
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-300 sm:text-xs sm:text-rose-600">
                  Konto i zespół
                </p>

                <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em] sm:text-4xl">
                  Więcej
                </h1>

                <p className="mt-2 max-w-3xl text-xs leading-5 text-white/55 sm:text-base sm:leading-7 sm:text-stone-500">
                  Profil,
                  aktywność,
                  administratorzy
                  i uprawnienia
                  projektu.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/10 bg-white/10 text-sm font-black backdrop-blur-xl sm:bg-stone-100 sm:text-stone-700">
                {displayName
                  .slice(
                    0,
                    1
                  )
                  .toUpperCase()}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <HeaderMetric
                label="Rola"
                value={
                  currentProfile.role ===
                  "owner"
                    ? "Owner"
                    : "Admin"
                }
              />

              <HeaderMetric
                label="Zespół"
                value={
                  String(
                    admins.length
                  )
                }
              />

              <HeaderMetric
                label="Online"
                value={
                  String(
                    onlineNow
                  )
                }
              />
            </div>
          </div>
        </section>

        <div className="mt-4">
          <AdminActivityPanel
            members={
              activityMembers
            }
            recentActivity={
              recentActivity
            }
            canSeeTeam={
              currentProfile.role ===
              "owner"
            }
            serverNow={
              serverNow.toISOString()
            }
          />
        </div>

        <div className="mt-4">
          <AdminTeamManager
            currentUserId={
              userId
            }
            currentRole={
              currentProfile.role
            }
            ownerModeActive={
              ownerModeActive
            }
            members={
              members
            }
          />
        </div>
      </div>
    </main>
  );
}

function HeaderMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-xl sm:border-stone-200 sm:bg-stone-50">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-white/40 sm:text-stone-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-white sm:text-stone-900">
        {value}
      </p>
    </div>
  );
}