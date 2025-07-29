
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/SidebarNav';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // List of pages that should have no padding to take up full screen height
  const fullHeightPages = ['/playground', '/messages'];
  const hasPadding = !fullHeightPages.includes(pathname);

  return (
    <WebSocketProvider>
      <SidebarProvider>
        <SidebarNav />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <Header />
            <main className={cn(
              "flex-1 overflow-y-auto bg-muted/40",
              hasPadding && "p-4 md:p-6 lg:p-8"
            )}>
              {children}
            </main>
        </SidebarInset>
      </SidebarProvider>
    </WebSocketProvider>
  );
}
