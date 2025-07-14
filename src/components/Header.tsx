
'use client';

import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from './ui/sidebar';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { CreateInstanceDialog } from '@/components/dashboard/CreateInstanceDialog';
import { useState } from 'react';
import type { Instance } from '@/lib/types';


export function Header() {
  const { isConnected } = useWebSocket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // These would ideally come from a context or page props
  const handleInstanceCreated = (newInstance: Instance) => {
    // This logic should be lifted to the page component
    window.location.reload(); // Simple reload to refresh the list
  };
  const closeDialog = () => setIsDialogOpen(false);


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <SidebarTrigger className="md:hidden"/>
        <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-headline font-bold">Instances</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">Manage your WhatsApp connections.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-destructive'}`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
             <CreateInstanceDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onInstanceCreated={handleInstanceCreated}
                onDialogClose={closeDialog}
            >
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Instance</span>
                     <span className="sm:hidden">New</span>
                </Button>
            </CreateInstanceDialog>
        </div>
    </header>
  );
}
