'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/SidebarNav';
import { Header } from '@/components/Header';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [user, loading, token, router]);

  if (loading || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <WebSocketProvider>
      <SidebarProvider>
        <SidebarNav />
        <SidebarInset>
            <div className="flex flex-col h-screen">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">{children}</main>
            </div>
        </SidebarInset>
      </SidebarProvider>
    </WebSocketProvider>
  );
}
