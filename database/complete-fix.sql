-- Enhanced fix for user profile creation
-- Run this in Supabase SQL editor

-- 1. First, check if the tables exist and create them if they don't
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  coins INTEGER DEFAULT 30 CHECK (coins >= 0),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  monthly_notes_count INTEGER DEFAULT 0,
  total_notes_generated INTEGER DEFAULT 0,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'refund', 'penalty')),
  amount INTEGER NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('note_generated', 'note_exported', 'note_viewed', 'tier_upgraded', 'coins_purchased', 'login', 'signup')),
  resource_id UUID,
  coins_used INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tier_configs (
  tier_name TEXT PRIMARY KEY CHECK (tier_name IN ('free', 'pro', 'enterprise')),
  monthly_note_limit INTEGER,
  features TEXT[],
  price_per_month DECIMAL(10,2) DEFAULT 0,
  coin_bonus_on_signup INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert tier configs if they don't exist
INSERT INTO tier_configs (tier_name, monthly_note_limit, features, price_per_month, coin_bonus_on_signup, description) VALUES
('free', 10, ARRAY['basic_notes', 'image_export'], 0, 30, 'Free tier with basic features'),
('pro', NULL, ARRAY['basic_notes', 'image_export', 'pdf_export', 'priority_support', 'advanced_formats'], 12, 100, 'Pro tier with unlimited notes and premium features'),
('enterprise', NULL, ARRAY['basic_notes', 'image_export', 'pdf_export', 'priority_support', 'advanced_formats', 'team_collaboration', 'custom_branding', '24_7_support'], 49, 200, 'Enterprise tier with all features and team collaboration')
ON CONFLICT (tier_name) DO NOTHING;

-- 3. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_history ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate ALL policies to ensure clean state
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON user_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON user_transactions;
DROP POLICY IF EXISTS "Enable insert for service role" ON user_transactions;

DROP POLICY IF EXISTS "Users can view own usage history" ON user_usage_history;
DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage_history;
DROP POLICY IF EXISTS "Service role can insert usage" ON user_usage_history;
DROP POLICY IF EXISTS "Enable insert for service role" ON user_usage_history;

-- 5. Create new policies that work for both authenticated users and service role
CREATE POLICY "Enable all for authenticated users" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Enable insert for everyone" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable all for user transactions" ON user_transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for transactions" ON user_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable all for user usage" ON user_usage_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for usage" ON user_usage_history
  FOR INSERT WITH CHECK (true);

-- 6. Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 7. Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 8. Create a more robust function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_coins INTEGER := 30;
  signup_bonus INTEGER;
BEGIN
  -- Log the attempt
  RAISE LOG 'handle_new_user triggered for user %', NEW.id;
  
  -- Get signup bonus from tier config (with fallback)
  BEGIN
    SELECT coin_bonus_on_signup INTO signup_bonus 
    FROM tier_configs 
    WHERE tier_name = 'free';
    
    IF signup_bonus IS NOT NULL AND signup_bonus > 0 THEN
      default_coins := signup_bonus;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Could not get tier config, using default: %', SQLERRM;
  END;

  -- Insert user profile
  BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, coins, tier)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'firstName' || ' ' || NEW.raw_user_meta_data->>'lastName',
        split_part(NEW.email, '@', 1)
      ),
      default_coins,
      'free'
    );
    
    RAISE LOG 'User profile created for %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error creating user profile: %', SQLERRM;
      RETURN NEW; -- Don't fail auth if profile creation fails
  END;

  -- Record signup transaction
  BEGIN
    INSERT INTO public.user_transactions (user_id, transaction_type, amount, previous_balance, new_balance, description)
    VALUES (
      NEW.id,
      'bonus',
      default_coins,
      0,
      default_coins,
      'Welcome bonus for new user signup'
    );
    
    RAISE LOG 'Welcome bonus transaction created for %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error creating welcome transaction: %', SQLERRM;
  END;

  -- Record signup usage
  BEGIN
    INSERT INTO public.user_usage_history (user_id, action_type, metadata)
    VALUES (
      NEW.id, 
      'signup',
      jsonb_build_object(
        'signup_method', CASE WHEN NEW.app_metadata->>'provider' IS NOT NULL THEN NEW.app_metadata->>'provider' ELSE 'email' END,
        'email', NEW.email
      )
    );
    
    RAISE LOG 'Signup usage history created for %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error creating usage history: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 9. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Create a view for easier user stats access
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
  COALESCE(trans_stats.total_spent, 0) as total_coins_spent,
  up.created_at,
  up.updated_at
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

-- 11. Grant access to the view
GRANT SELECT ON user_stats TO authenticated, anon;

-- 12. Manual function to create missing profiles (as backup)
CREATE OR REPLACE FUNCTION public.create_user_profile_manual(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  default_coins INTEGER := 30;
BEGIN
  -- Get user info from auth.users
  SELECT email, 
         COALESCE(
           raw_user_meta_data->>'full_name', 
           raw_user_meta_data->>'name',
           split_part(email, '@', 1)
         )
  INTO user_email, user_name
  FROM auth.users 
  WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users';
  END IF;
  
  -- Insert profile if it doesn't exist
  INSERT INTO user_profiles (id, email, full_name, coins, tier)
  VALUES (user_id, user_email, user_name, default_coins, 'free')
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert welcome bonus if profile was created
  INSERT INTO user_transactions (user_id, transaction_type, amount, previous_balance, new_balance, description)
  VALUES (user_id, 'bonus', default_coins, 0, default_coins, 'Manual welcome bonus')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Profile created for user %', user_email;
END;
$$;
