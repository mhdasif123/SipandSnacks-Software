/**
 * Script to add settings table to existing database
 * Run: node scripts/addSettingsTable.js
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const addSettingsTable = async () => {
  let client;
  try {
    console.log('🔄 Connecting to database...');
    client = await pool.connect();
    
    console.log('📝 Reading settings migration SQL...');
    const settingsSQL = fs.readFileSync(
      path.join(__dirname, '../database/settings_migration.sql'), 
      'utf8'
    );
    
    console.log('🔨 Executing SQL statements...');
    const statements = settingsSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
      }
    }
    
    console.log('✅ Settings table created successfully!');
    
    // Verify it worked
    console.log('🔍 Verifying...');
    const result = await client.query('SELECT * FROM app_settings');
    console.log('📊 Current settings:');
    result.rows.forEach(row => {
      console.log(`   - ${row.key}: ${row.value} (${row.description})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating settings table:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table already exists. This is fine!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
};

addSettingsTable();

