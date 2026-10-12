import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSeoQualityManager, {
  type AdminSeoAuditProduct,
} from "@/components/admin/AdminSeoQualityManager";

import {
  canManageOffer,
  type AdminRole,
} from "@/lib/admin-permissions";

import {
  auditSeoCatalog,
  type SeoQualityProductInput,
} from "@/lib/seo-quality";

import {
  createClient,
} from "@/lib/supabase/server";

export const metadata: Metadata = {
  title:
    "SEO Quality",

  robots: {
    index:
      false,

    follow:
      false,
  },
};

type AdminRow = {
  user_id: string;
  role: AdminRole;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  category: string;
  image_url: string;
  active: boolean;

  created_by:
    | string
    | null;
};

export default async function AdminSeoPage() {
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
        "id, slug, name, short_name, description, category, image_url, active, created_by"
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
      "Nie udało się pobrać produktów do audytu SEO:",
      productsError
    );
  }

  const rows =
    (
      productsData ??
      []
    ) as ProductRow[];

  const auditInput:
    SeoQualityProductInput[] =
    rows.map(
      (
        product
      ) => ({
        id:
          product.id,

        slug:
          product.slug ??
          "",

        name:
          product.name ??
          "",

        shortName:
          product.short_name ??
          "",

        description:
          product.description ??
          "",

        category:
          product.category ??
          "",

        imageUrl:
          product.image_url ??
          "",

        active:
          Boolean(
            product.active
          ),
      })
    );

  const audits =
    auditSeoCatalog(
      auditInput
    );

  const rowById =
    new Map(
      rows.map(
        (
          product
        ) => [
          product.id,
          product,
        ] as const
      )
    );

  const products:
    AdminSeoAuditProduct[] =
    audits.map(
      (
        audit
      ) => {
        const row =
          rowById.get(
            audit.id
          );

        return {
          ...audit,

          canManage:
            canManageOffer({
              currentUserId:
                userId,

              currentRole,

              ownerModeActive,

              productOwnerId:
                row?.created_by ??
                null,
            }),
        };
      }
    );

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <AdminSeoQualityManager
          products={
            products
          }
        />
      </div>
    </main>
  );
}