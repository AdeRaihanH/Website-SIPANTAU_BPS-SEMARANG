import { supabase } from "./supabase";

const monthNamesInIndonesian = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const shortMonthNamesInIndonesian = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

// Helper to convert YYYY-MM-DD string to "D Month YYYY"
export function dbDateToFrontend(dbDateStr) {
  if (!dbDateStr) return "";
  const parts = dbDateStr.split("-");
  if (parts.length !== 3) return dbDateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dbDateStr;
  return `${day} ${monthNamesInIndonesian[month]} ${year}`;
}

// Helper to convert "D Month YYYY" to YYYY-MM-DD
export function frontendDateToDb(feDateStr) {
  if (!feDateStr) return null;
  const parts = feDateStr.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const year = parseInt(parts[2]);
  const monthStr = parts[1].toLowerCase();
  
  let month = monthNamesInIndonesian.findIndex(m => monthStr.startsWith(m.toLowerCase().substring(0, 3)));
  if (month === -1) {
    month = shortMonthNamesInIndonesian.findIndex(m => monthStr.startsWith(m.toLowerCase().substring(0, 3)));
  }
  
  if (isNaN(day) || isNaN(year) || month === -1) return null;
  
  const pad = (num) => String(num).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function getTypeBadgeStyle(typeName, taskTypes = []) {
  const nameLower = (typeName || "").toLowerCase();
  
  const match = (taskTypes || []).find(t => {
    const parts = t.split(":");
    return parts[0].toLowerCase() === nameLower;
  });
  
  let color = "indigo";
  if (match && match.includes(":")) {
    color = match.split(":")[1];
  } else {
    if (nameLower === "design") color = "violet";
    else if (nameLower === "bug") color = "cyan";
    else if (nameLower === "aset") color = "amber";
    else if (nameLower === "fitur") color = "rose";
    else if (nameLower === "tugas") color = "indigo";
  }
  
  const norm = color.toLowerCase();
  switch (norm) {
    case "violet":
      return { badge: "bg-violet-100 text-violet-600 border-violet-200/40", dot: "bg-violet-500" };
    case "cyan":
      return { badge: "bg-cyan-100 text-cyan-600 border-cyan-200/40", dot: "bg-cyan-500" };
    case "amber":
      return { badge: "bg-amber-100 text-amber-600 border-amber-200/40", dot: "bg-amber-500" };
    case "rose":
      return { badge: "bg-rose-100 text-rose-600 border-rose-200/40", dot: "bg-rose-500" };
    case "indigo":
      return { badge: "bg-indigo-100 text-indigo-650 border-indigo-200/40", dot: "bg-indigo-500" };
    case "emerald":
      return { badge: "bg-emerald-100 text-emerald-600 border-emerald-200/40", dot: "bg-emerald-500" };
    case "slate":
      return { badge: "bg-slate-100 text-slate-600 border-slate-200/40", dot: "bg-slate-500" };
    default:
      return { badge: "bg-indigo-100 text-indigo-650 border-indigo-200/40", dot: "bg-indigo-500" };
  }
}

export function fePriorityToDb(prio) {
  const p = String(prio).toLowerCase();
  if (p === "terendah") return "low";
  if (p === "rendah") return "low";
  if (p === "sedang") return "medium";
  if (p === "tinggi") return "high";
  if (p === "tertinggi") return "urgent";
  return prio;
}

export function dbPriorityToFe(prio) {
  const p = String(prio).toLowerCase();
  if (p === "low") return "Rendah";
  if (p === "medium") return "Sedang";
  if (p === "high") return "Tinggi";
  if (p === "urgent" || p === "critical") return "Tertinggi";
  
  if (p === "terendah") return "Rendah";
  if (p === "rendah") return "Rendah";
  if (p === "sedang") return "Sedang";
  if (p === "tinggi") return "Tinggi";
  if (p === "tertinggi") return "Tertinggi";
  return prio || "Sedang";
}

export async function getTasksByTeam(teamId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:profiles!assigned_to(id, full_name, avatar_url),
      task_assignees(id, member_initial),
      subtasks(id, title, is_completed),
      task_comments(id, content, created_at, profiles!user_id(full_name, avatar_url)),
      task_history(id, name, text, time, created_at)
    `)
    .eq("group_id", teamId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get tasks error:", error);
    return [];
  }

  return data.map((task) => {
    // Fetch all assignee initials from task_assignees
    let orang = (task.task_assignees || []).map(a => a.member_initial);
    // Fallback to legacy assigned_to if task_assignees is empty
    if (orang.length === 0 && task.assigned_user) {
      const initial = task.assigned_user.full_name ? task.assigned_user.full_name.charAt(0).toUpperCase() : "";
      if (initial) orang = [initial];
    }

    const feSubtasks = (task.subtasks || []).map((s) => ({
      id: s.id,
      title: s.title,
      done: s.is_completed,
    }));

    const feComments = (task.task_comments || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((c) => ({
        id: c.id,
        name: c.profiles?.full_name || "User",
        text: c.content,
        created_at: c.created_at,
        avatar_url: c.profiles?.avatar_url || null,
      }));

    const feHistory = (task.task_history || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((h) => ({
        id: h.id,
        name: h.name,
        text: h.text,
        time: h.time,
        created_at: h.created_at,
      }));

    return {
      id: task.id,
      title: task.title,
      desc: task.description,
      date: dbDateToFrontend(task.due_date),
      type: task.type || "Tugas",
      priority: dbPriorityToFe(task.priority),
      status: task.status === "in_progress" ? "inprogress" : (task.status || "todo"),
      done: task.status === "done",
      orang,
      assigned_to: task.assigned_to,
      assigned_user: task.assigned_user,
      riwayat: feHistory,
      komentar: feComments,
      subtasks: feSubtasks,
    };
  });
}

export async function createTask({ teamId, title, desc, date, type, priority, status, done, orang }) {
  let assignedTo = null;
  if (orang && orang.length > 0) {
    const initial = orang[0];
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id, profiles(full_name)")
      .eq("group_id", teamId);

    if (members) {
      const match = members.find(m => m.profiles?.full_name?.charAt(0).toUpperCase() === initial);
      if (match) {
        assignedTo = match.user_id;
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id || null;
  const dbDate = frontendDateToDb(date);
  const dbPrio = fePriorityToDb(priority);

  const dbStatus = status === "inprogress" ? "in_progress" : (status || "todo");

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      group_id: teamId,
      title,
      description: desc || "Tidak ada deskripsi",
      due_date: dbDate,
      type,
      priority: dbPrio,
      status: dbStatus,
      created_by: createdBy,
      assigned_to: assignedTo,
    })
    .select(`
      *,
      assigned_user:profiles!assigned_to(id, full_name, avatar_url)
    `)
    .single();

  if (taskError) {
    return { data: null, error: taskError.message };
  }

  // Save multiple assignees to task_assignees table
  if (orang && orang.length > 0) {
    const rows = orang.map(initial => ({
      task_id: task.id,
      member_initial: initial
    }));
    const { error: assignError } = await supabase.from("task_assignees").insert(rows);
    if (assignError) {
      console.error("Failed to insert task assignees:", assignError);
    }
  }

  if (createdBy) {
    try {
      await logActivity({
        userId: createdBy,
        action: "Membuat Tugas",
        detail: `Membuat tugas "${title}"`,
        groupId: teamId,
        taskId: task.id
      });
    } catch (e) {
      console.error("Log activity failed:", e);
    }
  }

  return {
    data: {
      id: task.id,
      title: task.title,
      desc: task.description,
      date: dbDateToFrontend(task.due_date),
      type: task.type,
      priority: dbPriorityToFe(task.priority),
      status: task.status === "in_progress" ? "inprogress" : task.status,
      done: task.status === "done",
      orang: orang || [],
      assigned_to: task.assigned_to,
      assigned_user: task.assigned_user,
      riwayat: [],
      komentar: [],
      subtasks: [],
    },
    error: null,
  };
}

export async function updateTask(id, updates) {
  const dbUpdates = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.desc !== undefined) dbUpdates.description = updates.desc;
  if (updates.date !== undefined) dbUpdates.due_date = frontendDateToDb(updates.date);
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.priority !== undefined) dbUpdates.priority = fePriorityToDb(updates.priority);
  if (updates.status !== undefined) {
    dbUpdates.status = updates.status === "inprogress" ? "in_progress" : updates.status;
    // Note: no 'done' column in DB, status alone determines done state
  }
  if (updates.done !== undefined && updates.status === undefined) {
    // If only 'done' is passed (e.g. from checkbox toggle), derive status
    if (updates.done) {
      dbUpdates.status = "done";
    } else {
      const { data: currentTask } = await supabase.from("tasks").select("status").eq("id", id).single();
      if (currentTask && currentTask.status === "done") {
        dbUpdates.status = "todo";
      }
    }
  }

  if (updates.assigned_to !== undefined) dbUpdates.assigned_to = updates.assigned_to;

  if (updates.orang !== undefined) {
    // 1. Clear existing assignees in task_assignees table
    await supabase.from("task_assignees").delete().eq("task_id", id);

    // 2. Insert new assignees
    if (updates.orang.length > 0) {
      const rows = updates.orang.map(initial => ({
        task_id: id,
        member_initial: initial
      }));
      const { error: assignError } = await supabase.from("task_assignees").insert(rows);
      if (assignError) {
        console.error("Failed to insert new task assignees:", assignError);
      }
    }

    // 3. Set legacy assigned_to to the first person for backwards compatibility
    if (updates.orang.length === 0) {
      dbUpdates.assigned_to = null;
    } else {
      const initial = updates.orang[0];
      const { data: task } = await supabase.from("tasks").select("group_id").eq("id", id).single();
      if (task) {
        const { data: members } = await supabase
          .from("group_members")
          .select("user_id, profiles(full_name)")
          .eq("group_id", task.group_id);

        if (members) {
          const match = members.find(m => m.profiles?.full_name?.charAt(0).toUpperCase() === initial);
          if (match) {
            dbUpdates.assigned_to = match.user_id;
          }
        }
      }
    }
  }

  if (Object.keys(dbUpdates).length > 0) {
    const { data: oldTask } = await supabase.from("tasks").select("title, group_id").eq("id", id).single();
    const taskTitle = oldTask?.title || "Tugas";
    const teamId = oldTask?.group_id || null;

    const { error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .eq("id", id);

    if (error) return { error: error.message };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let action = "Mengubah Tugas";
        let detail = `Mengubah detail tugas "${taskTitle}"`;
        
        if (updates.done === true || updates.status === "done") {
          action = "Menyelesaikan Tugas";
          detail = `Menyelesaikan tugas "${taskTitle}"`;
        } else if (updates.status !== undefined) {
          action = "Mengubah Status";
          const feStatus = updates.status === "inprogress" ? "In Progress" : updates.status === "review" ? "In Review" : "To do";
          detail = `Mengubah status tugas "${taskTitle}" menjadi ${feStatus}`;
        }
        
        await logActivity({ userId: user.id, action, detail, groupId: teamId, taskId: id });
      }
    } catch (e) {
      console.error("Log activity failed:", e);
    }
  }

  return { error: null };
}

export async function deleteTask(id) {
  const { data: oldTask } = await supabase.from("tasks").select("title, group_id").eq("id", id).single();
  const taskTitle = oldTask?.title || "Tugas";
  const teamId = oldTask?.group_id || null;

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logActivity({
        userId: user.id,
        action: "Menghapus Tugas",
        detail: `Menghapus tugas "${taskTitle}"`,
        groupId: teamId,
        taskId: id
      });
    }
  } catch (e) {
    console.error("Log activity failed:", e);
  }
  return { error: null };
}

export async function addComment(taskId, { name, text }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: text,
    })
    .select(`
      *,
      profiles!user_id(full_name)
    `)
    .single();

  if (error) return { data: null, error: error.message };

  try {
    const { data: task } = await supabase.from("tasks").select("title, group_id").eq("id", taskId).single();
    const taskTitle = task?.title || "Tugas";
    const teamId = task?.group_id || null;
    await logActivity({
      userId: user.id,
      action: "Menambahkan Komentar",
      detail: `Mengomentari tugas "${taskTitle}"`,
      groupId: teamId,
      taskId: taskId
    });
  } catch (e) {
    console.error("Log activity failed:", e);
  }

  return {
    data: {
      id: data.id,
      name: data.profiles?.full_name || name,
      text: data.content,
      created_at: data.created_at,
    },
    error: null,
  };
}

export async function addHistory(taskId, { name, text, time }) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

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

  if (error) return { data: null, error: error.message };
  return { data: { id: data.id, name: data.name, text: data.text, time: data.time, created_at: data.created_at }, error: null };
}

export async function addSubtask(taskId, title) {
  const { data, error } = await supabase
    .from("subtasks")
    .insert({
      task_id: taskId,
      title,
      is_completed: false,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: task } = await supabase.from("tasks").select("title, group_id").eq("id", taskId).single();
      const taskTitle = task?.title || "Tugas";
      const teamId = task?.group_id || null;
      await logActivity({
        userId: user.id,
        action: "Menambahkan Subtugas",
        detail: `Menambahkan subtugas "${title}" pada tugas "${taskTitle}"`,
        groupId: teamId,
        taskId: taskId
      });
    }
  } catch (e) {
    console.error("Log activity failed:", e);
  }

  return {
    data: {
      id: data.id,
      title: data.title,
      done: data.is_completed,
    },
    error: null,
  };
}

export async function toggleSubtask(subtaskId, done) {
  let subtaskTitle = "Subtugas";
  let taskTitle = "Tugas";
  let teamId = null;
  let taskId = null;
  try {
    const { data: subtask } = await supabase.from("subtasks").select("title, task_id").eq("id", subtaskId).single();
    if (subtask) {
      subtaskTitle = subtask.title;
      taskId = subtask.task_id;
      const { data: task } = await supabase.from("tasks").select("title, group_id").eq("id", subtask.task_id).single();
      taskTitle = task?.title || "Tugas";
      teamId = task?.group_id || null;
    }
  } catch (e) {
    console.error("Failed to pre-fetch subtask details:", e);
  }

  const { error } = await supabase
    .from("subtasks")
    .update({ is_completed: done })
    .eq("id", subtaskId);

  if (error) return { error: error.message };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const action = done ? "Menyelesaikan Subtugas" : "Membatalkan Subtugas";
      const detail = done 
        ? `Menyelesaikan subtugas "${subtaskTitle}" pada tugas "${taskTitle}"` 
        : `Membatalkan penyelesaian subtugas "${subtaskTitle}" pada tugas "${taskTitle}"`;
      await logActivity({ userId: user.id, action, detail, groupId: teamId, taskId: taskId });
    }
  } catch (e) {
    console.error("Log activity failed:", e);
  }

  return { error: null };
}

export async function deleteSubtask(subtaskId) {
  const { error } = await supabase
    .from("subtasks")
    .delete()
    .eq("id", subtaskId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function getActivityLogs(userId, limit = 20) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get activity logs error:", error);
    return [];
  }
  return data;
}

export async function logActivity({ userId, action, detail, groupId = null, taskId = null }) {
  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    detail,
    group_id: groupId,
    task_id: taskId
  });
}