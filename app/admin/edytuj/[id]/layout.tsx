import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function EditProductLayout({
  children,
  params,
}: {
  children:
    React.ReactNode;

  params:
    Promise<{
      id: string;
    }>;
}) {
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

  if (!userId) {
    redirect(
      "/login"
    );
  }

  const [
    adminResult,
    ownerModeResult,
    productResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "admins"
        )
        .select(
          "role"
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
          "id, created_by"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle(),
    ]);

  if (
    !adminResult.data
  ) {
    redirect(
      "/login"
    );
  }

  /*
   * Jeżeli nie aktywowaliśmy
   * jeszcze właściciela,
   * zachowujemy dotychczasowy
   * sposób pracy.
   */
  const ownerModeActive =
    Boolean(
      ownerModeResult.data
    );

  if (
    !ownerModeActive
  ) {
    return children;
  }

  const currentRole =
    adminResult.data
      .role;

  if (
    currentRole ===
    "owner"
  ) {
    return children;
  }

  const productOwnerId =
    productResult.data
      ?.created_by ??
    null;

  if (
    productOwnerId !==
    userId
  ) {
    redirect(
      "/admin?notice=foreign-offer"
    );
  }

  return children;
}