// utils/supabaseAuth.js
const { supabase, supabaseAuth } = require("../config/supabase");
class SupabaseAuth {
  // Sign up user with Supabase Auth
  static async signUp(email, password, userData) {
    try {
      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            agree_to_terms: userData.agreeToTerms,
          },
        },
      });

      if (error) throw error;

      // Create user profile in your custom users table
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          name: userData.name,
          email: data.user.email,
          role: userData.role,
          agree_to_terms: userData.agreeToTerms,
          email_verified: data.user.email_confirmed_at ? true : false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Optional: Delete the auth user if profile creation fails
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error("Supabase signup error:", error);
      return { success: false, error: error.message };
    }
  }

  // Sign in user
  static async signIn(email, password) {
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Supabase signin error:", error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  static async signOut(accessToken) {
    try {
      const { error } = await supabaseAuth.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Supabase signout error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user session
  static async getUserSession(accessToken) {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAuth.auth.getUser(accessToken);

      if (error) throw error;

      if (user) {
        // Get additional user data from your custom table
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileError && userProfile) {
          return {
            success: true,
            user: {
              ...user,
              profile: userProfile,
            },
          };
        }
      }

      return { success: false, error: "User not found" };
    } catch (error) {
      console.error("Get user session error:", error);
      return { success: false, error: error.message };
    }
  }

  // Verify access token
  static async verifyAccessToken(accessToken) {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAuth.auth.getUser(accessToken);

      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Refresh session
  static async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabaseAuth.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user metadata
  static async updateUserMetadata(userId, metadata) {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Update metadata error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SupabaseAuth;
