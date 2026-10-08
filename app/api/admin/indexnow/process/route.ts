import {
  NextResponse,
} from "next/server";

import {
  submitIndexNowUrls,
} from "@/lib/indexnow";

import {
  getSiteUrl,
} from "@/lib/site";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type QueueRow = {
  id: number;

  path: string;

  reason: string;
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
      authorized:
        false,

      status:
        401,
    };
  }

  const {
    data:
      admin,
    error:
      adminError,
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
        userData.user.id
      )
      .maybeSingle();

  if (
    adminError ||
    !admin
  ) {
    return {
      authorized:
        false,

      status:
        403,
    };
  }

  return {
    authorized:
      true,

    status:
      200,
  };
}

export async function POST() {
  const auth =
    await requireAdmin();

  if (
    !auth.authorized
  ) {
    return NextResponse.json(
      {
        success:
          false,

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

  let admin;

  try {
    admin =
      createAdminClient();
  } catch (
    error
  ) {
    console.error(
      "Brak klienta administracyjnego Supabase:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          "Brak konfiguracji serwerowej Supabase.",
      },
      {
        status:
          500,
      }
    );
  }

  const {
    data,
    error:
      queueError,
  } =
    await admin
      .from(
        "search_index_queue"
      )
      .select(
        "id, path, reason"
      )
      .is(
        "submitted_at",
        null
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      )
      .limit(
        200
      );

  if (
    queueError
  ) {
    console.error(
      "Błąd pobierania kolejki IndexNow:",
      queueError
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          "Nie udało się pobrać kolejki zmian.",
      },
      {
        status:
          500,
      }
    );
  }

  const items =
    (
      data ??
      []
    ) as QueueRow[];

  if (
    items.length ===
    0
  ) {
    return NextResponse.json({
      success:
        true,

      processed:
        0,

      pending:
        0,

      message:
        "Brak oczekujących adresów.",
    });
  }

  const siteUrl =
    getSiteUrl();

  const urls =
    items.map(
      (
        item
      ) =>
        new URL(
          item.path,
          siteUrl
        ).toString()
    );

  const result =
    await submitIndexNowUrls(
      urls
    );

  const ids =
    items.map(
      (
        item
      ) =>
        item.id
    );

  const now =
    new Date().toISOString();

  if (
    result.success
  ) {
    const {
      error:
        updateError,
    } =
      await admin
        .from(
          "search_index_queue"
        )
        .update({
          submitted_at:
            now,

          last_attempt_at:
            now,

          last_status:
            result.status,

          last_error:
            null,
        })
        .in(
          "id",
          ids
        );

    if (
      updateError
    ) {
      console.error(
        "Błąd oznaczania kolejki IndexNow:",
        updateError
      );

      return NextResponse.json(
        {
          success:
            false,

          error:
            "Adresy zostały wysłane, ale nie udało się zapisać stanu kolejki.",
        },
        {
          status:
            500,
        }
      );
    }
  } else {
    const {
      error:
        updateError,
    } =
      await admin
        .from(
          "search_index_queue"
        )
        .update({
          last_attempt_at:
            now,

          last_status:
            result.status ||
            null,

          last_error:
            result.message,
        })
        .in(
          "id",
          ids
        );

    if (
      updateError
    ) {
      console.error(
        "Błąd zapisywania błędu IndexNow:",
        updateError
      );
    }
  }

  const {
    count:
      pendingCount,
  } =
    await admin
      .from(
        "search_index_queue"
      )
      .select(
        "id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .is(
        "submitted_at",
        null
      );

  return NextResponse.json(
    {
      success:
        result.success,

      processed:
        result.success
          ? items.length
          : 0,

      attempted:
        items.length,

      pending:
        pendingCount ??
        0,

      status:
        result.status,

      message:
        result.message,
    },
    {
      status:
        result.success
          ? 200
          : 503,
    }
  );
}