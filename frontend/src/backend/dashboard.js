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
    .select("status, due_date")
    .eq("assigned_to", userId);

  if (error) throw error;

  let completed = 0;
  let scheduled = 0;
  let overdue = 0;
  let updated = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  data.forEach(t => {
    const isDone = t.status === "done" || t.status === "completed" || t.status === "Selesai";
    
    if (isDone) {
      completed++;
    } else {
      if (t.status === "todo") scheduled++;
      else if (t.status === "inprogress" || t.status === "review" || t.status === "in_progress") updated++;
      else scheduled++; // fallback

      if (t.due_date) {
        const [year, month, day] = t.due_date.split('-');
        const taskDate = new Date(year, month - 1, day);
        if (taskDate < today) {
          overdue++;
        }
      }
    }
  });

  return { completed, scheduled, updated, overdue };
}

/**
 * Get personal activity logs
 */
export async function getPersonalLogs(userId, role) {
  let query = supabase
    .from("activity_logs")
    .select("*, task:tasks(title), profiles:user_id(full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (role !== "admin") {
    if (role === "mentor") {
      query = query.eq("user_id", userId);
    } else {
      // Get user's groups
      const { data: groups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
        
      const groupIds = groups ? groups.map(g => g.group_id) : [];
      
      if (groupIds.length > 0) {
        query = query.in("group_id", groupIds);
      } else {
        // Fallback: only their own logs if no groups
        query = query.eq("user_id", userId);
      }
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Log a new activity
 */
export async function logActivity(userId, description, taskId = null, explicitGroupId = null) {
  if (!userId) return;
  
  let group_id = explicitGroupId;
  if (!group_id && taskId) {
    const { data: task } = await supabase.from("tasks").select("group_id").eq("id", taskId).single();
    if (task && task.group_id) {
      group_id = task.group_id;
    }
  }

  const { error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: userId,
      description,
      task_id: taskId,
      group_id: group_id
    });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}
