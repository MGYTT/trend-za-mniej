import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";

import AdminSocialHub, {
  type AdminSocialProduct,
} from "@/components/admin/AdminSocialHub";

import {
  createClient,
} from "@/lib/supabase/server";

type AdminRow = {
  user_id:
    string;
};

type ProductRow = {
  id:
    string;

  slug:
    string;

  name:
    string;

  short_name:
    string;

  category:
    string;

  image_url:
    string;

  price:
    | number
    | string;

  active:
    boolean;

  featured:
    boolean;
};

export default async function AdminSocialPage() {
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

  const admin =
    adminData as
      AdminRow;

  if (
    !admin.user_id
  ) {
    redirect(
      "/login"
    );
  }

  const {
    data:
      productsData,
    error,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "id, slug, name, short_name, category, image_url, price, active, featured"
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (
    error
  ) {
    console.error(
      "Nie udało się pobrać produktów Social Media Studio:",
      error
    );
  }

  const rows =
    (
      productsData ??
      []
    ) as ProductRow[];

  const products:
    AdminSocialProduct[] =
    rows.map(
      (
        product
      ) => ({
        id:
          product.id,

        slug:
          product.slug,

        name:
          product.name,

        shortName:
          product.short_name,

        category:
          product.category,

        imageUrl:
          product.image_url,

        price:
          product.price,

        active:
          product.active,

        featured:
          product.featured,
      })
    );

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-900">
      <AdminHeader />

      <AdminSocialHub
        products={
          products
        }
      />
    </main>
  );
}