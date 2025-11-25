const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Cleanup orders older than 6 months (Admin only)
router.post('/cleanup-orders', authenticateToken, async (req, res) => {
  try {
    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString().split('T')[0];

    // Delete orders older than 6 months
    const result = await pool.query(
      'DELETE FROM orders WHERE order_date < $1',
      [cutoffDate]
    );

    res.json({
      success: true,
      message: `Cleanup completed. Deleted ${result.rowCount} orders older than ${cutoffDate}`,
      deletedCount: result.rowCount,
      cutoffDate
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Internal server error during cleanup' });
  }
});

// Get cleanup statistics
router.get('/cleanup-stats', authenticateToken, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE order_date < $1',
      [cutoffDate]
    );

    res.json({
      ordersToDelete: parseInt(result.rows[0].count),
      cutoffDate,
      message: `${result.rows[0].count} orders will be deleted (older than 6 months)`
    });
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

