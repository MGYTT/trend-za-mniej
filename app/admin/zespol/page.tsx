import {
  redirect,
} from "next/navigation";

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
    productsResult,
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

      supabase
        .from(
          "products"
        )
        .select(
          "created_by"
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

  const productCounts =
    new Map<
      string,
      number
    >();

  for (
    const product
    of productsResult.data ??
    []
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
          productCounts.get(
            admin.user_id
          ) ??
          0,
      })
    );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
            Administratorzy 2.0
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            Zespół i role
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
            Każda oferta ma
            właściciela. Dzięki temu
            linki afiliacyjne i
            produkty różnych osób
            nie są przypadkowo
            nadpisywane.
          </p>
        </section>

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