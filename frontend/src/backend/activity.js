import { supabase } from './client';

/**
 * Fetch activity logs for a specific team (group).
 * @param {string|number} groupId - The ID of the group/team.
 * @returns {Promise<Array>} - Array of activity log objects sorted by newest first.
 */
export async function getTeamActivityLogs(groupId) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch team activity logs:', error);
    return [];
  }
  return data || [];
}
