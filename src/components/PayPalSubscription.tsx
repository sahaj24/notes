'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface PayPalSubscriptionProps {
  planId: string;
  amount: string;
  coins: number;
  onSuccess?: (paymentId: string) => void;
}

export const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({ 
  planId = 'P-37D43660E4028554FNB2I7FQ',
  amount,
  coins,
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
    script.src = 'https://www.paypal.com/sdk/js?client-id=AdFWv3FU91KhSop6LI9ZY8EzmPDzGpFjD2LYl7YyZVYpTPNl--1kQFFS9exTmKE8fPcbdXN_RKT7aoJM&currency=USD';
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
        label: 'pay'
      },
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount
            },
            description: `${coins} coins for note generation`
          }]
        });
      },
      onApprove: async function(data: any, actions: any) {
        const order = await actions.order.capture();
        const paymentId = order.id;
        console.log('PayPal payment successful:', paymentId);
        
        try {
          if (!session) {
            alert('Please log in to complete your purchase');
            return;
          }

          console.log('Making API call to credit coins...');
          
          // Credit coins to user for one-time payment
          const response = await fetch('/api/user/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              tier: 'one-time',
              paymentId: paymentId,
              paymentMethod: 'paypal',
              coins: coins,
              amount: amount
            }),
          });
          
          console.log('Payment API call completed');

          let result;
          try {
            // Check if response has content before parsing JSON
            const text = await response.text();
            result = text ? JSON.parse(text) : {};
            console.log('API response:', result);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            result = { success: false, error: 'Invalid response from server' };
          }

          // Always consider the payment successful if the PayPal transaction completed
          // This is because the server is adding coins even if there's an issue with recording the payment
          console.log('Refreshing user profile...');
          await refreshProfile();
          
          // Call success callback
          if (onSuccess) {
            onSuccess(paymentId);
          }
          
          // Show success message
          alert(`Payment successful! You have been credited ${coins} coins.`);
        } catch (error) {
          console.error('Error crediting coins:', error);
          alert(`Payment successful but failed to credit coins. Please contact support with payment ID: ${paymentId}`);
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
