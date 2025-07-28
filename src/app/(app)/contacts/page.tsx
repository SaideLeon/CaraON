
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances } from '@/services/api';
import type { Instance } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ContactSummaryCard } from '@/components/contacts/ContactSummaryCard';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { cn } from '@/lib/utils';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

export default function ContactsPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-medium">Selecione uma Instância</h2>
            <p className="text-sm text-muted-foreground">
              Escolha uma instância para visualizar seus contatos e estatísticas.
            </p>
          </div>
          <Select onValueChange={setSelectedInstance} disabled={loadingInstances || instances.length === 0}>
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
        <div className="space-y-6">
          <ContactSummaryCard instanceId={selectedInstance} />
          <ContactsTable key={selectedInstance} instanceId={selectedInstance} />
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Por favor, selecione uma instância</h3>
          <p className="text-muted-foreground mt-2">
            Selecione uma instância na lista acima para visualizar os contatos.
          </p>
        </div>
      )}
    </div>
  );
}
