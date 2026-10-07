import "server-only";

import {
  createClient,
} from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env
      .SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Brak NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!secretKey) {
    throw new Error(
      "Brak SUPABASE_SECRET_KEY."
    );
  }

  return createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },
    }
  );
}