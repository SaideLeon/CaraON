
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances } from '@/services/api';
import type { Instance, Contact } from '@/lib/types';
import { MessageSquare } from 'lucide-react';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { MessageHistory } from '@/components/messages/MessageHistory';
import { cn } from '@/lib/utils';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    reconnecting: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

export default function MessagesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const { toast } = useToast();

  const fetchInstances = useCallback(async () => {
    setLoadingInstances(true);
    try {
      const fetchedInstances = await getUserInstances();
      setInstances(fetchedInstances);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias.',
      });
    } finally {
      setLoadingInstances(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const handleInstanceChange = (instanceId: string) => {
    setSelectedInstance(instanceId);
    setSelectedContact(null); // Reset contact selection when instance changes
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
      <Card className="shrink-0">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5"/>
                <span>Selecione uma Instância</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Escolha uma instância para visualizar o histórico de mensagens.
            </p>
          </div>
          <Select onValueChange={handleInstanceChange} disabled={loadingInstances || instances.length === 0}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue
                placeholder={
                  loadingInstances
                    ? 'Carregando instâncias...'
                    : instances.length === 0
                    ? 'Nenhuma instância encontrada'
                    : 'Selecione uma instância'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => {
                 const status = instance.status?.toLowerCase() as keyof typeof statusConfig | undefined;
                 const colorClass = status ? statusConfig[status]?.bgColor : 'bg-muted-foreground';
                 return (
                    <SelectItem key={instance.id} value={instance.id}>
                        <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', colorClass)} />
                            <span>{instance.name}</span>
                        </div>
                    </SelectItem>
                 )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedInstance ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-0">
          <div className="md:col-span-1 lg:col-span-1 h-full min-h-0">
            <ConversationsList 
                instanceId={selectedInstance} 
                selectedContact={selectedContact}
                onSelectContact={setSelectedContact}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3 h-full min-h-0">
             <MessageHistory 
                instanceId={selectedInstance}
                contact={selectedContact}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card">
          <div>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Por favor, selecione uma instância</h3>
            <p className="text-muted-foreground mt-2">
              Selecione uma instância na lista acima para visualizar as mensagens.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
