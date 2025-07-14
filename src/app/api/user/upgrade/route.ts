import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Upgrade API called');
    
    const { tier, subscriptionId, paymentMethod } = await request.json();
    console.log('Request data:', { tier, subscriptionId, paymentMethod });
    
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
    const newCoins = (currentProfile?.coins || 0) + 100;
    console.log('New coin balance will be:', newCoins);

    // Try a simple update first to test permissions
    console.log('Attempting to update user profile...');
    
    // Update user profile to Pro tier
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        tier: 'pro',
        coins: newCoins, // Add 100 bonus coins
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

    // Record subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        tier: tier,
        payment_method: paymentMethod || 'paypal',
        status: 'active'
      });

    if (subscriptionError) {
      console.error('Error recording subscription:', subscriptionError);
      // Don't fail the request for subscription logging issues
    }

    // Record transaction for bonus coins
    const { error: transError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'bonus',
        amount: 100,
        previous_balance: currentProfile?.coins || 0,
        new_balance: newCoins,
        description: 'Pro subscription bonus coins',
        metadata: {
          subscription_id: subscriptionId,
          payment_method: paymentMethod,
          tier_upgrade: 'pro'
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
      message: 'Successfully upgraded to Pro tier',
      tier: 'pro',
      bonus_coins: 100,
      new_coin_balance: newCoins
    });

  } catch (error) {
    console.error('Error in upgrade API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
