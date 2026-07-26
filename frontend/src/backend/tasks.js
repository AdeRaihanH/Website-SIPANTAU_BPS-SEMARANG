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
  const isUUID = (str) => typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const cleanData = { ...taskData };
  if (cleanData.group_id && !isUUID(cleanData.group_id)) {
    delete cleanData.group_id;
  }
  if (cleanData.assigned_to && !isUUID(cleanData.assigned_to)) {
    delete cleanData.assigned_to;
  }

  // Try getting current active user to log activity
  const { getActiveUser, getProfile } = await import('./auth.js');
  const user = await getActiveUser().catch(() => null);
  let profile = null;
  if (user && user.id) {
    profile = await getProfile(user.id).catch(() => null);
  }

  const { data: insertedTask, error } = await supabase
    .from("tasks")
    .insert(cleanData)
    .select()
    .single();

  if (error) throw error;

  if (user && user.id) {
    const { logActivity } = await import('./dashboard.js');
    await logActivity(user.id, `telah menambahkan tugas baru`, insertedTask.id, insertedTask.group_id);
    
    // SIMULTANEOUSLY save to task_history so everyone in the team gets this in baseLogs!
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Anggota Tim";
    await supabase.from("task_history").insert({
      task_id: insertedTask.id,
      name: displayName,
      text: "telah menambahkan tugas baru",
      time: "baru saja"
    });
  }

  return insertedTask;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId, userId, groupId, taskTitle) {
  let finalUserId = userId;
  if (!finalUserId) {
    try {
      const { getActiveUser } = await import('./auth.js');
      const user = await getActiveUser();
      if (user) finalUserId = user.id;
    } catch (e) {}
  }

  // Rescue logs to prevent ON DELETE CASCADE from wiping them!
  try {
    // 1. Fetch existing activity logs for this task
    const { data: actLogs } = await supabase.from("activity_logs").select("*").eq("task_id", taskId);
    const existingDescs = new Set();
    
    if (actLogs && actLogs.length > 0) {
      for (const al of actLogs) {
        let desc = al.description || "";
        existingDescs.add(desc);
        if (taskTitle && !desc.includes(taskTitle)) desc = `${desc} ${taskTitle}`;
        existingDescs.add(desc);
        await supabase.from("activity_logs").update({ task_id: null, description: desc }).eq("id", al.id);
      }
    }

    // 2. Backup missing rich UI task_history into activity_logs
    const { data: histories } = await supabase.from("task_history").select("*").eq("task_id", taskId);
    if (histories && histories.length > 0 && finalUserId) {
      const savedLogs = [];
      for (const h of histories) {
        let desc = h.text;
        if (taskTitle && !desc.includes(taskTitle)) desc = `${desc} ${taskTitle}`;
        
        // Prevent duplicates
        if (!existingDescs.has(desc) && !existingDescs.has(h.text)) {
          savedLogs.push({
            user_id: finalUserId,
            description: desc,
            group_id: groupId,
            created_at: h.created_at
          });
        }
      }
      if (savedLogs.length > 0) {
        await supabase.from("activity_logs").insert(savedLogs);
      }
    }
  } catch (err) {
    console.warn("Failed to rescue task logs:", err);
  }

  // 3. Log active deletion
  if (finalUserId) {
    try {
      const { logActivity } = await import('./dashboard.js');
      await logActivity(finalUserId, `telah menghapus tugas ${taskTitle || ""}`.trim(), null, groupId);
    } catch (e) {
      console.warn("Failed to log activity for deletion", e);
    }
  }

  // 4. Truly delete the task
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;
}

/**
 * Add a history entry for a task (for frontend display in riwayat)
 */
export async function addHistory(taskId, { name, text, time }) {
  const { data, error } = await supabase
    .from("task_history")
    .insert({
      task_id: taskId,
      name,
      text,
      time: time || "baru saja"
    })
    .select()
    .single();

  if (error) throw error;
  return { id: data.id, name: data.name, text: data.text, time: data.time, created_at: data.created_at };
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
