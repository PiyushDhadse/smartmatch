const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  // User registration
  static async register(req, res) {
    try {
      const { name, email, password, userType, agreeToTerms } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      if (!agreeToTerms) {
        return res.status(400).json({
          success: false,
          message: "You must agree to terms and conditions",
        });
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = userType === "serviceProvider" ? "provider" : "customer";

      // Prepare user data
      const userData = {
        name,
        email,
        password_hash: hashedPassword,
        role: role,
        agree_to_terms: agreeToTerms,
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert user
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert([userData])
        .select("id, name, email, role, created_at")
        .single();

      if (userError) {
        console.error("User creation error:", userError);
        return res.status(500).json({
          success: false,
          message: "Failed to create user account",
        });
      }

      // If provider, create provider profile
      // In register method, update the provider creation part:
      if (role === "provider") {
        const providerData = {
          user_id: user.id,
          business_name: `${name}'s Services`,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: providerError } = await supabase
          .from("service_providers")
          .insert([providerData]);

        if (providerError) {
          console.error("Provider creation error:", providerError);

          // Try without timestamps if that's the issue
          const simpleProviderData = {
            user_id: user.id,
            business_name: `${name}'s Services`,
            is_available: true,
          };

          await supabase.from("service_providers").insert([simpleProviderData]);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Success response
      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token: token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Find user
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token: token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const { data: user, error } = await supabase
        .from("users")
        .select(
          "id, name, email, phone, avatar_url, role, city, address, email_verified, is_active, created_at, updated_at",
        )
        .eq("id", req.userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get profile",
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const { name, phone, avatar_url, city, address } = req.body;
      const updateData = { updated_at: new Date().toISOString() };

      // Add fields if provided
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (city !== undefined) updateData.city = city;
      if (address !== undefined) updateData.address = address;

      const { data: user, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", req.userId)
        .select(
          "id, name, email, phone, avatar_url, role, city, address, email_verified, is_active, created_at, updated_at",
        )
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      // Get user with password
      const { data: user, error } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", req.userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from("users")
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.userId);

      if (updateError) {
        return res.status(400).json({
          success: false,
          message: updateError.message,
        });
      }

      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  }
}

module.exports = UserController;
