
'use client';

import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from './ui/sidebar';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { usePathname } from 'next/navigation';


const pageConfig: Record<string, { title: string; description: string }> = {
    '/dashboard': {
        title: 'Instâncias',
        description: 'Gira as suas ligações WhatsApp.',
    },
    '/playground': {
        title: 'Playground',
        description: 'Teste a orquestração dos seus agentes em tempo real.',
    },
    '/contacts': {
        title: 'Contatos',
        description: 'Visualize e gerencie os contatos de suas instâncias.',
    },
     '/agent-logs': {
        title: 'Logs de Agentes',
        description: 'Visualize o histórico de conversas dos seus agentes.',
    },
    '/agents': {
        title: 'Agentes',
        description: 'Crie e configure a hierarquia de agentes da sua instância.',
    },
    '/about': {
        title: 'Sobre o Sistema',
        description: 'Entenda como a orquestração de agentes do SARIAC funciona.',
    },
    '/about-tools': {
        title: 'Sobre as Ferramentas',
        description: 'Aprenda como utilizar as ferramentas disponíveis para os agentes.',
    }
}

export function Header() {
  const { isConnected } = useWebSocket();
  const pathname = usePathname();
  const { title, description } = pageConfig[pathname] || { title: '', description: '' };
  
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
        </div>
    </header>
  );
}
