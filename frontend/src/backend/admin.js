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
  return data.filter(u => u.full_name !== 'DELETED_USER');
}

/**
 * Update a user's verification status
 * @param {string} adminId - The ID of the admin performing the action
 * @param {string} targetUserId - The ID of the user to update
 * @param {string} newStatus - "approved" or "rejected"
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

  // Insert a record into verification_logs if table exists (optional based on ERD)
  // Assuming the table is verification_logs with fields: verified_user_id, verified_by, action, notes
  const { error: logError } = await supabase
    .from("verification_logs")
    .insert({
      verified_user_id: targetUserId,
      verified_by: adminId,
      action: newStatus,
      notes: notes
    });

  if (logError) {
    console.error("Failed to log verification action", logError);
    // Not throwing here so the status update still succeeds
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
  // We use soft-delete by setting full_name to 'DELETED_USER'
  // because hard deleting from auth.users requires admin privileges/service role key
  // and RLS might block DELETE on profiles.
  const { error } = await supabase
    .from("profiles")
    .update({ status: 'rejected', full_name: 'DELETED_USER' })
    .in("id", userIds);

  if (error) throw error;
}
