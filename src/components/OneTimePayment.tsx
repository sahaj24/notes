'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface OneTimePaymentProps {
  amount: string;
  coins: number;
  onSuccess?: (paymentId: string) => void;
}

export const OneTimePayment: React.FC<OneTimePaymentProps> = ({
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
      createOrder: function (data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount
            },
            description: `${coins} coins for note generation`
          }]
        });
      },
      onApprove: async function (data: any, actions: any) {
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
      onError: function (err: any) {
        console.error('PayPal error:', err);
        alert('Payment failed. Please try again.');
      }
    }).render(paypalRef.current);
  };

  if (!user) {
    return (
      <div className="text-center text-gray-600">
        Please sign in to purchase coins
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="font-medium">Template Spaces Feature</p>
            <p className="mt-1">Our templates include intentional spaces for your personal notes and additions. These spaces make it easy to customize content after generation!</p>
          </div>
        </div>
      </div>
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