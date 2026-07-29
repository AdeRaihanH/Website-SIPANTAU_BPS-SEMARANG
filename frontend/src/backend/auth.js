import { createClient } from "@supabase/supabase-js";
import { supabase } from "./client";

/**
 * Sign up a new user
 */
export async function signUpUser({ email, password, name, phone, address, institution, major, role }) {
  // Use isolated client with persistSession: false to preserve active admin session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const tempClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await tempClient.auth.signUp({
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
    // Update profiles table with extra fields
    await supabase.from("profiles").update({
      full_name: name,
      status: "pending",
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
  profileCache.clear(); // Clear cache on logout to prevent stale data
}

/**
 * Get the currently logged in user's session
 */
export async function getActiveUser() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) return data.session.user;
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;
  return userData.user;
}

// Module-level profile cache (avoids duplicate getProfile calls between layout and pages)
const profileCache = new Map();

/**
 * Get profile data for a specific user ID
 */
export async function getProfile(userId) {
  // Return cached profile if available (during SPA navigation)
  const cached = profileCache.get(userId);
  if (cached) return cached;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  profileCache.set(userId, data);
  return data;
}

/**
 * Clear profile cache (called when profile is updated)
 */
export function clearProfileCache(userId) {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
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
  // Update cache with fresh data
  profileCache.set(userId, data);
  return data;
}
