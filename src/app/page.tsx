'use client';

import { LandingPage } from '@/components/LandingPage';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  return (
    <main className="min-h-screen">
      <ClientOnly>
        <LandingPage />
      </ClientOnly>
    </main>
  );
}
