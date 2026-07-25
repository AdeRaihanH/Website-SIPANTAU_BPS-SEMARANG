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
  return data;
}

/**
 * Log in a user
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      const profile = await getProfile(data.user.id);
      return {
        user: data.user,
        profile: profile || {
          id: data.user.id,
          role: "pemagang",
          full_name: data.user.email,
          email: data.user.email,
          status: "approved",
        },
      };
    }
  } catch (e) {
    console.warn("Supabase Auth signIn failed, checking local users fallback:", e.message);
  }

  // Fallback to local demo users list if Supabase Cloud Auth user is not registered yet
  if (typeof window !== "undefined") {
    const localUsersStr = localStorage.getItem("sipantau_users");
    if (localUsersStr) {
      try {
        const localUsers = JSON.parse(localUsersStr);
        const match = localUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (match) {
          return {
            user: { id: match.email, email: match.email },
            profile: {
              id: match.email,
              full_name: match.name || match.full_name || "Pengguna",
              email: match.email,
              role: match.role || "pemagang",
              status: match.status || "approved",
            },
          };
        }
      } catch (err) {
        console.error("Local user fallback parse error:", err);
      }
    }
  }

  throw new Error("Email atau password tidak valid.");
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
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch (e) {
    console.warn("getActiveUser error:", e.message);
    return null;
  }
}

/**
 * Get profile data for a specific user ID
 */
export async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (e) {
    console.warn("getProfile error:", e.message);
    return null;
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
  return data;
}
