import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  updateSession,
} from "@/lib/supabase/proxy";

const LEGACY_HOSTS =
  new Set([
    "trend-za-mniej.vercel.app",
    "www.trendzamniej.pl",
  ]);

function getCanonicalOrigin() {
  const value =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (
    !value
  ) {
    return null;
  }

  try {
    return new URL(
      value
    ).origin;
  } catch {
    return null;
  }
}

function isAdminPath(
  pathname: string
) {
  return (
    pathname ===
      "/admin" ||
    pathname.startsWith(
      "/admin/"
    )
  );
}

export async function proxy(
  request:
    NextRequest
) {
  const host =
    request.headers
      .get(
        "host"
      )
      ?.split(
        ":"
      )[0]
      .toLowerCase();

  const canonicalOrigin =
    getCanonicalOrigin();

  if (
    host &&
    canonicalOrigin &&
    LEGACY_HOSTS.has(
      host
    )
  ) {
    const target =
      new URL(
        request.nextUrl.pathname +
          request.nextUrl.search,
        canonicalOrigin
      );

    return NextResponse.redirect(
      target,
      308
    );
  }

  if (
    isAdminPath(
      request.nextUrl.pathname
    )
  ) {
    return updateSession(
      request
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr).*)",
  ],
};