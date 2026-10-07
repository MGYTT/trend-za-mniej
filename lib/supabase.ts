import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Brakuje zmiennej NEXT_PUBLIC_SUPABASE_URL w pliku .env.local"
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Brakuje zmiennej NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY w pliku .env.local"
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);