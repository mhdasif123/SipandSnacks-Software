const pool = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✓ Database schema created successfully');

    // Create settings table and insert default settings
    const settingsSQL = fs.readFileSync(path.join(__dirname, '../database/settings_migration.sql'), 'utf8');
    const settingsStatements = settingsSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of settingsStatements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✓ Settings table created and default settings inserted');

    // Insert default admin user
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const adminCheck = await pool.query('SELECT id FROM admin_users WHERE username = $1', [adminUsername]);
    
    if (adminCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
        [adminUsername, passwordHash]
      );
      console.log(`✓ Default admin user created (username: ${adminUsername})`);
    } else {
      console.log(`✓ Admin user already exists (username: ${adminUsername})`);
    }

    // Insert default employees
    const defaultEmployees = [
      'John Doe',
      'Jane Smith',
      'Mike Johnson',
      'Sarah Wilson',
      'David Brown'
    ];

    for (const name of defaultEmployees) {
      const check = await pool.query('SELECT id FROM employees WHERE name = $1', [name]);
      if (check.rows.length === 0) {
        await pool.query('INSERT INTO employees (name) VALUES ($1)', [name]);
      }
    }
    console.log('✓ Default employees inserted');

    // Insert default tea items
    const defaultTeaItems = [
      { name: 'Tea', price: 5 },
      { name: 'Coffee', price: 8 },
      { name: 'Black Coffee', price: 8 },
      { name: 'Green Tea', price: 6 },
      { name: 'Masala Chai', price: 7 }
    ];

    for (const item of defaultTeaItems) {
      const check = await pool.query('SELECT id FROM tea_items WHERE name = $1', [item.name]);
      if (check.rows.length === 0) {
        await pool.query('INSERT INTO tea_items (name, price) VALUES ($1, $2)', [item.name, item.price]);
      }
    }
    console.log('✓ Default tea items inserted');

    // Insert default snack items
    const defaultSnackItems = [
      { name: 'Samosa', price: 10 },
      { name: 'Kayibhaji', price: 12 },
      { name: 'Mullak Bhaji', price: 15 },
      { name: 'Egg Bhaji', price: 18 },
      { name: 'Sugiyan', price: 8 },
      { name: 'Vada', price: 6 },
      { name: 'Pakora', price: 10 }
    ];

    for (const item of defaultSnackItems) {
      const check = await pool.query('SELECT id FROM snack_items WHERE name = $1', [item.name]);
      if (check.rows.length === 0) {
        await pool.query('INSERT INTO snack_items (name, price) VALUES ($1, $2)', [item.name, item.price]);
      }
    }
    console.log('✓ Default snack items inserted');

    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();

