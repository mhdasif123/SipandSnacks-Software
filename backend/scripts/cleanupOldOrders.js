const pool = require('../config/database');
require('dotenv').config();

const cleanupOldOrders = async () => {
  try {
    console.log('Starting cleanup of orders older than 6 months...');

    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Delete orders older than 6 months
    const result = await pool.query(
      'DELETE FROM orders WHERE order_date < $1',
      [cutoffDate]
    );

    console.log(`✓ Cleanup completed! Deleted ${result.rowCount} orders older than ${cutoffDate}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupOldOrders();

