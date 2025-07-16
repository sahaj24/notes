-- Check if user_payments table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_payments') THEN
        RAISE NOTICE 'Creating user_payments table...';
        
        -- Create the user_payments table
        CREATE TABLE IF NOT EXISTS user_payments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
          payment_id TEXT UNIQUE NOT NULL, -- PayPal payment ID
          amount DECIMAL(10,2) NOT NULL, -- Direct price amount (4.99, 19.99, 59.99)
          coins_purchased INTEGER NOT NULL, -- Number of coins purchased
          payment_method TEXT DEFAULT 'paypal',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Index for quick lookups
        CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_payments_amount ON user_payments(amount);

        -- RLS policy
        ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own payments" ON user_payments
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Enable insert for payments" ON user_payments
          FOR INSERT WITH CHECK (true);

        -- Grant permissions
        GRANT ALL ON user_payments TO authenticated;
        GRANT ALL ON user_payments TO service_role;

        -- Function to add coins to user profile after payment
        CREATE OR REPLACE FUNCTION add_coins_after_payment()
        RETURNS TRIGGER AS $func$
        BEGIN
          UPDATE user_profiles
          SET coins = coins + NEW.coins_purchased,
              total_coins_earned = total_coins_earned + NEW.coins_purchased,
              updated_at = NOW()
          WHERE id = NEW.user_id;
          
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger to automatically add coins when payment is recorded
        DROP TRIGGER IF EXISTS trigger_add_coins_after_payment ON user_payments;
        CREATE TRIGGER trigger_add_coins_after_payment
          AFTER INSERT ON user_payments
          FOR EACH ROW
          EXECUTE FUNCTION add_coins_after_payment();
          
        RAISE NOTICE 'user_payments table created successfully!';
    ELSE
        RAISE NOTICE 'user_payments table already exists.';
    END IF;
END $$;