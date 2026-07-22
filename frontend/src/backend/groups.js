import { supabase } from "./client";

export async function getUserGroups(userId, role) {
  let query = supabase.from("groups").select(`
    *,
    group_members(user_id)
  `).eq("is_deleted", false);
  
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

export async function getGroupDetails(groupId) {
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members(
        profiles(id, full_name, avatar_url, role)
      ),
      tasks(*)
    `)
    .eq("id", groupId)
    .single();

  if (error) throw error;
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
    await logActivity(groupData.created_by, `telah membuat kelompok magang: ${newGroup.name}`);
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
