'use client';

import type { Instance } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { MessageSquare, Link as LinkIcon, Power, PowerOff, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

interface InstanceCardProps {
  instance: Instance;
  onReconnect: (instance: Instance) => void;
  onDisconnect: (instance: Instance) => void;
}

const statusConfig = {
    connected: {
        icon: Power,
        label: 'Conectado',
        color: 'bg-green-500',
        textColor: 'text-green-400'
    },
    disconnected: {
        icon: PowerOff,
        label: 'Desconectado',
        color: 'bg-red-500',
        textColor: 'text-red-400'
    },
    pending: {
        icon: Loader2,
        label: 'Pendente',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400'
    },
     error: {
        icon: PowerOff,
        label: 'Erro',
        color: 'bg-destructive',
        textColor: 'text-destructive'
    }
}


export function InstanceCard({ instance, onReconnect, onDisconnect }: InstanceCardProps) {
    const currentStatus = instance.status || 'pending';
    const config = statusConfig[currentStatus] || statusConfig.error;
    const Icon = config.icon;
  
  return (
    <Card className="flex flex-col hover:border-primary transition-colors duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate" title={instance.name}>{instance.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {instance.clientId}</CardDescription>
          </div>
          <div className={cn("flex shrink-0 items-center gap-2 text-sm font-medium", config.textColor)}>
              <span className="relative flex h-3 w-3">
                  <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.color, {'animate-ping': currentStatus === 'pending' || currentStatus === 'connected' })}></span>
                  <span className={cn("relative inline-flex h-3 w-3 rounded-full", config.color)}></span>
              </span>
              <span>{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
      </CardContent>
      <CardFooter className="flex justify-end items-center gap-2">
         {(currentStatus === 'disconnected' || currentStatus === 'error') && (
            <Button variant="outline" size="sm" onClick={() => onReconnect(instance)}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                Reconectar
            </Button>
         )}
         {currentStatus === 'connected' && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDisconnect(instance)}>
                <PowerOff className="mr-2 h-4 w-4"/>
                Desconectar
            </Button>
         )}
        <Button asChild variant="default" size="sm">
            <Link href="#">
                Gerir
                <LinkIcon className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
