import { supabase } from "./client";

/**
 * Get stats for admin dashboard
 */
export async function getAdminStats() {
  // Use RPC or separate queries depending on RLS and preference
  // For simplicity, we can fetch count using head requests
  
  const getCount = async (status = null, excludeDeleted = false) => {
    let query = supabase.from("profiles").select("*", { count: "exact", head: true });
    if (status) query = query.eq("status", status);
    if (excludeDeleted) query = query.neq("full_name", "DELETED_USER").neq("status", "deleted");
    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  };

  const [total, pending, activeCount, rejected] = await Promise.all([
    getCount(null, true),
    getCount("pending", true),
    getCount("active"),
    getCount("rejected", true)
  ]);

  return { total, pending, approved: activeCount, rejected };
}

/**
 * Get personal stats for intern/mentor dashboard
 */
export async function getPersonalStats(userId, role = "pemagang") {
  let taskQuery = supabase.from("tasks").select("status, due_date, group_id");

  if (role === "mentor") {
    // Mentor: get all tasks from groups they mentor
    const { data: mentorGroups } = await supabase
      .from("groups")
      .select("id")
      .eq("mentor_id", userId);

    const groupIds = mentorGroups ? mentorGroups.map(g => g.id) : [];
    if (groupIds.length === 0) {
      return { completed: 0, scheduled: 0, updated: 0, overdue: 0 };
    }
    taskQuery = taskQuery.in("group_id", groupIds);
  } else {
    // Intern: only tasks assigned to them
    taskQuery = taskQuery.eq("assigned_to", userId);
  }

  const { data, error } = await taskQuery;
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
