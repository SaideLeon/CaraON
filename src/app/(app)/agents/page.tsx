'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, ServerCrash } from 'lucide-react';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import type { Agent } from '@/lib/types';
import { AgentCard } from '@/components/agents/AgentCard';
import { getUserParentAgents } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const response = await getUserParentAgents();
        setAgents(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os seus agentes.',
        });
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, [toast]);

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
  };
  
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Seus Agentes Pais</h1>
                <p className="text-muted-foreground">Gerencie seus agentes orquestradores. Eles contêm agentes filhos para tarefas específicas.</p>
            </div>
            <CreateAgentDialog onAgentCreated={handleAgentCreated}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Agente Pai
                </Button>
            </CreateAgentDialog>
        </div>

      {loadingAgents && (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando agentes...</p>
        </div>
      )}

      {!loadingAgents && agents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}

      {!loadingAgents && agents.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhum agente pai encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Comece por criar o seu primeiro agente pai para orquestrar as tarefas.
          </p>
           <div className="mt-6">
             <CreateAgentDialog onAgentCreated={handleAgentCreated}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Agente Pai
                </Button>
            </CreateAgentDialog>
           </div>
        </div>
      )}
    </div>
  );
}
