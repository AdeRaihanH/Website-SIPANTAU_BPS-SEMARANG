import { supabase } from "./client";

/**
 * Sign up a new user
 */
export async function signUpUser({ email, password, name, phone, address, institution, major, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
        address,
        institution,
        major,
        role,
      },
    },
  });

  if (error) throw error;
  
  if (data?.user) {
    // Update profiles table with extra fields not handled by trigger
    await supabase.from("profiles").update({
      phone,
      address,
      institution,
      major,
      role
    }).eq("id", data.user.id);

    const { logActivity } = await import('./dashboard.js');
    await logActivity(data.user.id, `telah mendaftar akun baru sebagai ${role}`);
  }
  
  return data;
}

/**
 * Log in a user
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Fetch profile to verify status
  const profile = await getProfile(data.user.id);
  
  return { user: data.user, profile };
}

/**
 * Log out the current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the currently logged in user's session
 */
export async function getActiveUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Get profile data for a specific user ID
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
