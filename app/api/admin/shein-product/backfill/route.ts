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
};

type Summary = {
  pending: number;
  resolved: number;
  unresolved: number;
  conflict: number;
};

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
      status: 401,
    };
  }

  const {
    data:
      membership,
  } =
    await supabase
      .from("admins")
      .select("user_id")
      .eq(
        "user_id",
        userData.user.id
      )
      .maybeSingle();

  return {
    supabase,

    authorized:
      Boolean(
        membership
      ),

    status:
      membership
        ? 200
        : 403,
  };
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
  } =
    await supabase
      .from("products")
      .select(
        "shein_identity_status"
      );

  const summary:
    Summary = {
    pending: 0,
    resolved: 0,
    unresolved: 0,
    conflict: 0,
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

export async function POST() {
  const auth =
    await requireAdmin();

  if (
    !auth.authorized
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

  const {
    data:
      productData,
    error:
      productError,
  } =
    await supabase
      .from("products")
      .select(
        "id, short_name, affiliate_url"
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
      .limit(1)
      .maybeSingle();

  if (
    productError
  ) {
    console.error(
      "Błąd pobierania produktu do backfillu:",
      productError
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się pobrać starszej oferty.",
      },
      {
        status: 500,
      }
    );
  }

  if (
    !productData
  ) {
    return NextResponse.json(
      {
        done: true,

        summary:
          await getSummary(
            supabase
          ),
      }
    );
  }

  const product =
    productData as
      ProductRow;

  if (
    !product.affiliate_url
      ?.trim()
  ) {
    await supabase
      .from("products")
      .update({
        shein_identity_status:
          "unresolved",

        shein_identity_checked_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        product.id
      );

    return NextResponse.json(
      {
        done: false,

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
      }
    );
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
        sourceText: "",

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

  if (!identity) {
    await supabase
      .from("products")
      .update({
        shein_identity_status:
          "unresolved",

        shein_identity_checked_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        product.id
      );

    return NextResponse.json(
      {
        done: false,

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
      }
    );
  }

  const {
    data:
      existingProduct,
    error:
      existingError,
  } =
    await supabase
      .from("products")
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
      .limit(1)
      .maybeSingle();

  if (
    existingError
  ) {
    console.error(
      "Błąd sprawdzania konfliktu podczas backfillu:",
      existingError
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się sprawdzić istniejącego identyfikatora.",
      },
      {
        status: 500,
      }
    );
  }

  if (
    existingProduct
  ) {
    await supabase
      .from("products")
      .update({
        shein_identity_status:
          "conflict",

        shein_identity_checked_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        product.id
      );

    return NextResponse.json(
      {
        done: false,

        processed: {
          id:
            product.id,

          name:
            product.short_name,

          result:
            "conflict",

          duplicateOf:
            existingProduct
              .short_name,
        },

        summary:
          await getSummary(
            supabase
          ),
      }
    );
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .from("products")
      .update({
        shein_product_key:
          identity.key,

        shein_identity_checked_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        product.id
      );

  if (
    updateError
  ) {
    if (
      updateError.code ===
      "23505"
    ) {
      await supabase
        .from("products")
        .update({
          shein_identity_status:
            "conflict",

          shein_identity_checked_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          product.id
        );

      return NextResponse.json(
        {
          done: false,

          processed: {
            id:
              product.id,

            name:
              product.short_name,

            result:
              "conflict",
          },

          summary:
            await getSummary(
              supabase
            ),
        }
      );
    }

    console.error(
      "Błąd zapisu identyfikatora SHEIN:",
      updateError
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się zapisać identyfikatora produktu.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      done: false,

      processed: {
        id:
          product.id,

        name:
          product.short_name,

        result:
          "resolved",

        identity:
          identity.key,
      },

      summary:
        await getSummary(
          supabase
        ),
    }
  );
}