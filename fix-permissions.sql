-- Grant permissions on the user_payments table
GRANT ALL PRIVILEGES ON TABLE user_payments TO authenticated;
GRANT ALL PRIVILEGES ON TABLE user_payments TO service_role;
GRANT ALL PRIVILEGES ON TABLE user_payments TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_payments_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_payments_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE user_payments_id_seq TO anon;

-- Enable Row Level Security
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own payments" ON user_payments;
CREATE POLICY "Users can view own payments" ON user_payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for payments" ON user_payments;
CREATE POLICY "Enable insert for payments" ON user_payments
  FOR INSERT WITH CHECK (true);

-- Make sure the service role can bypass RLS
ALTER TABLE user_payments FORCE ROW LEVEL SECURITY;
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;