'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

export const DebugPayPal: React.FC = () => {
  const { user, session } = useAuth();
  const { profile, refreshProfile } = useUserProfile();

  const testAPICall = async () => {
    if (!session) {
      alert('Not logged in');
      return;
    }

    console.log('Testing API call...');
    console.log('Session:', session);
    console.log('User:', user);
    console.log('Current profile:', profile);

    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tier: 'pro',
          subscriptionId: 'TEST-' + Date.now(),
          paymentMethod: 'paypal'
        }),
      });

      const result = await response.json();
      console.log('API response status:', response.status);
      console.log('API response:', result);
      
      if (response.ok) {
        alert(`API call successful! Added ${result.bonus_coins} coins. Refreshing profile...`);
        await refreshProfile();
      } else {
        alert(`API error: ${result.error}\nDetails: ${result.details || 'No details'}\nCode: ${result.code || 'No code'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Network error: ${error}`);
    }
  };

  const manualRefresh = async () => {
    console.log('Manually refreshing profile...');
    await refreshProfile();
    console.log('Profile after refresh:', profile);
  };

  if (!user) {
    return <div>Please log in to test</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-2">
      <h3 className="font-bold">Debug PayPal Integration</h3>
      <p>Current coins: {profile?.coins}</p>
      <p>Current tier: {profile?.tier}</p>
      <div className="space-x-2">
        <button 
          onClick={testAPICall}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test API Call
        </button>
        <button 
          onClick={manualRefresh}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Refresh Profile
        </button>
      </div>
    </div>
  );
};
