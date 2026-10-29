import { supabase } from "@/lib/supabase";
import { mapWelcomeRow, type WelcomeSheinSettings } from "@/lib/welcome-shein-settings";

/** Fail closed: a disabled or unavailable offer must not be shown to visitors. */
export async function getPublicWelcomeSheinOffer(): Promise<WelcomeSheinSettings | null> {
  const { data, error } = await supabase.from("welcome_shein_offer")
    .select("*").eq("id", "homepage").eq("enabled", true).maybeSingle();
  if (error) {
    console.error("Welcome SHEIN settings unavailable:", error.message);
    return null;
  }
  return data ? mapWelcomeRow(data as Record<string, unknown>) : null;
}
