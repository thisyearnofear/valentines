import { supabase } from "@lub-u/utils/src/supabaseClient";

export async function fetchClicks() {
  // Example: assumes table click_counter with id=1
  const { data, error } = await supabase
    .from("click_counter")
    .select("count")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data.count as number;
}