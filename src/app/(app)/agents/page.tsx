
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, ServerCrash, Bot } from 'lucide-react';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import type { Agent, Instance } from '@/lib/types';
import { AgentCard } from '@/components/agents/AgentCard';
import { getInstanceParentAgents, deleteAgent, getUserInstances } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CreateOrganizationDialog } from '@/components/organizations/CreateOrganizationDialog';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    reconnecting: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isCreateOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);

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
          description: 'Não foi possível carregar as suas instâncias.',
        });
      } finally {
        setLoadingInstances(false);
      }
    };
    fetchInstances();
  }, [toast]);

  const fetchAgents = useCallback(async (instanceId: string) => {
    setLoadingAgents(true);
    setAgents([]);
    try {
      const response = await getInstanceParentAgents(instanceId);
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
  }, [toast]);
  
  useEffect(() => {
    if (selectedInstance) {
      fetchAgents(selectedInstance);
    }
  }, [selectedInstance, fetchAgents]);

  const handleAgentCreated = (newAgent: Agent) => {
    if (newAgent.instanceId === selectedInstance) {
        setAgents(prev => [newAgent, ...prev]);
    } else {
        toast({
            title: "Agente Criado",
            description: `Selecione a instância correta para ver seu novo agente.`
        });
    }
  };

  const handleOrgCreated = () => {
     // For now, just show a toast. A better implementation might open the agent dialog again.
     toast({
        title: "Organização Criada!",
        description: "Agora você pode criar um agente e associá-lo à nova organização."
     })
  }

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
  }

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAgent(agentToDelete.id);
      setAgents(prev => prev.filter(agent => agent.id !== agentToDelete.id));
      toast({
        title: 'Agente Excluído',
        description: `O agente "${agentToDelete.name}" foi excluído permanentemente.`
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: 'Não foi possível excluir o agente.'
      });
    } finally {
      setIsDeleting(false);
      setAgentToDelete(null);
    }
  }
  
  const renderContent = () => {
    if (loadingAgents) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Carregando agentes...</p>
        </div>
      );
    }

    if (agents.length > 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map(agent => <AgentCard key={agent.id} agent={agent} onDelete={handleDeleteClick} />)}
        </div>
      );
    }
    
    if (selectedInstance) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhum agente pai encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Comece por criar o seu primeiro agente pai para orquestrar as tarefas.
          </p>
          <div className="mt-6">
            <CreateAgentDialog instanceId={selectedInstance} onAgentCreated={handleAgentCreated} onRequestCreateOrg={() => setCreateOrgDialogOpen(true)}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Criar Agente Pai</span>
              </Button>
            </CreateAgentDialog>
          </div>
        </div>
      );
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Selecione uma Instância</h3>
            <p className="text-muted-foreground mt-2">
                Escolha uma instância acima para visualizar e gerenciar seus agentes.
            </p>
        </div>
    );
  };

  return (
    <>
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente o agente "{agentToDelete?.name}" e todos os seus agentes filhos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'A excluir...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {selectedInstance && (
         <CreateOrganizationDialog 
            onOrganizationCreated={handleOrgCreated}
            open={isCreateOrgDialogOpen}
            onOpenChange={setCreateOrgDialogOpen}
            defaultInstanceId={selectedInstance}
         />
      )}


      <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div className="flex-1">
                    <h2 className="text-lg font-medium">Selecione uma Instância</h2>
                    <p className="text-sm text-muted-foreground">Escolha uma instância para ver e gerir os seus agentes.</p>
                </div>
              <Select onValueChange={setSelectedInstance} disabled={loadingInstances}>
                  <SelectTrigger className="w-full md:w-[280px]">
                      <SelectValue placeholder={loadingInstances ? 'Carregando instâncias...' : 'Selecione uma instância'} />
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
          
          <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-2xl font-bold font-headline">Seus Agentes Pais</h1>
                  <p className="text-muted-foreground">Gerencie seus agentes orquestradores. Eles contêm agentes filhos para tarefas específicas.</p>
              </div>
              {selectedInstance && (
                <CreateAgentDialog instanceId={selectedInstance} onAgentCreated={handleAgentCreated} onRequestCreateOrg={() => setCreateOrgDialogOpen(true)}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Criar Agente Pai</span>
                    </Button>
                </CreateAgentDialog>
              )}
          </div>

          {renderContent()}
      </div>
    </>
  );
}
