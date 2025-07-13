-- Complete fix for coin deduction and all database functions
-- Run this in Supabase SQL editor after the user creation fix

-- Create user_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'study_guide',
  ai_prompt TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  coins_spent INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_notes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON user_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notes_status ON user_notes(status);

-- Enable RLS on user_notes
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notes
DROP POLICY IF EXISTS "Users can view own notes" ON user_notes;
CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON user_notes;
CREATE POLICY "Users can insert own notes" ON user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON user_notes;
CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role policies for user_notes
DROP POLICY IF EXISTS "Service role can manage notes" ON user_notes;
CREATE POLICY "Service role can manage notes" ON user_notes
  FOR ALL WITH CHECK (true);

-- Create the coin transaction function
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

-- Grant permissions for the coin transaction function
GRANT EXECUTE ON FUNCTION public.process_coin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_coin_transaction TO service_role;

-- Grant permissions on user_notes table
GRANT SELECT, INSERT, UPDATE ON user_notes TO authenticated;
GRANT ALL ON user_notes TO service_role;

-- Create manual profile creation function (backup method)
CREATE OR REPLACE FUNCTION public.create_user_profile_manual(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  default_coins INTEGER := 30;
  existing_profile UUID;
BEGIN
  -- Check if profile already exists
  SELECT id INTO existing_profile FROM user_profiles WHERE id = p_user_id;
  
  IF existing_profile IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Profile already exists');
  END IF;

  -- Get signup bonus from tier config
  SELECT coin_bonus_on_signup INTO default_coins 
  FROM tier_configs 
  WHERE tier_name = 'free';
  
  IF default_coins IS NULL THEN
    default_coins := 30; -- Fallback
  END IF;

  -- Insert user profile
  INSERT INTO user_profiles (id, email, full_name, coins, tier)
  VALUES (p_user_id, p_email, p_full_name, default_coins, 'free');

  -- Record signup transaction
  INSERT INTO user_transactions (user_id, transaction_type, amount, previous_balance, new_balance, description)
  VALUES (p_user_id, 'bonus', default_coins, 0, default_coins, 'Welcome bonus for new user signup');

  -- Record signup usage
  INSERT INTO user_usage_history (user_id, action_type)
  VALUES (p_user_id, 'signup');

  RETURN jsonb_build_object('success', true, 'coins_awarded', default_coins);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for manual profile creation
GRANT EXECUTE ON FUNCTION public.create_user_profile_manual TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_manual TO service_role;

-- Add updated_at trigger for user_notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_notes_updated_at 
  BEFORE UPDATE ON user_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
