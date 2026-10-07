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

const MAX_SOURCE_LENGTH =
  60_000;

const MAX_URL_LENGTH =
  4_096;

type RequestBody = {
  sourceText?: unknown;
  affiliateUrl?: unknown;
};

function normalizeString(
  value: unknown,
  maxLength: number
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .slice(
      0,
      maxLength
    )
    .trim();
}

export async function POST(
  request: Request
) {
  const contentLength =
    Number(
      request.headers.get(
        "content-length"
      ) ?? 0
    );

  if (
    Number.isFinite(
      contentLength
    ) &&
    contentLength >
      100_000
  ) {
    return NextResponse.json(
      {
        error:
          "Żądanie jest zbyt duże.",
      },
      {
        status: 413,
      }
    );
  }

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
    return NextResponse.json(
      {
        error:
          "Brak autoryzacji.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    data:
      adminMembership,
    error:
      adminError,
  } =
    await supabase
      .from("admins")
      .select("user_id")
      .eq(
        "user_id",
        userData.user.id
      )
      .maybeSingle();

  if (
    adminError ||
    !adminMembership
  ) {
    return NextResponse.json(
      {
        error:
          "Brak uprawnień administratora.",
      },
      {
        status: 403,
      }
    );
  }

  let body:
    RequestBody;

  try {
    body =
      await request.json() as
        RequestBody;
  } catch {
    return NextResponse.json(
      {
        error:
          "Niepoprawne dane wejściowe.",
      },
      {
        status: 400,
      }
    );
  }

  const sourceText =
    normalizeString(
      body.sourceText,
      MAX_SOURCE_LENGTH
    );

  const affiliateUrl =
    normalizeString(
      body.affiliateUrl,
      MAX_URL_LENGTH
    );

  if (
    !sourceText &&
    !affiliateUrl
  ) {
    return NextResponse.json(
      {
        error:
          "Brak danych produktu.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const result =
      await resolveSheinProductIdentity({
        sourceText,
        affiliateUrl,
      });

    return NextResponse.json(
      {
        identity:
          result.identity,

        method:
          result.method,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (
    resolveError
  ) {
    console.error(
      "Błąd resolvera SHEIN:",
      resolveError
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się sprawdzić produktu SHEIN.",
      },
      {
        status: 500,
      }
    );
  }
}