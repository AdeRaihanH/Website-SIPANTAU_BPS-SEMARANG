import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://txcpkpzrtvggmurlygwv.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_dijFvEaOMASCpWXwvuDj2w_9cKfizM2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
