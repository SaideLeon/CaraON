
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances } from '@/services/api';
import type { Instance } from '@/lib/types';
import { Loader2, User, Users } from 'lucide-react';
import { ContactSummaryCard } from '@/components/contacts/ContactSummaryCard';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    reconnecting: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

function ContactsPageContent() {
  const searchParams = useSearchParams();
  const instanceIdFromQuery = searchParams.get('instanceId');

  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(instanceIdFromQuery);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const { toast } = useToast();

  const fetchInstances = useCallback(async () => {
    setLoadingInstances(true);
    try {
      const fetchedInstances = await getUserInstances();
      setInstances(fetchedInstances);
       if (instanceIdFromQuery && fetchedInstances.some(i => i.id === instanceIdFromQuery)) {
        setSelectedInstance(instanceIdFromQuery);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias.',
      });
    } finally {
      setLoadingInstances(false);
    }
  }, [toast, instanceIdFromQuery]);

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
          <Select 
            value={selectedInstance ?? undefined}
            onValueChange={setSelectedInstance} 
            disabled={loadingInstances || instances.length === 0}
          >
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

      {loadingInstances && !selectedInstance ? (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
      ) : selectedInstance ? (
        <div className="space-y-6">
          <ContactSummaryCard key={`summary-${selectedInstance}`} instanceId={selectedInstance} />
          <ContactsTable key={`table-${selectedInstance}`} instanceId={selectedInstance} />
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Por favor, selecione uma instância</h3>
          <p className="text-muted-foreground mt-2">
            Selecione uma instância na lista acima para visualizar os contatos.
          </p>
        </div>
      )}
    </div>
  );
}


export default function ContactsPage() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
            <ContactsPageContent />
        </Suspense>
    )
}
