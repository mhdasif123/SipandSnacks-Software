const pool = require('../config/database');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('Database config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'sipandsnacks',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
    });

    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    console.log('Current time:', result.rows[0].now);

    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n✓ Existing tables:');
    if (tablesCheck.rows.length === 0) {
      console.log('  ⚠️  No tables found! You need to run: npm run init-db');
    } else {
      tablesCheck.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
    }

    // Check employees table specifically
    try {
      const employeesCheck = await pool.query('SELECT COUNT(*) FROM employees');
      console.log('\n✓ Employees table exists with', employeesCheck.rows[0].count, 'records');
    } catch (err) {
      console.log('\n❌ Employees table does NOT exist!');
      console.log('   Run: npm run init-db');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. PostgreSQL is not running');
    console.error('2. Database credentials in .env are incorrect');
    console.error('3. Database "sipandsnacks" does not exist');
    console.error('\nCheck your .env file and ensure:');
    console.error('- DB_PASSWORD is set correctly');
    console.error('- DB_NAME is "sipandsnacks"');
    console.error('- DB_USER is "postgres" (or your PostgreSQL username)');
    process.exit(1);
  }
};

testConnection();

