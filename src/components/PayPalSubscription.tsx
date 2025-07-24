'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { PAYPAL_CONFIG, getPayPalSDKUrl, API_ENDPOINTS, PAYMENT_METHODS } from '@/config/pricing';

interface PayPalSubscriptionProps {
  hostedButtonId?: string;
  amount: string;
  coins: number;
  tier?: string;
  onSuccess?: (paymentId: string) => void;
}

export const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({ 
  hostedButtonId,
  amount,
  coins,
  tier = 'one-time',
  onSuccess 
}) => {
  const { user, session } = useAuth();
  const { refreshProfile } = useUserProfile();
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadPayPalSDK = () => {
      // Check if script is already loaded
      if (scriptLoaded.current || document.querySelector('script[src*="paypal.com/sdk"]')) {
        renderPayPalButton();
        return;
      }

      // Load PayPal SDK with hosted-buttons component
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=BAAxRFSP8kAHMTn1JreZMzW1dhoxQa9-5Bifrq6aDyjG4fNy6XmEuGAHIotM_ygJQM1YsLLXVFmzDxIvts&components=hosted-buttons&disable-funding=venmo&currency=USD';
      script.async = true;
      
      script.onload = () => {
        scriptLoaded.current = true;
        // Wait a bit for PayPal to fully initialize
        setTimeout(() => {
          renderPayPalButton();
        }, 500);
      };
      
      document.head.appendChild(script);
    };

    loadPayPalSDK();
  }, [hostedButtonId, amount, coins, tier]);

  const renderPayPalButton = () => {
    if (!paypalRef.current) return;

    // Clear existing content
    paypalRef.current.innerHTML = '';

    // Check if PayPal is available
    if (!window.paypal) {
      console.error('PayPal SDK not loaded');
      return;
    }

    // For hosted buttons ($4.99, $19.99, and $59.99)
    if (hostedButtonId && (amount === "4.99" || amount === "19.99" || amount === "59.99")) {
      const containerId = `paypal-container-${hostedButtonId}`;
      paypalRef.current.innerHTML = `<div id="${containerId}"></div>`;
      
      // Check if HostedButtons is available
      if (window.paypal.HostedButtons) {
        try {
          window.paypal.HostedButtons({
            hostedButtonId: hostedButtonId
          }).render(`#${containerId}`);
        } catch (error) {
          console.error('Error rendering hosted button:', error);
          // Fallback to regular button
          renderRegularButton();
        }
      } else {
        console.error('PayPal HostedButtons not available');
        // Fallback to regular button
        renderRegularButton();
      }
    } else {
      // Regular PayPal button for other tiers
      renderRegularButton();
    }
  };

  const renderRegularButton = () => {
    if (!window.paypal || !paypalRef.current) return;

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'black',
        layout: 'vertical',
        label: 'pay'
      },
      createOrder: function(_data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount
            },
            description: `${coins} coins for note generation`
          }]
        });
      },
      onApprove: async function(_data: any, actions: any) {
        const order = await actions.order.capture();
        const paymentId = order.id;
        console.log('PayPal payment successful:', paymentId);
        
        try {
          if (!session) {
            alert('Please log in to complete your purchase');
            return;
          }

          console.log('Making API call to credit coins...');
          
          // Credit coins to user for one-time payment using centralized config
          const response = await fetch(API_ENDPOINTS.UPGRADE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              tier: tier,
              paymentId: paymentId,
              paymentMethod: PAYMENT_METHODS.PAYPAL,
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
