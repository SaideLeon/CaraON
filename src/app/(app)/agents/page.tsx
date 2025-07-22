'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import type { Agent, Instance } from '@/lib/types';
import { AgentCard } from '@/components/agents/AgentCard';
import { getParentAgentsByInstanceId, getUserInstances } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const response = await getUserInstances();
        setInstances(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar suas instâncias.',
        });
      } finally {
        setLoadingInstances(false);
      }
    };
    fetchInstances();
  }, [toast]);

  const handleInstanceChange = async (instanceId: string) => {
    setSelectedInstance(instanceId);
    setLoadingAgents(true);
    setAgents([]);
    try {
      const response = await getParentAgentsByInstanceId(instanceId);
      setAgents(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os agentes para esta instância.',
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAgentCreated = (newAgent: Agent) => {
    if (newAgent.instanceId === selectedInstance) {
        setAgents(prev => [...prev, { ...newAgent, childAgents: [] }]);
    } else {
        toast({
            title: 'Agente Criado',
            description: `Selecione a instância correta para ver o seu novo agente.`
        })
    }
  };
  
  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-medium">Selecione uma Instância</h2>
                    <p className="text-sm text-muted-foreground">Escolha uma instância para ver e gerir os seus agentes.</p>
                </div>
                <Select onValueChange={handleInstanceChange} disabled={loadingInstances}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder={loadingInstances ? 'Carregando instâncias...' : 'Selecione uma instância'} />
                    </SelectTrigger>
                    <SelectContent>
                    {instances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>
                        {instance.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

      {loadingAgents && (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando agentes...</p>
        </div>
      )}

      {!loadingAgents && selectedInstance && (
        <div className="flex justify-end mb-4">
            <CreateAgentDialog onAgentCreated={handleAgentCreated}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Agente Pai
                </Button>
            </CreateAgentDialog>
        </div>
      )}

      {!loadingAgents && selectedInstance && agents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}

      {!loadingAgents && selectedInstance && agents.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Nenhum agente encontrado para esta instância</h3>
          <p className="text-muted-foreground mt-2">
            Comece por criar o seu primeiro agente pai.
          </p>
        </div>
      )}

       {!selectedInstance && !loadingAgents && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Por favor, selecione uma instância</h3>
            <p className="text-muted-foreground mt-2">
                Selecione uma instância na lista acima para gerir os seus agentes.
            </p>
         </div>
       )}
    </div>
  );
}
