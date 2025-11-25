# 📝 How to Run Settings Migration SQL

If your database already exists, you need to add the settings table. Here are several ways to do it:

## 🎯 Method 1: Using PostgreSQL Command Line (psql) - Recommended

### Step 1: Open Terminal/Command Prompt

**Windows:**
```bash
# Open PowerShell or Command Prompt
```

**Mac/Linux:**
```bash
# Open Terminal
```

### Step 2: Connect to your database

```bash
psql -U postgres -d sipandsnacks
```

Or if your database is on a different host:
```bash
psql -h localhost -U postgres -d sipandsnacks
```

**Enter your PostgreSQL password when prompted.**

### Step 3: Copy and paste the SQL

Once connected, copy and paste this entire SQL:

```sql
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (key, value, description) 
VALUES ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
```

### Step 4: Press Enter

The SQL will execute. You should see:
```
CREATE TABLE
INSERT 0 1
CREATE INDEX
```

### Step 5: Exit psql

```bash
\q
```

---

## 🎯 Method 2: Using Supabase Dashboard (For Supabase Users)

### Step 1: Go to Supabase Dashboard
1. Visit [supabase.com](https://supabase.com)
2. Login to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Paste SQL
Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (key, value, description) 
VALUES ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
```

### Step 4: Run SQL
1. Click **Run** button (or press Ctrl+Enter)
2. You should see "Success. No rows returned"

---

## 🎯 Method 3: Using pgAdmin (GUI Tool)

### Step 1: Open pgAdmin
1. Launch pgAdmin
2. Connect to your PostgreSQL server

### Step 2: Navigate to Database
1. Expand **Servers** → Your Server → **Databases** → **sipandsnacks**
2. Right-click on **sipandsnacks** → **Query Tool**

### Step 3: Paste SQL
Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (key, value, description) 
VALUES ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
```

### Step 4: Execute
1. Click **Execute** button (or press F5)
2. Check the messages tab for success

---

## 🎯 Method 4: Using DBeaver or Other SQL Clients

### Step 1: Connect to Database
1. Open DBeaver (or your SQL client)
2. Connect to your PostgreSQL database

### Step 2: Open SQL Editor
1. Right-click on database → **SQL Editor** → **New SQL Script**

### Step 3: Paste and Run
1. Paste the SQL below
2. Click **Execute** or press Ctrl+Enter

```sql
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (key, value, description) 
VALUES ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
```

---

## 🎯 Method 5: Using Node.js Script (Automated)

Create a file `backend/scripts/addSettingsTable.js`:

```javascript
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const addSettingsTable = async () => {
  try {
    console.log('Adding settings table...');
    
    const settingsSQL = fs.readFileSync(
      path.join(__dirname, '../database/settings_migration.sql'), 
      'utf8'
    );
    
    const statements = settingsSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Settings table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating settings table:', error);
    process.exit(1);
  }
};

addSettingsTable();
```

Then run:
```bash
cd backend
node scripts/addSettingsTable.js
```

---

## 🎯 Method 6: Using Railway/Render Database (For Hosted Databases)

### If using Railway:
1. Go to Railway dashboard
2. Click on your database service
3. Click **Connect** → **PostgreSQL**
4. Use the connection details to connect via psql or pgAdmin
5. Run the SQL

### If using Render:
1. Go to Render dashboard
2. Click on your database
3. Click **Info** tab → Copy **Internal Database URL**
4. Connect using psql: `psql "your-connection-string"`
5. Run the SQL

---

## ✅ Verification

After running the SQL, verify it worked:

### Option 1: Check via SQL
```sql
SELECT * FROM app_settings;
```

You should see:
```
 id |        key         | value |                    description                    
----+--------------------+-------+---------------------------------------------------
  1 | max_order_amount   | 25    | Maximum amount allowed per order in ₹
```

### Option 2: Check via Backend
```bash
cd backend
node -e "const pool = require('./config/database'); pool.query('SELECT * FROM app_settings').then(r => { console.log(r.rows); process.exit(0); });"
```

---

## 🚨 Troubleshooting

### Error: "relation app_settings already exists"
**Solution**: The table already exists, you can ignore this error. The `IF NOT EXISTS` prevents errors.

### Error: "permission denied"
**Solution**: Make sure you're using a user with CREATE TABLE permissions (usually `postgres` user).

### Error: "connection refused"
**Solution**: 
- Check PostgreSQL is running
- Verify database name is correct
- Check connection credentials

---

## 📋 Complete SQL (Copy This)

```sql
-- Create settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default max order amount setting
INSERT INTO app_settings (key, value, description) 
VALUES ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
```

**Copy the SQL above and run it using any method above!**

---

## ✅ Quick Test After Migration

1. **Start your backend**: `cd backend && npm run dev`
2. **Test Settings API**: Visit `http://localhost:5000/api/settings`
3. **Should return**: `{"max_order_amount": {"value": "25", "description": "..."}}`
4. **Login to Admin Dashboard** → **Settings Tab**
5. **Should see**: Maximum Order Amount section with ₹25

---

**That's it! Your settings table is now ready! 🎉**

