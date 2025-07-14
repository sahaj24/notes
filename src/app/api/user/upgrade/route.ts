import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Upgrade API called');
    
    const { tier, subscriptionId, paymentId, paymentMethod, coins, amount } = await request.json();
    console.log('Request data:', { tier, subscriptionId, paymentId, paymentMethod, coins, amount });
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User authenticated:', user.email);

    // Get current user profile to calculate new coin balance
    const { data: currentProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('Error fetching current profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    console.log('Current profile:', currentProfile);
    const coinsToAdd = coins || 200; // Use provided coins or default to 200
    const newCoins = (currentProfile?.coins || 10) + coinsToAdd; // Add to existing coins
    console.log('New coin balance will be:', newCoins);

    // Try a simple update first to test permissions
    console.log('Attempting to update user profile...');
    
    // Update user profile with new coins
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        coins: newCoins, // Add coins to existing balance
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    console.log('Update result:', { updateData, updateError });

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      console.error('Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: updateError.message || 'Unknown error',
        code: updateError.code || 'UNKNOWN'
      }, { status: 500 });
    }

    console.log('User profile updated successfully');

    // Record subscription/payment
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId || paymentId,
        tier: tier === 'one-time' ? 'coin_purchase' : tier,
        payment_method: paymentMethod || 'paypal',
        status: 'active',
        amount: amount || '0',
        coins_granted: coinsToAdd
      });

    if (subscriptionError) {
      console.error('Error recording subscription:', subscriptionError);
      // Don't fail the request for subscription logging issues
    }

    // Record transaction for coin purchase
    const { error: transError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: coinsToAdd,
        previous_balance: currentProfile?.coins || 10,
        new_balance: newCoins,
        description: `Coin purchase - ${coinsToAdd} coins`,
        metadata: {
          subscription_id: subscriptionId,
          payment_id: paymentId,
          payment_method: paymentMethod,
          purchase_amount: amount
        }
      });

    if (transError) {
      console.error('Error recording transaction:', transError);
      // Don't fail the request for transaction logging issues
    } else {
      console.log('Transaction recorded successfully');
    }

    // Record usage history
    const { error: usageError } = await supabase
      .from('user_usage_history')
      .insert({
        user_id: user.id,
        action_type: 'tier_upgrade',
        metadata: {
          new_tier: 'pro',
          subscription_id: subscriptionId,
          payment_method: paymentMethod
        }
      });

    if (usageError) {
      console.error('Error recording usage:', usageError);
      // Don't fail the request for usage logging issues
    }

    console.log('Upgrade completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${coinsToAdd} coins to your account`,
      coins_added: coinsToAdd,
      new_coin_balance: newCoins
    });

  } catch (error) {
    console.error('Error in upgrade API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
