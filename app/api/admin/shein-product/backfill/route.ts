import {
  NextResponse,
} from "next/server";

import {
  resolveSheinProductIdentity,
} from "@/lib/server/shein-resolver";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type ProductRow = {
  id: string;
  short_name: string;
  affiliate_url: string;

  shein_product_key:
    | string
    | null;
};

type Summary = {
  pending: number;
  resolved: number;
  unresolved: number;
  conflict: number;
};

type RequestBody = {
  retryUnresolved?: unknown;
};

type AdminRole =
  | "owner"
  | "editor";

async function requireAdmin() {
  const supabase =
    await createClient();

  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase.auth
      .getUser();

  if (
    userError ||
    !userData.user
  ) {
    return {
      supabase,
      authorized:
        false,
      status:
        401,
      userId:
        null,
      role:
        null,
    } as const;
  }

  const {
    data:
      membership,

    error:
      membershipError,
  } =
    await supabase
      .from(
        "admins"
      )
      .select(
        "user_id, role"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    return {
      supabase,
      authorized:
        false,
      status:
        403,
      userId:
        userData.user.id,
      role:
        null,
    } as const;
  }

  return {
    supabase,
    authorized:
      true,
    status:
      200,
    userId:
      userData.user.id,
    role:
      membership.role as
        AdminRole,
  } as const;
}

async function getSummary(
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >
): Promise<Summary> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "shein_identity_status"
      );

  if (
    error
  ) {
    throw error;
  }

  const summary:
    Summary = {
    pending:
      0,
    resolved:
      0,
    unresolved:
      0,
    conflict:
      0,
  };

  for (
    const item
    of data ?? []
  ) {
    const status =
      item.shein_identity_status as
        | keyof Summary
        | null;

    if (
      status &&
      status in
        summary
    ) {
      summary[
        status
      ] += 1;
    }
  }

  return summary;
}

async function resetUnresolved({
  supabase,
  userId,
  role,
}: {
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >;

  userId:
    string;

  role:
    AdminRole;
}) {
  let request =
    supabase
      .from(
        "products"
      )
      .update({
        shein_identity_status:
          "pending",

        shein_identity_checked_at:
          null,
      })
      .eq(
        "shein_identity_status",
        "unresolved"
      );

  if (
    role !==
    "owner"
  ) {
    request =
      request.eq(
        "created_by",
        userId
      );
  }

  const {
    error,
  } =
    await request;

  if (
    error
  ) {
    throw error;
  }
}

async function getNextPendingProduct({
  supabase,
  userId,
  role,
}: {
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >;

  userId:
    string;

  role:
    AdminRole;
}) {
  let request =
    supabase
      .from(
        "products"
      )
      .select(
        "id, short_name, affiliate_url, shein_product_key"
      )
      .eq(
        "shein_identity_status",
        "pending"
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      )
      .limit(
        1
      );

  if (
    role !==
    "owner"
  ) {
    request =
      request.eq(
        "created_by",
        userId
      );
  }

  const {
    data,
    error,
  } =
    await request
      .maybeSingle();

  if (
    error
  ) {
    throw error;
  }

  return data as
    | ProductRow
    | null;
}

async function markUnresolved({
  supabase,
  productId,
}: {
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >;

  productId:
    string;
}) {
  const {
    error,
  } =
    await supabase
      .from(
        "products"
      )
      .update({
        shein_identity_status:
          "unresolved",

        shein_identity_checked_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        productId
      );

  if (
    error
  ) {
    throw error;
  }
}

export async function POST(
  request: Request
) {
  const auth =
    await requireAdmin();

  if (
    !auth.authorized ||
    !auth.userId ||
    !auth.role
  ) {
    return NextResponse.json(
      {
        error:
          auth.status ===
          401
            ? "Brak autoryzacji."
            : "Brak uprawnień administratora.",
      },
      {
        status:
          auth.status,
      }
    );
  }

  const supabase =
    auth.supabase;

  let body:
    RequestBody = {};

  try {
    body =
      await request.json() as
        RequestBody;
  } catch {
    body = {};
  }

  const retryUnresolved =
    body.retryUnresolved ===
    true;

  try {
    if (
      retryUnresolved
    ) {
      await resetUnresolved({
        supabase,
        userId:
          auth.userId,
        role:
          auth.role,
      });
    }

    const product =
      await getNextPendingProduct({
        supabase,
        userId:
          auth.userId,
        role:
          auth.role,
      });

    if (
      !product
    ) {
      return NextResponse.json({
        done:
          true,
        scope:
          auth.role ===
          "owner"
            ? "catalog"
            : "own",
        summary:
          await getSummary(
            supabase
          ),
      });
    }

    if (
      product.shein_product_key
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            "products"
          )
          .update({
            shein_identity_status:
              "resolved",

            shein_identity_checked_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            product.id
          );

      if (
        error
      ) {
        throw error;
      }

      return NextResponse.json({
        done:
          false,
        processed: {
          id:
            product.id,
          name:
            product.short_name,
          result:
            "resolved",
          identity:
            product.shein_product_key,
        },
        summary:
          await getSummary(
            supabase
          ),
      });
    }

    if (
      !product.affiliate_url
        ?.trim()
    ) {
      await markUnresolved({
        supabase,
        productId:
          product.id,
      });

      return NextResponse.json({
        done:
          false,
        processed: {
          id:
            product.id,
          name:
            product.short_name,
          result:
            "unresolved",
        },
        summary:
          await getSummary(
            supabase
          ),
      });
    }

    let identity:
      Awaited<
        ReturnType<
          typeof resolveSheinProductIdentity
        >
      >["identity"] =
      null;

    try {
      const result =
        await resolveSheinProductIdentity({
          sourceText:
            "",
          affiliateUrl:
            product.affiliate_url,
        });

      identity =
        result.identity;
    } catch (
      error
    ) {
      console.error(
        "Błąd rozpoznawania starej oferty:",
        error
      );
    }

    if (
      !identity
    ) {
      await markUnresolved({
        supabase,
        productId:
          product.id,
      });

      return NextResponse.json({
        done:
          false,
        processed: {
          id:
            product.id,
          name:
            product.short_name,
          result:
            "unresolved",
        },
        summary:
          await getSummary(
            supabase
          ),
      });
    }

    const {
      data:
        existingProduct,

      error:
        existingError,
    } =
      await supabase
        .from(
          "products"
        )
        .select(
          "id, short_name"
        )
        .eq(
          "shein_product_key",
          identity.key
        )
        .neq(
          "id",
          product.id
        )
        .limit(
          1
        )
        .maybeSingle();

    if (
      existingError
    ) {
      throw existingError;
    }

    const nextStatus =
      existingProduct
        ? "conflict"
        : "resolved";

    const checkedAt =
      new Date()
        .toISOString();

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "products"
        )
        .update({
          shein_product_key:
            identity.key,

          shein_identity_status:
            nextStatus,

          shein_identity_checked_at:
            checkedAt,
        })
        .eq(
          "id",
          product.id
        );

    if (
      updateError
    ) {
      throw updateError;
    }

    return NextResponse.json({
      done:
        false,
      scope:
        auth.role ===
        "owner"
          ? "catalog"
          : "own",
      processed: {
        id:
          product.id,
        name:
          product.short_name,
        result:
          nextStatus,
        identity:
          identity.key,
        duplicateOf:
          existingProduct
            ?.short_name ??
          null,
      },
      summary:
        await getSummary(
          supabase
        ),
    });
  } catch (
    error
  ) {
    console.error(
      "Błąd skanowania tożsamości SHEIN:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się przetworzyć katalogu produktów.",
      },
      {
        status:
          500,
      }
    );
  }
}