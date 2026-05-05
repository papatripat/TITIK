'use client';

import { AuthProvider } from '@/lib/auth-context';
import LoadingScreen from '@/components/LoadingScreen';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingScreen>{children}</LoadingScreen>
    </AuthProvider>
  );
}
