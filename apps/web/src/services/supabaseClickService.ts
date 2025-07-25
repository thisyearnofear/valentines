import { supabase } from "@lub-u/utils/src/supabaseClient";

export const incrementClicksSupabase = async (count: number) => {
  // assumes a table "click_counter" with columns id (pk=1) and count
  await supabase.rpc("increment_clicks", { amount: count });
};