'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface PayPalSubscriptionProps {
  planId: string;
  onSuccess?: (subscriptionId: string) => void;
}

export const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({ 
  planId = 'P-37D43660E4028554FNB2I7FQ',
  onSuccess 
}) => {
  const { user, session } = useAuth();
  const { refreshProfile } = useUserProfile();
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AdFWv3FU91KhSop6LI9ZY8EzmPDzGpFjD2LYl7YyZVYpTPNl--1kQFFS9exTmKE8fPcbdXN_RKT7aoJM&vault=true&intent=subscription';
    script.async = true;
    
    script.onload = () => {
      scriptLoaded.current = true;
      renderPayPalButton();
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalRef.current) return;

    // Clear existing buttons
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'black',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function(data: any, actions: any) {
        return actions.subscription.create({
          plan_id: planId
        });
      },
      onApprove: async function(data: any, actions: any) {
        const subscriptionId = data.subscriptionID;
        console.log('PayPal approval successful:', subscriptionId);
        
        try {
          if (!session) {
            alert('Please log in to complete your subscription');
            return;
          }

          console.log('Making API call to upgrade user...');
          
          // Update user to Pro tier
          const response = await fetch('/api/user/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              tier: 'pro',
              subscriptionId: subscriptionId,
              paymentMethod: 'paypal'
            }),
          });

          const result = await response.json();
          console.log('API response:', result);

          if (response.ok && result.success) {
            // Refresh user profile
            console.log('Refreshing user profile...');
            await refreshProfile();
            
            // Call success callback
            if (onSuccess) {
              onSuccess(subscriptionId);
            }
            
            alert(`Successfully upgraded to Pro! You now have 200 monthly notes and received ${result.bonus_coins} bonus coins.`);
          } else {
            console.error('Failed to upgrade user:', result);
            alert(`Payment successful but failed to upgrade account: ${result.error || 'Unknown error'}. Please contact support with subscription ID: ${subscriptionId}`);
          }
        } catch (error) {
          console.error('Error upgrading user:', error);
          alert(`Payment successful but failed to upgrade account. Please contact support with subscription ID: ${subscriptionId}`);
        }
      },
      onError: function(err: any) {
        console.error('PayPal error:', err);
        alert('Payment failed. Please try again.');
      }
    }).render(paypalRef.current);
  };

  if (!user) {
    return (
      <div className="text-center text-gray-600">
        Please sign in to subscribe
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={paypalRef} id="paypal-button-container"></div>
    </div>
  );
};

// Extend window object for TypeScript
declare global {
  interface Window {
    paypal: any;
  }
}
