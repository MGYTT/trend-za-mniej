import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const { data } =
    await supabase.auth.getClaims();

  const isAdminRoute =
    request.nextUrl.pathname.startsWith(
      "/admin"
    );

  if (!isAdminRoute) {
    return response;
  }

  const userId =
    data?.claims?.sub;

  if (!userId) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.search = "";

    return NextResponse.redirect(url);
  }

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !admin) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.search = "";
    url.searchParams.set(
      "error",
      "access-denied"
    );

    return NextResponse.redirect(url);
  }

  return response;
}