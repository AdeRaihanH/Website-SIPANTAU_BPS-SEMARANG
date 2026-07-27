import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
);
async function test() {
  const { error } = await supabase.from("group_members").select("id, group_id, user_id").limit(1);
  console.log(error);
}
test();
