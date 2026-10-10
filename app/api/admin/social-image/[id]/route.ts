import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_IMAGE_BYTES =
  12 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getSupabaseHost() {
  const value =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ?.trim();

  if (!value) {
    return null;
  }

  try {
    return new URL(
      value
    ).host;
  } catch {
    return null;
  }
}

function isAllowedProductImageUrl(
  value:
    string
) {
  const expectedHost =
    getSupabaseHost();

  if (!expectedHost) {
    return false;
  }

  try {
    const url =
      new URL(
        value
      );

    return (
      url.protocol ===
        "https:" &&
      url.host ===
        expectedHost &&
      url.pathname.startsWith(
        "/storage/v1/object/public/product-images/"
      )
    );
  } catch {
    return false;
  }
}

export async function GET(
  _request:
    Request,
  context:
    RouteContext
) {
  const {
    id,
  } =
    await context.params;

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
        status:
          401,
      }
    );
  }

  const [
    adminResult,
    productResult,
  ] =
    await Promise.all([
      supabase
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
        .maybeSingle(),

      supabase
        .from(
          "products"
        )
        .select(
          "image_url"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle(),
    ]);

  if (
    adminResult.error ||
    !adminResult.data
  ) {
    return NextResponse.json(
      {
        error:
          "Brak uprawnień administratora.",
      },
      {
        status:
          403,
      }
    );
  }

  const imageUrl =
    productResult.data
      ?.image_url
      ?.trim();

  if (
    productResult.error ||
    !imageUrl
  ) {
    return NextResponse.json(
      {
        error:
          "Nie znaleziono zdjęcia produktu.",
      },
      {
        status:
          404,
      }
    );
  }

  if (
    !isAllowedProductImageUrl(
      imageUrl
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Zdjęcie produktu ma nieobsługiwany adres.",
      },
      {
        status:
          400,
      }
    );
  }

  let imageResponse:
    Response;

  try {
    imageResponse =
      await fetch(
        imageUrl,
        {
          cache:
            "no-store",

          redirect:
            "error",
        }
      );
  } catch (
    error
  ) {
    console.error(
      "Błąd pobierania zdjęcia do Social Media Studio:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się pobrać zdjęcia produktu.",
      },
      {
        status:
          502,
      }
    );
  }

  if (
    !imageResponse.ok
  ) {
    return NextResponse.json(
      {
        error:
          "Źródło zdjęcia zwróciło błąd.",
      },
      {
        status:
          502,
      }
    );
  }

  const contentType =
    imageResponse.headers
      .get(
        "content-type"
      )
      ?.split(
        ";"
      )[0]
      .trim()
      .toLowerCase() ??
    "";

  if (
    !ALLOWED_IMAGE_TYPES.has(
      contentType
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Nieobsługiwany format zdjęcia.",
      },
      {
        status:
          415,
      }
    );
  }

  const declaredLength =
    Number(
      imageResponse.headers
        .get(
          "content-length"
        ) ??
        0
    );

  if (
    Number.isFinite(
      declaredLength
    ) &&
    declaredLength >
      MAX_IMAGE_BYTES
  ) {
    return NextResponse.json(
      {
        error:
          "Zdjęcie jest zbyt duże.",
      },
      {
        status:
          413,
      }
    );
  }

  const imageBuffer =
    await imageResponse
      .arrayBuffer();

  if (
    imageBuffer.byteLength >
    MAX_IMAGE_BYTES
  ) {
    return NextResponse.json(
      {
        error:
          "Zdjęcie jest zbyt duże.",
      },
      {
        status:
          413,
      }
    );
  }

  return new Response(
    imageBuffer,
    {
      status:
        200,

      headers: {
        "Content-Type":
          contentType,

        "Content-Length":
          String(
            imageBuffer.byteLength
          ),

        "Cache-Control":
          "private, max-age=300, stale-while-revalidate=600",

        "X-Content-Type-Options":
          "nosniff",
      },
    }
  );
}
