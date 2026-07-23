import { supabase } from "./client";

/**
 * Get all tasks for a specific group
 */
export async function getGroupTasks(groupId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, subtasks(*), task_comments(*)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Parse metadata from description
  if (data) {
    data.forEach(task => {
      let match;
      while ((match = task.description?.match(/<!-- SIPANTAU_META:(.*?) -->/))) {
        try {
          const meta = JSON.parse(match[1]);
          if (meta.priority) task.priority = meta.priority;
          if (meta.assignees) task.assignees = meta.assignees;
        } catch(e) {}
        task.description = task.description.replace(match[0], '').trim();
      }
    });
  }
  
  return data;
}

/**
 * Get all tasks assigned to a specific user
 */
export async function getUserTasks(userId, role = "pemagang") {
  if (role === "mentor") {
    // get groups they mentor
    const { data: groups } = await supabase.from("groups").select("id").eq("mentor_id", userId);
    const groupIds = groups ? groups.map(g => g.id) : [];
    if (groupIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from("tasks")
      .select("*, group:groups(name)")
      .in("group_id", groupIds)
      .order("due_date", { ascending: true });
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, group:groups(name)")
      .eq("assigned_to", userId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data;
  }
}

/**
 * Update a task's status
 */
export async function updateTaskStatus(taskId, newStatus, userId) {
  const { data: oldTask, error: fetchError } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .single();

  if (fetchError) throw fetchError;

  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date() })
    .eq("id", taskId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log to task_history
  await supabase.from("task_history").insert({
    task_id: taskId,
    changed_by: userId,
    action: "status_change",
    old_status: oldTask.status,
    new_status: newStatus
  });

  // Log activity
  if (userId) {
    const { logActivity } = await import('./dashboard.js');
    await logActivity(userId, `telah mengubah status tugas menjadi ${newStatus}`, taskId, updatedTask.group_id);
  }

  return updatedTask;
}

/**
 * Create a new task comment
 */
export async function createTaskComment(taskId, userId, content) {
  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: taskId,
      user_id: userId,
      content
    })
    .select("*, user:profiles(full_name, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new subtask
 */
export async function createSubtask(taskId, title) {
  const { data, error } = await supabase
    .from("subtasks")
    .insert({
      task_id: taskId,
      title,
      is_completed: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update subtask completion status
 */
export async function updateSubtaskStatus(subtaskId, isCompleted) {
  const { data, error } = await supabase
    .from("subtasks")
    .update({ is_completed: isCompleted })
    .eq("id", subtaskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  // Try getting current active user to log activity
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskData)
    .select()
    .single();

  if (error) throw error;

  // Log activity if user is authenticated
  if (user && user.id) {
    const { logActivity } = await import('./dashboard.js');
    await logActivity(user.id, `telah membuat penugasan baru`, data.id, taskData.group_id || data.group_id);
  }

  return data;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;
}

/**
 * Update a task
 */
export async function updateTask(taskId, taskData) {
  const { data, error } = await supabase
    .from("tasks")
    .update(taskData)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id) {
    const { logActivity } = await import('./dashboard.js');
    await logActivity(user.id, `telah memperbarui tugas`, taskId, data.group_id);
  }

  return data;
}
