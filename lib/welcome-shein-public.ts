import { supabase } from "@/lib/supabase";
import { mapWelcomeRow, type WelcomeSheinSettings } from "@/lib/welcome-shein-settings";

/** Fail closed: a disabled or unavailable offer must not be shown to visitors. */
export async function getPublicWelcomeSheinOffer(): Promise<WelcomeSheinSettings | null> {
  // A database toggle alone cannot publish an unverified percentage claim.
  // Set this server-only flag after documenting the current SHEIN conditions.
  if (process.env.SHEIN_WELCOME_VERIFIED !== "true") return null;
  const { data, error } = await supabase.from("welcome_shein_offer")
    .select("*").eq("id", "homepage").eq("enabled", true).maybeSingle();
  if (error) {
    console.error("Welcome SHEIN settings unavailable:", error.message);
    return null;
  }
  return data ? mapWelcomeRow(data as Record<string, unknown>) : null;
}
