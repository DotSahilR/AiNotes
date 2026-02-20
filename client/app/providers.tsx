'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

import { setTokenGetter } from '@/lib/api';

const TokenBridge = (): null => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(async () => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  return null;
};

export default function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TokenBridge />
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </ClerkProvider>
  );
}
