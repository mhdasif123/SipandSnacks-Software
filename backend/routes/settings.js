const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, description FROM app_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific setting
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query(
      'SELECT key, value, description FROM app_settings WHERE key = $1',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a setting (Admin only)
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    // Validate max_order_amount is a positive number
    if (key === 'max_order_amount') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return res.status(400).json({ error: 'Maximum order amount must be a positive number' });
      }
    }
    
    const result = await pool.query(
      'UPDATE app_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING key, value, description',
      [value, key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change admin password (Admin only)
router.put('/admin/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id; // From authenticateToken middleware
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    // Get admin user from database
    const adminResult = await pool.query(
      'SELECT id, password_hash FROM admin_users WHERE id = $1',
      [adminId]
    );
    
    if (adminResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    const admin = adminResult.rows[0];
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await pool.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, admin.id]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change admin username (Admin only)
router.put('/admin/username', authenticateToken, async (req, res) => {
  try {
    const { newUsername, password } = req.body;
    const adminId = req.user.id; // From authenticateToken middleware
    
    if (!newUsername || !password) {
      return res.status(400).json({ error: 'New username and password are required' });
    }
    
    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    // Get admin user from database
    const adminResult = await pool.query(
      'SELECT id, password_hash FROM admin_users WHERE id = $1',
      [adminId]
    );
    
    if (adminResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    const admin = adminResult.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }
    
    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM admin_users WHERE username = $1 AND id != $2',
      [newUsername, admin.id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Update username
    await pool.query(
      'UPDATE admin_users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username',
      [newUsername, admin.id]
    );
    
    res.json({ success: true, message: 'Username updated successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Error changing username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current admin info (Admin only)
router.get('/admin/info', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id; // From authenticateToken middleware
    
    const result = await pool.query(
      'SELECT id, username, created_at FROM admin_users WHERE id = $1',
      [adminId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

