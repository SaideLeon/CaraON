
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ServerCrash, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import type { Instance, AgentHierarchy } from '@/lib/types';
import { getUserInstances, getAgentHierarchyForInstance } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { HierarchyEditor } from '@/components/agents/HierarchyEditor';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    reconnecting: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

export default function AgentsPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [agentHierarchy, setAgentHierarchy] = useState<AgentHierarchy | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const response = await getUserInstances();
        setInstances(response);
        if (response.length > 0) {
          // Automatically select the first instance
          // handleInstanceChange(response[0].id);
        }
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

  const fetchHierarchy = useCallback(async (instanceId: string) => {
    setLoadingHierarchy(true);
    setAgentHierarchy(null);
    try {
      const response = await getAgentHierarchyForInstance(instanceId);
      if (response && response.agents) {
         setAgentHierarchy(response);
      } else {
         // Initialize with a default structure if no hierarchy exists
         setAgentHierarchy({
            instance_id: instanceId,
            router_instructions: "Você é um roteador inteligente. Sua função é analisar a pergunta do usuário e direcioná-la para o especialista mais adequado. Responda apenas com o nome do especialista.",
            agents: [],
         });
      }
    } catch (error: any) {
        if (error.response?.status === 404) {
            setAgentHierarchy({
                instance_id: instanceId,
                router_instructions: "Você é um roteador inteligente. Sua função é analisar a pergunta do usuário e direcioná-la para o especialista mais adequado. Responda apenas com o nome do especialista.",
                agents: [],
            });
             toast({
                title: 'Hierarquia não encontrada',
                description: 'Nenhuma hierarquia de agentes encontrada. Você pode criar uma nova.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível carregar a hierarquia de agentes para esta instância.',
            });
        }
    } finally {
      setLoadingHierarchy(false);
    }
  }, [toast]);
  
  const handleInstanceChange = (instanceId: string) => {
    const instance = instances.find(i => i.id === instanceId);
    if(instance) {
        setSelectedInstance(instance);
        fetchHierarchy(instanceId);
        setIsEditorOpen(true);
    }
  };
  
  const renderContent = () => {
    if (!selectedInstance) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Selecione uma Instância</h3>
            <p className="text-muted-foreground mt-2">
                Escolha uma instância acima para visualizar e gerenciar sua hierarquia de agentes.
            </p>
        </div>
      );
    }
    
    if (loadingHierarchy) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Carregando hierarquia de agentes...</p>
        </div>
      );
    }

    if (agentHierarchy) {
        return (
            <HierarchyEditor
                key={selectedInstance.id}
                hierarchy={agentHierarchy}
                instance={selectedInstance}
                onHierarchyUpdated={() => fetchHierarchy(selectedInstance.id)}
            />
        )
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhuma hierarquia de agentes encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Parece que algo deu errado ao buscar a configuração. Tente selecionar a instância novamente.
          </p>
        </div>
      );
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Gerenciador de Hierarquia de Agentes</CardTitle>
                <CardDescription>Selecione uma instância para configurar seus agentes, roteador e ferramentas.</CardDescription>
            </CardHeader>
            <CardContent>
            <Select onValueChange={handleInstanceChange} disabled={loadingInstances}>
                <SelectTrigger className="w-full md:w-[380px]">
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
        
        {renderContent()}
    </div>
  );
}
