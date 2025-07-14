'use client';

import React from 'react';

export const EnvCheck: React.FC = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Environment Variables Check:</h3>
      <p>Supabase URL: {supabaseUrl ? '✅ Loaded' : '❌ Missing'}</p>
      <p>Supabase Key: {supabaseKey ? '✅ Loaded' : '❌ Missing'}</p>
      {supabaseUrl && <p className="text-sm text-gray-600 mt-2">URL: {supabaseUrl}</p>}
    </div>
  );
};
