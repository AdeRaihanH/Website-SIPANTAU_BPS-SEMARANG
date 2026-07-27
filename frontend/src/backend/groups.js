import { supabase } from "./client";

/** In-memory cache for getGroupDetails */
const groupCache = new Map();
let groupCachePromise = null;

/**
 * Clear the group details cache
 */
export function clearGroupCache(groupId) {
  if (groupId) {
    groupCache.delete(groupId);
  } else {
    groupCache.clear();
  }
}

export async function getUserGroups(userId, role) {
  let query = supabase.from("groups").select(`
    *,
    group_members(
      user_id,
      profiles(id, full_name, avatar_url)
    ),
    tasks(id, status)
  `).order("created_at", { ascending: false });
  
  if (role === "mentor") {
    query = query.eq("mentor_id", userId);
  }

  const { data: groupsData, error } = await query;
  if (error) throw error;

  // Filter groups where the user is a member if they are a 'pemagang'
  if (role === "pemagang") {
    return groupsData.filter(group => 
      group.group_members.some(member => member.user_id === userId)
    );
  }

  return groupsData;
}

const GROUP_COLUMNS = "id, name, description, mentor_id, created_by, is_deleted, created_at";
const TASK_COLUMNS = "id, title, description, due_date, type, priority, status, assigned_to, group_id, created_at, updated_at";
const SUBTASK_COLUMNS = "id, title, is_completed, task_id";
const COMMENT_COLUMNS = "id, content, created_at, user_id, task_id";
const HISTORY_COLUMNS = "id, name, text, time, created_at, task_id";
const PROFILE_COLUMNS = "id, full_name, avatar_url, role";

/**
 * Get detailed group info with tasks, members and related data
 */
export async function getGroupDetails(groupId, { forceRefresh = false } = {}) {
  // Return cached data immediately
  if (!forceRefresh && groupCache.has(groupId)) {
    return groupCache.get(groupId);
  }

  const { data, error } = await supabase
    .from("groups")
    .select(`
      ${GROUP_COLUMNS},
      group_members(
        profiles(${PROFILE_COLUMNS})
      ),
      tasks(
        ${TASK_COLUMNS},
        subtasks(${SUBTASK_COLUMNS}),
        task_comments(${COMMENT_COLUMNS}, user:profiles(${PROFILE_COLUMNS})),
        task_history(${HISTORY_COLUMNS})
      )
    `)
    .eq("id", groupId)
    .single();

  if (error) throw error;

  if (data && data.tasks) {
    data.tasks.forEach(task => {
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

  // Cache the result
  groupCache.set(groupId, data);

  return data;
}

export async function createGroup(groupData, members) {
  const { data: newGroup, error } = await supabase
    .from("groups")
    .insert([groupData])
    .select()
    .single();

  if (error) throw error;

  if (members && members.length > 0) {
    const memberInserts = members.map(userId => ({
      group_id: newGroup.id,
      user_id: userId
    }));
    const { error: membersError } = await supabase
      .from("group_members")
      .insert(memberInserts);
    if (membersError) throw membersError;
  }

  // Log activity
  if (groupData.created_by) {
    const { logActivity } = await import('./dashboard.js');
    await logActivity(groupData.created_by, `telah membuat kelompok magang: ${newGroup.name}`, null, newGroup.id);
  }

  return newGroup;
}

export async function updateGroup(groupId, updates) {
  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGroup(groupId, hardDelete = false) {
  if (hardDelete) {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("groups").update({ is_deleted: true }).eq("id", groupId);
    if (error) throw error;
  }
}

// Add a member to a group
export async function addGroupMember(groupId, userId) {
  const { data, error } = await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: userId }]);
  if (error) throw error;
  return data;
}

// Remove a member from a group
export async function removeGroupMember(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}
