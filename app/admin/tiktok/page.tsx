import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminTikTokManager from "@/components/admin/AdminTikTokManager";

import {
  canManageOffer,
  type AdminRole,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/server";

type AdminRow = {
  user_id: string;
  role: AdminRole;
};

export default async function AdminTikTokPage() {
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
          "user_id, role"
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

  const {
    data:
      productsData,

    error:
      productsError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "id, slug, name, short_name, price, old_price, category, image_url, featured, active, created_at, updated_at, created_by, tiktok_featured, tiktok_featured_at"
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (
    productsError
  ) {
    console.error(
      "Nie udało się pobrać produktów do modułu TikTok:",
      productsError
    );
  }

  const products =
    (
      productsData ??
      []
    ).map(
      (
        product
      ) => ({
        ...product,

        tiktok_featured:
          Boolean(
            product.tiktok_featured
          ),

        tiktok_featured_at:
          product.tiktok_featured_at ??
          null,

        canManage:
          canManageOffer({
            currentUserId:
              userId,

            currentRole,

            ownerModeActive,

            productOwnerId:
              product.created_by,
          }),
      })
    );

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <AdminTikTokManager
          products={
            products
          }
        />
      </div>
    </main>
  );
}