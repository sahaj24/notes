-- Minimal PayPal subscription tracking
-- Add this to existing schema without conflicts

-- Simple subscription tracking table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  subscription_id TEXT UNIQUE NOT NULL, -- PayPal subscription ID
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_method TEXT DEFAULT 'paypal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS policy
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON user_subscriptions TO service_role;
