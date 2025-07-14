'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const EnterpriseUpgrade: React.FC = () => {
  const { user } = useAuth();

  const handleContactSales = () => {
    // Simple contact method for enterprise sales
    const subject = encodeURIComponent('Enterprise Plan Inquiry');
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in upgrading to the Enterprise plan for unlimited notes.\n\nUser: ${user?.email || 'Not logged in'}\n\nPlease contact me with pricing and setup details.\n\nThanks!`
    );
    
    window.open(`mailto:sales@notopy.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <button 
      onClick={handleContactSales}
      className="w-full border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium hover:border-gray-400 transition-colors"
    >
      Contact Sales
    </button>
  );
};
