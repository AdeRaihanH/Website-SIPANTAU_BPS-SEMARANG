import { supabase } from "./client";

/**
 * Get stats for admin dashboard
 */
export async function getAdminStats() {
  // Use RPC or separate queries depending on RLS and preference
  // For simplicity, we can fetch count using head requests
  
  const getCount = async (status) => {
    let query = supabase.from("profiles").select("*", { count: "exact", head: true });
    if (status) query = query.eq("status", status);
    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  };

  const [total, pending, approved, rejected] = await Promise.all([
    getCount(),
    getCount("pending"),
    getCount("approved"),
    getCount("rejected")
  ]);

  return { total, pending, approved, rejected };
}

/**
 * Get personal stats for intern/mentor dashboard
 */
export async function getPersonalStats(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("assigned_to", userId);

  if (error) throw error;

  let completed = 0;
  let scheduled = 0;
  let overdue = 0;
  let updated = 0;

  // Simple logic for demonstration based on fetched tasks
  data.forEach(t => {
    if (t.status === "Selesai" || t.status === "completed") completed++;
    else scheduled++;
  });

  return { completed, scheduled, updated, overdue };
}

/**
 * Get personal activity logs
 */
export async function getPersonalLogs(userId) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, task:tasks(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

/**
 * Log a new activity
 */
export async function logActivity(userId, description, taskId = null) {
  if (!userId) return;
  const { error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: userId,
      description,
      task_id: taskId
    });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}
