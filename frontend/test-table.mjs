import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://supabase-project-redacted.supabase.co", "sb_publishable_REDACTED_KEY");
async function test() {
  const { error } = await supabase.from("group_members").select("id, group_id, user_id").limit(1);
  console.log(error);
}
test();
