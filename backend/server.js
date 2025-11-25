const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/tea-items', require('./routes/teaItems'));
app.use('/api/snack-items', require('./routes/snackItems'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for undefined routes (must be after all routes)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;

// Auto-cleanup function for orders older than 6 months
const autoCleanupOldOrders = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString().split('T')[0];

    const result = await pool.query(
      'DELETE FROM orders WHERE order_date < $1',
      [cutoffDate]
    );

    if (result.rowCount > 0) {
      console.log(`🧹 Auto-cleanup: Deleted ${result.rowCount} orders older than ${cutoffDate}`);
    }
  } catch (error) {
    console.error('Error during auto-cleanup:', error);
  }
};

// Run cleanup on server start and then daily at 2 AM
autoCleanupOldOrders();
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Run cleanup daily at 2:00 AM
  if (hours === 2 && minutes === 0) {
    autoCleanupOldOrders();
  }
}, 60000); // Check every minute

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧹 Auto-cleanup: Orders older than 6 months will be deleted daily at 2:00 AM`);
});

