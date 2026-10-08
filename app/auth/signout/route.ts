import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

export async function POST(
  request:
    NextRequest
) {
  const supabase =
    await createClient();

  const {
    error:
      presenceError,
  } =
    await supabase.rpc(
      "end_admin_session"
    );

  if (
    presenceError
  ) {
    console.error(
      "Nie udało się zakończyć sesji administratora w statystykach:",
      presenceError
    );
  }

  await supabase.auth
    .signOut();

  return NextResponse.redirect(
    new URL(
      "/login",
      request.url
    ),
    {
      status:
        302,
    }
  );
}