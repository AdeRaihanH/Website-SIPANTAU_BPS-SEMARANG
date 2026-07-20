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
  return data;
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
  // Since they are in profiles table, and auth.users is managed by Supabase Auth,
  // we typically delete from profiles, or we'd need admin API to delete from auth.
  // For now, we delete from profiles. Wait, Supabase requires calling admin API for auth.users.
  // We'll soft-delete them or just delete from profiles for now.
  const { error } = await supabase
    .from("profiles")
    .delete()
    .in("id", userIds);

  if (error) throw error;
}
