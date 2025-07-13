import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, transaction_type, description } = body;

    // Validate input
    if (!amount || !transaction_type) {
      return NextResponse.json({ error: 'Amount and transaction type are required' }, { status: 400 });
    }

    // Get current user profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('coins, total_coins_spent, total_notes_generated')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
    }

    // Calculate new values
    const previous_balance = currentProfile.coins;
    const new_balance = transaction_type === 'deduction' ? previous_balance - amount : previous_balance + amount;
    
    // Check if user has enough coins for deduction
    if (transaction_type === 'deduction' && new_balance < 0) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
    }

    // Update user profile
    const updateData = {
      coins: new_balance,
      total_coins_spent: transaction_type === 'deduction' ? currentProfile.total_coins_spent + amount : currentProfile.total_coins_spent,
      total_notes_generated: transaction_type === 'deduction' ? currentProfile.total_notes_generated + 1 : currentProfile.total_notes_generated,
      last_transaction: {
        amount,
        transaction_type,
        description,
        previous_balance,
        new_balance,
        timestamp: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Transaction error:', error);
      return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        previous_balance,
        new_balance,
        updated_profile: data
      }
    });

  } catch (error) {
    console.error('Error in coin transaction API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Since we're using a simple single-table approach, we'll return basic transaction info from user profile
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('last_transaction, total_coins_spent, total_notes_generated, coins')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Transaction history error:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Return simplified transaction data
    const transactions = [];
    if (userProfile.last_transaction) {
      transactions.push(userProfile.last_transaction);
    }

    return NextResponse.json({ 
      success: true, 
      data: transactions,
      summary: {
        total_coins_spent: userProfile.total_coins_spent,
        total_notes_generated: userProfile.total_notes_generated,
        current_balance: userProfile.coins
      }
    });

  } catch (error) {
    console.error('Error in transaction history API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
