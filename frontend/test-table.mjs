import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://zjcnadjnqaqcmpviceva.supabase.co", "sb_publishable_SkabwKXuuhN1qtpmq3GdVQ_lcKN0XBF");
async function test() {
  const { error } = await supabase.from("group_members").select("id, group_id, user_id").limit(1);
  console.log(error);
}
test();
