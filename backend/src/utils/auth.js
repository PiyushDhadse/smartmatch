// utils/auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthUtils {
  // Hash password
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Generate random token for password reset
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Set user session in Supabase
  static async setSupabaseSession(supabase, userId) {
    try {
      await supabase.rpc('set_current_user_id', { user_id: userId });
      return true;
    } catch (error) {
      console.error('Error setting Supabase session:', error);
      return false;
    }
  }

  // Clear user session in Supabase
  static async clearSupabaseSession(supabase) {
    try {
      // Reset the session setting
      await supabase.rpc('set_current_user_id', { user_id: null });
      return true;
    } catch (error) {
      console.error('Error clearing Supabase session:', error);
      return false;
    }
  }
}

module.exports = AuthUtils;