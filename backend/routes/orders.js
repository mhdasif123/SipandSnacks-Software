const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all orders (with optional date filtering)
router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params = [];

    if (fromDate && toDate) {
      query = 'SELECT * FROM orders WHERE order_date BETWEEN $1 AND $2 ORDER BY created_at DESC';
      params = [fromDate, toDate];
    } else if (fromDate) {
      query = 'SELECT * FROM orders WHERE order_date >= $1 ORDER BY created_at DESC';
      params = [fromDate];
    } else if (toDate) {
      query = 'SELECT * FROM orders WHERE order_date <= $1 ORDER BY created_at DESC';
      params = [toDate];
    }

    const result = await pool.query(query, params);
    
    // Convert database results to match frontend format
    const orders = result.rows.map(row => ({
      id: row.id.toString(),
      employeeName: row.employee_name,
      tea: row.tea,
      snack: row.snack,
      amount: parseFloat(row.amount),
      orderDate: typeof row.order_date === 'string' ? row.order_date : (row.order_date.toISOString ? row.order_date.toISOString().split('T')[0] : String(row.order_date)),
      orderTime: row.order_time
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's orders
router.get('/today', async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format (UTC to avoid timezone issues)
    // Use DATE type casting to ensure proper comparison
    
    // First check what CURRENT_DATE returns in PostgreSQL
    const currentDateCheck = await pool.query('SELECT CURRENT_DATE as today');
    const pgToday = currentDateCheck.rows[0].today;
    const nodeToday = new Date().toISOString().split('T')[0];
    
    console.log(`[GET /orders/today] PostgreSQL CURRENT_DATE: ${pgToday}, Node.js today: ${nodeToday}`);
    
    // Use CURRENT_DATE from PostgreSQL to ensure we're using the same timezone as the database
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE order_date::date = CURRENT_DATE 
       ORDER BY created_at DESC`
    );

    console.log(`[GET /orders/today] Found ${result.rows.length} orders for today`);
    
    // Log all order dates for debugging
    if (result.rows.length > 0) {
      console.log(`[GET /orders/today] Sample order dates:`, result.rows.map(row => ({
        id: row.id,
        order_date: row.order_date,
        order_date_type: typeof row.order_date,
        employee: row.employee_name
      })));
    }
    
    // Also check if there are any orders with today's date that might not have matched
    const allTodayOrders = await pool.query(
      `SELECT id, order_date, employee_name 
       FROM orders 
       WHERE order_date::text = $1::text 
       ORDER BY created_at DESC`,
      [pgToday]
    );
    
    if (allTodayOrders.rows.length !== result.rows.length) {
      console.log(`[GET /orders/today] WARNING: Found ${allTodayOrders.rows.length} orders with date ${pgToday} but only ${result.rows.length} matched CURRENT_DATE`);
      console.log(`[GET /orders/today] All orders with date ${pgToday}:`, allTodayOrders.rows.map(row => ({
        id: row.id,
        order_date: row.order_date,
        employee: row.employee_name
      })));
    }

    const orders = result.rows.map(row => ({
      id: row.id.toString(),
      employeeName: row.employee_name,
      tea: row.tea,
      snack: row.snack,
      amount: parseFloat(row.amount),
      orderDate: typeof row.order_date === 'string' ? row.order_date : (row.order_date.toISOString ? row.order_date.toISOString().split('T')[0] : String(row.order_date)),
      orderTime: row.order_time
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { employeeName, tea, snack, amount, orderDate, orderTime } = req.body;

    // Validation
    if (!employeeName || !tea || !snack || !amount || !orderDate || !orderTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get max order amount from settings
    let maxOrderAmount = 25; // Default
    try {
      const settingsResult = await pool.query(
        'SELECT value FROM app_settings WHERE key = $1',
        ['max_order_amount']
      );
      if (settingsResult.rows.length > 0) {
        maxOrderAmount = parseFloat(settingsResult.rows[0].value) || 25;
      }
    } catch (error) {
      console.warn('Could not fetch max order amount from settings, using default:', error);
    }

    // Validate amount doesn't exceed maximum
    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount) || orderAmount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }
    
    if (orderAmount > maxOrderAmount) {
      return res.status(400).json({ 
        error: `Order amount cannot exceed ₹${maxOrderAmount}. Maximum allowed: ₹${maxOrderAmount}` 
      });
    }

    // Ensure date is in YYYY-MM-DD format (ISO format)
    // Handle both DD/MM/YYYY and YYYY-MM-DD formats
    let normalizedDate = orderDate;
    if (orderDate.includes('/')) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = orderDate.split('/');
      if (parts.length === 3) {
        normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];

    // Check if employee already ordered today
    const existingOrder = await pool.query(
      'SELECT id FROM orders WHERE employee_name = $1 AND order_date = $2',
      [employeeName, today]
    );

    if (existingOrder.rows.length > 0) {
      return res.status(409).json({ 
        error: 'You have already placed an order today. Only one order per person per day is allowed.' 
      });
    }

    // Insert order (use normalized date)
    const result = await pool.query(
      `INSERT INTO orders (employee_name, tea, snack, amount, order_date, order_time) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, employee_name, tea, snack, amount, order_date, order_time`,
      [employeeName, tea, snack, parseFloat(amount), normalizedDate, orderTime]
    );

    const order = result.rows[0];
    res.status(201).json({
      id: order.id.toString(),
      employeeName: order.employee_name,
      tea: order.tea,
      snack: order.snack,
      amount: parseFloat(order.amount),
      orderDate: typeof order.order_date === 'string' ? order.order_date : (order.order_date.toISOString ? order.order_date.toISOString().split('T')[0] : String(order.order_date)),
      orderTime: order.order_time
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, tea, snack, amount, orderDate, orderTime } = req.body;

    // Validation
    if (!employeeName || !tea || !snack || !amount || !orderDate || !orderTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if order exists
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure date is in YYYY-MM-DD format (ISO format)
    let normalizedDate = orderDate;
    if (orderDate.includes('/')) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = orderDate.split('/');
      if (parts.length === 3) {
        normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    console.log(`[PUT /orders/${id}] Updating order with date: ${normalizedDate}, time: ${orderTime}`);

    // Update order
    const result = await pool.query(
      `UPDATE orders 
       SET employee_name = $1, tea = $2, snack = $3, amount = $4, order_date = $5, order_time = $6
       WHERE id = $7
       RETURNING id, employee_name, tea, snack, amount, order_date, order_time`,
      [employeeName, tea, snack, parseFloat(amount), normalizedDate, orderTime, id]
    );

    const order = result.rows[0];
    const returnedDate = typeof order.order_date === 'string' 
      ? order.order_date 
      : (order.order_date.toISOString ? order.order_date.toISOString().split('T')[0] : String(order.order_date));
    
    console.log(`[PUT /orders/${id}] Order updated successfully`);
    console.log(`[PUT /orders/${id}] Returned order_date: ${returnedDate} (original: ${order.order_date}, type: ${typeof order.order_date})`);
    
    res.json({
      id: order.id.toString(),
      employeeName: order.employee_name,
      tea: order.tea,
      snack: order.snack,
      amount: parseFloat(order.amount),
      orderDate: returnedDate,
      orderTime: order.order_time
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete order
    await pool.query(
      'DELETE FROM orders WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

