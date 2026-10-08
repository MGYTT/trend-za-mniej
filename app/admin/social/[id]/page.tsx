import {
  notFound,
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import SocialMediaStudio from "@/components/admin/SocialMediaStudio";

import {
  createClient,
} from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type AdminRow = {
  user_id: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  category: string;
  image_url: string;

  price:
    | number
    | string;

  old_price:
    | number
    | string
    | null;

  featured: boolean;
  active: boolean;
};

export default async function SocialMediaPage({
  params,
}: Props) {
  const {
    id,
  } =
    await params;

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
      productData,
    error:
      productError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "id, slug, name, short_name, category, image_url, price, old_price, featured, active"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (
    productError
  ) {
    console.error(
      "Błąd pobierania produktu do Social Media Studio:",
      productError
    );
  }

  if (
    !productData
  ) {
    notFound();
  }

  const product =
    productData as
      ProductRow;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <SocialMediaStudio
        product={{
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

          oldPrice:
            product.old_price,

          featured:
            product.featured,

          active:
            product.active,
        }}
      />
    </main>
  );
}