
'use client';

import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from './ui/sidebar';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CreateAgentDialog } from './agents/CreateAgentDialog';
import { CreateOrganizationDialog } from './organizations/CreateOrganizationDialog';
import { CreateToolDialog } from './tools/CreateToolDialog';


const pageConfig: Record<string, { title: string; description: string }> = {
    '/dashboard': {
        title: 'Instâncias',
        description: 'Gira as suas ligações WhatsApp.',
    },
    '/agents': {
        title: 'Agentes',
        description: 'Crie e gira os seus agentes de IA.',
    },
    '/tools': {
        title: 'Ferramentas',
        description: 'Crie e gira ferramentas para dar novas habilidades aos seus agentes.',
    },
    '/organizations': {
        title: 'Organizações',
        description: 'Gira as suas organizações e equipas.',
    }
}

export function Header() {
  const { isConnected } = useWebSocket();
  const pathname = usePathname();
  const { title, description } = pageConfig[pathname] || { title: '', description: '' };
  
  // This would ideally come from a context or page props
  const handleActionCreated = () => {
    // This logic should be lifted to the page component
    window.location.reload(); // Simple reload to refresh the list
  };

  const renderActionButtons = () => {
    switch (pathname) {
      case '/agents':
        return (
          <CreateAgentDialog onAgentCreated={handleActionCreated} >
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Agente</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </CreateAgentDialog>
        );
      case '/tools':
        return (
          <CreateToolDialog onToolCreated={handleActionCreated} >
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nova Ferramenta</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </CreateToolDialog>
        );
      case '/organizations':
         return (
          <CreateOrganizationDialog onOrganizationCreated={handleActionCreated}>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nova Organização</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </CreateOrganizationDialog>
        );
      default:
        return null;
    }
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-headline font-bold">{title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">{description}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-destructive'}`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
             {renderActionButtons()}
        </div>
    </header>
  );
}
