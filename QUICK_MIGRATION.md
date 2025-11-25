# ⚡ Quick Migration Guide - Add Settings Table

## 🎯 Easiest Method: Run Node.js Script (Recommended)

### Step 1: Open Terminal/PowerShell in your project folder

### Step 2: Run the script

**Windows (PowerShell):**
```powershell
cd backend
node scripts/addSettingsTable.js
```

**Mac/Linux:**
```bash
cd backend
node scripts/addSettingsTable.js
```

That's it! The script will:
- ✅ Create the `app_settings` table
- ✅ Insert the default `max_order_amount` setting (₹25)
- ✅ Verify everything worked

---

## 🎯 Alternative: Manual SQL

### Option A: Using psql (Command Line)

```bash
# Connect to your database
psql -U postgres -d sipandsnacks

# Then paste and run:
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

### Option B: Using Supabase/Neon Dashboard

1. Go to your database dashboard
2. Click **SQL Editor**
3. Paste the SQL above
4. Click **Run**

---

## ✅ Verify It Worked

After running the migration, test it:

```bash
# Start backend (if not running)
cd backend
npm start

# In another terminal, test the API:
curl http://localhost:5000/api/settings
```

Or just login to Admin Dashboard → Settings tab and check if you see the "Maximum Order Amount" field!

---

**Need more help? See `MIGRATION_INSTRUCTIONS.md` for detailed steps.**

