import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  const tables = ["profiles", "groups", "tasks", "task_comments", "task_history"];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    console.log(`Table: ${table}`);
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log(data.length > 0 ? Object.keys(data[0]) : "Empty table");
    }
  }
}
checkSchema();
