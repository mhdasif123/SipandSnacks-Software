-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO app_settings (key, value, description) 
VALUES 
    ('max_order_amount', '25', 'Maximum amount allowed per order in ₹')
ON CONFLICT (key) DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);

