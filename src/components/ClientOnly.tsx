'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

/**
 * ClientOnly component ensures that its children are only rendered on the client side,
 * preventing hydration mismatches for components that use browser-specific APIs.
 */
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Immediate client-side rendering to prevent delays
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Return children only on client-side
  return <>{children}</>;
}