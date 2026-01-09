// controllers/users.controller.js
const supabase = require('../config/supabase');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

class UserController {
  // User registration
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validation
      if (!email || !password) {
        return ApiResponse.validationError(res, {
          email: 'Email is required',
          password: 'Password is required'
        });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return ApiResponse.error(res, 'Email already registered', 400);
      }

      // Hash password
      const passwordHash = await AuthUtils.hashPassword(password);

      // Create user with UUID
      const userId = uuidv4();
      const userData = {
        id: userId,
        name: name || null,
        email,
        phone: phone || null,
        password_hash: passwordHash,
        role: 'user'
      };

      // Insert user into database
      const { data: user, error } = await supabase
        .from('users')
        .insert([userData])
        .select('id, email, name, role, created_at')
        .single();

      if (error) {
        throw error;
      }

      // Generate token
      const token = AuthUtils.generateToken(user);

      return ApiResponse.success(res, {
        user,
        token
      }, 'Registration successful', 201);
    } catch (error) {
      console.error('Registration error:', error);
      return ApiResponse.error(res, 'Registration failed');
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.validationError(res, {
          email: 'Email is required',
          password: 'Password is required'
        });
      }

      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await AuthUtils.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Generate token
      const token = AuthUtils.generateToken(user);

      // Set Supabase session for RLS
      await AuthUtils.setSupabaseSession(supabase, user.id);

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return ApiResponse.success(res, {
        user: userWithoutPassword,
        token
      }, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return ApiResponse.error(res, 'Login failed');
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, phone, avatar_url, role, created_at, updated_at')
        .eq('id', req.userId)
        .single();

      if (error || !user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      return ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return ApiResponse.error(res, 'Failed to get profile');
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { name, phone, avatar_url } = req.body;
      const updateData = { updated_at: new Date().toISOString() };

      // Only update fields that are provided
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.userId)
        .select('id, name, email, phone, avatar_url, role, created_at, updated_at')
        .single();

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return ApiResponse.error(res, 'Failed to update profile');
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ApiResponse.validationError(res, {
          currentPassword: 'Current password is required',
          newPassword: 'New password is required'
        });
      }

      // Get current user with password
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', req.userId)
        .single();

      if (error || !user) {
        return ApiResponse.unauthorized(res, 'User not found');
      }

      // Verify current password
      const isValid = await AuthUtils.verifyPassword(currentPassword, user.password_hash);
      if (!isValid) {
        return ApiResponse.unauthorized(res, 'Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await AuthUtils.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.userId);

      if (updateError) {
        throw updateError;
      }

      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return ApiResponse.error(res, 'Failed to change password');
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      await AuthUtils.clearSupabaseSession(supabase);
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return ApiResponse.error(res, 'Logout failed');
    }
  }
}

module.exports = UserController;