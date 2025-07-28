
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Phone, TrendingUp } from 'lucide-react';
import { getInstanceContactsSummary } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { ContactSummary } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface ContactSummaryCardProps {
  instanceId: string;
}

export function ContactSummaryCard({ instanceId }: ContactSummaryCardProps) {
  const [summary, setSummary] = useState<ContactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await getInstanceContactsSummary(instanceId);
        setSummary(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar resumo',
          description: 'Não foi possível carregar o resumo de contatos.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [instanceId, toast]);

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.totalContacts ?? 'N/A'}</div>
          <p className="text-xs text-muted-foreground">Número total de contatos únicos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contatos Ativos</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.totalContacts ?? 'N/A'}</div>
           <p className="text-xs text-muted-foreground">Contatos que não bloquearam</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">72.8%</div>
          <p className="text-xs text-muted-foreground">Média de interações por contato (Exemplo)</p>
        </CardContent>
      </Card>
    </div>
  );
}
