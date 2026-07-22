import { supabase } from './client';

/**
 * Fetch activity logs for a specific team (group).
 * @param {string|number} groupId - The ID of the group/team.
 * @returns {Promise<Array>} - Array of activity log objects sorted by newest first.
 */
export async function getTeamActivityLogs(groupId) {
  // First get all task IDs for this group to find old logs that might be missing group_id
  const { data: groupTasks } = await supabase.from('tasks').select('id').eq('group_id', groupId);
  const taskIds = groupTasks ? groupTasks.map(t => t.id) : [];

  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id (full_name, avatar_url),
      tasks:task_id (title)
    `)
    .order('created_at', { ascending: false });

  if (taskIds.length > 0) {
    query = query.or(`group_id.eq.${groupId},task_id.in.(${taskIds.join(',')})`);
  } else {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch team activity logs:', error);
    return [];
  }
  return data || [];
}
