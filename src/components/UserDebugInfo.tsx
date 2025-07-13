'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const UserDebugInfo: React.FC = () => {
  const { user, session } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!user) return;
    
    setLoading(true);
    const info: any = {
      user_id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    };

    try {
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      info.profile_exists = !profileError;
      info.profile_data = profile;
      info.profile_error = profileError;

      // Check transactions
      const { data: transactions, error: transError } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', user.id);

      info.transactions = transactions;
      info.transactions_error = transError;

      // Check usage history
      const { data: usage, error: usageError } = await supabase
        .from('user_usage_history')
        .select('*')
        .eq('user_id', user.id);

      info.usage_history = usage;
      info.usage_error = usageError;

      // Test manual profile creation
      if (!profile) {
        const { error: manualError } = await supabase.rpc('create_user_profile_manual', {
          user_id: user.id
        });
        info.manual_creation_error = manualError;
      }

    } catch (error) {
      info.general_error = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p>No user logged in</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-4xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">User Debug Information</h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Refresh Diagnostics'}
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-green-700">✅ User Authentication</h4>
          <p><strong>User ID:</strong> {debugInfo.user_id}</p>
          <p><strong>Email:</strong> {debugInfo.email}</p>
          <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <h4 className={`font-semibold ${debugInfo.profile_exists ? 'text-green-700' : 'text-red-700'}`}>
            {debugInfo.profile_exists ? '✅' : '❌'} User Profile in Database
          </h4>
          {debugInfo.profile_exists ? (
            <div>
              <p><strong>Coins:</strong> {debugInfo.profile_data?.coins}</p>
              <p><strong>Tier:</strong> {debugInfo.profile_data?.tier}</p>
              <p><strong>Created:</strong> {debugInfo.profile_data?.created_at}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-600">Profile not found in database</p>
              <p><strong>Error:</strong> {debugInfo.profile_error?.message}</p>
              <p><strong>Error Code:</strong> {debugInfo.profile_error?.code}</p>
              {debugInfo.manual_creation_error && (
                <p><strong>Manual Creation Error:</strong> {debugInfo.manual_creation_error.message}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className={`font-semibold ${debugInfo.transactions?.length > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {debugInfo.transactions?.length > 0 ? '✅' : '❌'} Welcome Bonus Transaction
          </h4>
          {debugInfo.transactions?.length > 0 ? (
            <p>Found {debugInfo.transactions.length} transaction(s)</p>
          ) : (
            <p className="text-red-600">No transactions found</p>
          )}
        </div>

        <div>
          <h4 className={`font-semibold ${debugInfo.usage_history?.length > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {debugInfo.usage_history?.length > 0 ? '✅' : '❌'} Usage History
          </h4>
          {debugInfo.usage_history?.length > 0 ? (
            <p>Found {debugInfo.usage_history.length} usage record(s)</p>
          ) : (
            <p className="text-red-600">No usage history found</p>
          )}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">Raw Debug Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};
