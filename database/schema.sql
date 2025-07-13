-- Notopy Database Schema
-- Complete monetization system with coins, tiers, and usage tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table with coin and tier management
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  coins INTEGER DEFAULT 30 CHECK (coins >= 0), -- Start with 30 coins
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  monthly_notes_count INTEGER DEFAULT 0, -- Track monthly usage for tier limits
  total_notes_generated INTEGER DEFAULT 0,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}', -- Store additional user data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history for all coin movements
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'refund', 'penalty')),
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- Link to related note or action
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notes storage with detailed tracking
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  note_type TEXT DEFAULT 'study_guide' CHECK (note_type IN ('study_guide', 'mind_map', 'timeline', 'comparison', 'summary', 'outline')),
  ai_prompt TEXT, -- Store the original prompt used
  coins_spent INTEGER DEFAULT 1 CHECK (coins_spent > 0),
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  tags TEXT[], -- Array of tags for categorization
  is_favorite BOOLEAN DEFAULT false,
  export_count INTEGER DEFAULT 0, -- Track how many times it was exported
  view_count INTEGER DEFAULT 0, -- Track views
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed usage history for analytics
CREATE TABLE IF NOT EXISTS user_usage_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('note_generated', 'note_exported', 'note_viewed', 'tier_upgraded', 'coins_purchased', 'login', 'signup')),
  resource_id UUID, -- Reference to note or other resource
  coins_used INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}', -- Store additional action data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tier configurations (for reference)
CREATE TABLE IF NOT EXISTS tier_configs (
  tier_name TEXT PRIMARY KEY CHECK (tier_name IN ('free', 'pro', 'enterprise')),
  monthly_note_limit INTEGER, -- NULL means unlimited
  features TEXT[], -- Array of available features
  price_per_month DECIMAL(10,2) DEFAULT 0,
  coin_bonus_on_signup INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tier configurations
INSERT INTO tier_configs (tier_name, monthly_note_limit, features, price_per_month, coin_bonus_on_signup, description) VALUES
('free', 10, ARRAY['basic_notes', 'image_export'], 0, 30, 'Free tier with basic features'),
('pro', NULL, ARRAY['basic_notes', 'image_export', 'pdf_export', 'priority_support', 'advanced_formats'], 12, 100, 'Pro tier with unlimited notes and premium features'),
('enterprise', NULL, ARRAY['basic_notes', 'image_export', 'pdf_export', 'priority_support', 'advanced_formats', 'team_collaboration', 'custom_branding', '24_7_support'], 49, 200, 'Enterprise tier with all features and team collaboration')
ON CONFLICT (tier_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON user_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notes_status ON user_notes(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_user_id ON user_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_action_type ON user_usage_history(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_transactions
CREATE POLICY "Users can view own transactions" ON user_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user_notes
CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_usage_history
CREATE POLICY "Users can view own usage history" ON user_usage_history
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_coins INTEGER := 30;
  signup_bonus INTEGER;
BEGIN
  -- Get signup bonus from tier config
  SELECT coin_bonus_on_signup INTO signup_bonus 
  FROM tier_configs 
  WHERE tier_name = 'free';
  
  IF signup_bonus IS NOT NULL THEN
    default_coins := signup_bonus;
  END IF;

  INSERT INTO public.user_profiles (id, email, full_name, coins)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_coins
  );

  -- Record signup transaction
  INSERT INTO public.user_transactions (user_id, transaction_type, amount, previous_balance, new_balance, description)
  VALUES (
    NEW.id,
    'bonus',
    default_coins,
    0,
    default_coins,
    'Welcome bonus for new user signup'
  );

  -- Record signup usage
  INSERT INTO public.user_usage_history (user_id, action_type)
  VALUES (NEW.id, 'signup');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at 
  BEFORE UPDATE ON user_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle coin transactions safely
CREATE OR REPLACE FUNCTION public.process_coin_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT '',
  p_reference_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  current_coins INTEGER;
  new_coins INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current coin balance with row lock
  SELECT coins INTO current_coins 
  FROM user_profiles 
  WHERE id = p_user_id 
  FOR UPDATE;

  -- Check if user exists
  IF current_coins IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new balance
  new_coins := current_coins + p_amount;

  -- Check for insufficient funds
  IF new_coins < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Update user coins
  UPDATE user_profiles 
  SET coins = new_coins, updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO user_transactions (user_id, transaction_type, amount, previous_balance, new_balance, description, reference_id)
  VALUES (p_user_id, p_transaction_type, p_amount, current_coins, new_coins, p_description, p_reference_id)
  RETURNING id INTO transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_coins,
    'new_balance', new_coins
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly note counts
CREATE OR REPLACE FUNCTION public.reset_monthly_note_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    monthly_notes_count = 0,
    last_monthly_reset = CURRENT_DATE
  WHERE last_monthly_reset < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.coins,
  up.tier,
  up.total_notes_generated,
  up.monthly_notes_count,
  tc.monthly_note_limit,
  tc.features,
  COALESCE(note_stats.total_notes, 0) as notes_count,
  COALESCE(note_stats.favorite_notes, 0) as favorite_notes_count,
  COALESCE(trans_stats.total_earned, 0) as total_coins_earned,
  COALESCE(trans_stats.total_spent, 0) as total_coins_spent
FROM user_profiles up
LEFT JOIN tier_configs tc ON up.tier = tc.tier_name
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_notes,
    COUNT(*) FILTER (WHERE is_favorite = true) as favorite_notes
  FROM user_notes 
  WHERE status = 'active'
  GROUP BY user_id
) note_stats ON up.id = note_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(amount) FILTER (WHERE amount > 0) as total_earned,
    ABS(SUM(amount) FILTER (WHERE amount < 0)) as total_spent
  FROM user_transactions
  GROUP BY user_id
) trans_stats ON up.id = trans_stats.user_id;

-- Grant necessary permissions
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON tier_configs TO authenticated;
