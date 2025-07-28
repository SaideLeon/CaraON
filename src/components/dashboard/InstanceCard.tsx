
'use client';

import type { Instance } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Link as LinkIcon, RefreshCw, Trash2, MoreVertical, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CaraOnIcon } from '../icons/CaraOnIcon';

interface InstanceCardProps {
  instance: Instance;
  onReconnect: (instance: Instance) => void;
  onDisconnect: (instance: Instance) => void;
  onDelete: (instance: Instance) => void;
}

const statusConfig = {
    connected: {
        label: 'Conectado',
        color: 'bg-green-500',
        textColor: 'text-green-400'
    },
    disconnected: {
        label: 'Desconectado',
        color: 'bg-red-500',
        textColor: 'text-red-400'
    },
    pending: {
        label: 'Pendente',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400'
    },
    pending_qr: {
        label: 'Pendente QR',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400'
    },
     error: {
        label: 'Erro',
        color: 'bg-destructive',
        textColor: 'text-destructive'
    }
}


export function InstanceCard({ instance, onReconnect, onDisconnect, onDelete }: InstanceCardProps) {
    const currentStatus = instance.status?.toLowerCase() as keyof typeof statusConfig || 'pending';
    const config = statusConfig[currentStatus] || statusConfig.error;
  
  return (
    <Card className="flex flex-col hover:border-primary transition-colors duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
           <div className="flex items-center gap-3">
             <CaraOnIcon className="h-8 w-8 text-primary" />
             <div className="flex-1 min-w-0">
                <CardTitle className="font-headline text-xl truncate" title={instance.name}>{instance.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">ID: {instance.clientId}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className={cn("flex shrink-0 items-center gap-2 text-sm font-medium", config.textColor)}>
            <div className={cn("h-2 w-2 rounded-full", config.color)}></div>
            <span>{config.label}</span>
          </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button asChild variant="default" size="sm">
            <Link href="#">
                Gerir
                <LinkIcon className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Mais opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(currentStatus === 'disconnected' || currentStatus === 'error') && (
                 <DropdownMenuItem onClick={() => onReconnect(instance)}>
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    <span>Reconectar</span>
                </DropdownMenuItem>
              )}
              {currentStatus === 'connected' && (
                <DropdownMenuItem onClick={() => onDisconnect(instance)}>
                    <PowerOff className="mr-2 h-4 w-4" />
                    <span>Desconectar</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(instance)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
