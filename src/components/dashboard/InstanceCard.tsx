import type { Instance } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Link as LinkIcon, Power, PowerOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

interface InstanceCardProps {
  instance: Instance;
}

const statusConfig = {
    connected: {
        icon: Power,
        label: 'Connected',
        color: 'bg-green-500',
        textColor: 'text-green-600 dark:text-green-400'
    },
    disconnected: {
        icon: PowerOff,
        label: 'Disconnected',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400'
    },
    pending: {
        icon: Loader2,
        label: 'Pending',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400'
    },
     error: {
        icon: PowerOff,
        label: 'Error',
        color: 'bg-destructive',
        textColor: 'text-destructive'
    }
}


export function InstanceCard({ instance }: InstanceCardProps) {
    const currentStatus = instance.status || 'pending';
    const config = statusConfig[currentStatus];
    const Icon = config.icon;
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate">{instance.name}</CardTitle>
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
      <CardContent className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground truncate">ID: {instance.clientId}</p>
        <Button asChild variant="outline" size="sm">
            {/* This would eventually link to a details page */}
            {/* For now, it's a placeholder */}
            <Link href="#">
                Manage
                <LinkIcon className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
