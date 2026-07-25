import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zjcnadjnqaqcmpviceva.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_SkabwKXuuhN1qtpmq3GdVQ_lcKN0XBF";

export const supabase = createClient(supabaseUrl, supabaseKey);

