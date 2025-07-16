-- Create a minimal payments table with no dependencies
-- This script is designed to be as simple as possible to avoid any syntax errors

-- Create the table with minimal fields
CREATE TABLE IF NOT EXISTS user_payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  coins_purchased INTEGER NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a basic index
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);