-- Update pricing for tier configurations
-- Run this to update existing tier configs to new pricing

-- Update Pro tier to have 200 note limit and $4.99 price
UPDATE tier_configs 
SET 
  monthly_note_limit = 200,
  price_per_month = 4.99,
  description = 'Pro tier with 200 monthly notes and premium features'
WHERE tier_name = 'pro';

-- Update Enterprise tier to $19 price
UPDATE tier_configs 
SET 
  price_per_month = 19,
  description = 'Enterprise tier with unlimited notes and team collaboration'
WHERE tier_name = 'enterprise';

-- Also update any existing Pro users to have the 200 note limit
-- by adding a monthly_note_limit field to their profiles
UPDATE user_profiles 
SET monthly_note_limit = 200
WHERE tier = 'pro' AND monthly_note_limit IS NULL;

-- Keep Enterprise users with unlimited notes (NULL limit)
UPDATE user_profiles 
SET monthly_note_limit = NULL
WHERE tier = 'enterprise';

-- Free users keep their 10 note limit
UPDATE user_profiles 
SET monthly_note_limit = 10
WHERE tier = 'free' AND monthly_note_limit IS NULL;
