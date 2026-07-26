import { supabase } from "./client";

/**
 * Get all users for admin accounts table
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  // Filter out soft-deleted users
  return data.filter(u => !(u.status === 'rejected' && u.full_name === 'DELETED_USER'));
}

/**
 * Update a user's verification status
 * @param {string} adminId - The ID of the admin performing the action
 * @param {string} targetUserId - The ID of the user to update
 * @param {string} newStatus - "active" to approve, or "rejected" to reject
 * @param {string} notes - Optional notes for verification log
 */
export async function updateUserStatus(adminId, targetUserId, newStatus, notes = "") {
  // Update the user's status in profiles table
  const { data: updatedProfile, error: profileError } = await supabase
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", targetUserId)
    .select()
    .single();

  if (profileError) throw profileError;

  // Record activity in activity_logs
  try {
    const { logActivity } = await import('./dashboard.js');
    const statusText = newStatus === 'active' ? 'menyetujui' : 'menolak';
    const targetName = updatedProfile?.full_name || updatedProfile?.email || targetUserId;
    await logActivity(adminId, `telah ${statusText} pendaftaran akun ${targetName}`);
  } catch (logErr) {
    // Silently ignore activity logging errors so the primary status update always succeeds
  }

  // Send Email Notification
  if ((newStatus === 'active' || newStatus === 'rejected') && updatedProfile?.email) {
    // We do not await this so it doesn't block the UI
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: updatedProfile.email,
        type: newStatus === 'active' ? 'account_approved' : 'account_rejected',
        data: { name: updatedProfile.full_name || updatedProfile.name || 'Pendaftar' }
      })
    }).catch(err => console.error("Gagal mengirim notifikasi email:", err));
  }

  return updatedProfile;
}

/**
 * Update user's profile information
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete users by their IDs
 */
export async function deleteUsers(userIds) {
  // We use soft-delete by setting full_name to 'DELETED_USER' and status to 'rejected'
  // because the Supabase 'user_status' enum doesn't accept 'deleted'
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: 'DELETED_USER', status: 'rejected' })
    .in("id", userIds);

  if (error) throw error;
}
