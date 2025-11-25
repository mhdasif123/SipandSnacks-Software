const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all snack items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, price FROM snack_items ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching snack items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add snack item (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Snack item name is required' });
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const result = await pool.query(
      'INSERT INTO snack_items (name, price) VALUES ($1, $2) RETURNING id, name, price',
      [name.trim(), parseFloat(price)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Snack item already exists' });
    }
    console.error('Error adding snack item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update snack item (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Snack item name is required' });
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const result = await pool.query(
      'UPDATE snack_items SET name = $1, price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, price',
      [name.trim(), parseFloat(price), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snack item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Snack item name already exists' });
    }
    console.error('Error updating snack item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete snack item (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM snack_items WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snack item not found' });
    }

    res.json({ success: true, message: 'Snack item deleted successfully' });
  } catch (error) {
    console.error('Error deleting snack item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

