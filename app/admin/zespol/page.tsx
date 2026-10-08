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

  login_count: number;
};

type ActivityRow = {
  id: number;

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
  total: number;
  active: number;
  added7: number;
  added30: number;

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

  if (!userId) {
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

    if (!summary) {
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

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
            Administratorzy
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            Zespół i aktywność
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
            Sprawdzaj aktywność
            administratorów,
            ostatnie logowania,
            dodawane oferty oraz
            historię pracy nad
            katalogiem.
          </p>
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