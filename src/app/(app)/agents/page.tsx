
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ServerCrash, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import type { Instance, AgentHierarchy } from '@/lib/types';
import { getUserInstances, getAgentHierarchies } from '@/services/api';
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
  const [hierarchies, setHierarchies] = useState<AgentHierarchy[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [selectedHierarchy, setSelectedHierarchy] = useState<AgentHierarchy | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
        const [instancesResponse, hierarchiesResponse] = await Promise.all([
            getUserInstances(),
            getAgentHierarchies()
        ]);
        
        setInstances(instancesResponse);
        setHierarchies(hierarchiesResponse.instances || []);

    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os dados das instâncias e agentes.',
        });
    } finally {
        setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleInstanceChange = (instanceId: string) => {
    const instance = instances.find(i => i.id === instanceId);
    if(instance) {
        setSelectedInstance(instance);
        const hierarchy = hierarchies.find(h => h.instance_id === instanceId);
        
        if (hierarchy) {
            setSelectedHierarchy(hierarchy);
        } else {
            // If no hierarchy exists for the selected instance, create a default one
            setSelectedHierarchy({
                instance_id: instanceId,
                router_instructions: "Você é um roteador inteligente. Sua função é analisar a pergunta do usuário e direcioná-la para o especialista mais adequado. Responda apenas com o nome do especialista.",
                agents: [],
            });
        }
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
    
    if (loadingData) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Carregando dados...</p>
        </div>
      );
    }

    if (selectedHierarchy) {
        return (
            <HierarchyEditor
                key={selectedInstance.id}
                hierarchy={selectedHierarchy}
                instance={selectedInstance}
                onHierarchyUpdated={fetchData} // Refetch all data on update
            />
        )
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhuma configuração encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Não foi possível carregar a configuração para esta instância. Tente selecionar novamente.
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
            <Select onValueChange={handleInstanceChange} disabled={loadingData}>
                <SelectTrigger className="w-full md:w-[380px]">
                    <SelectValue placeholder={loadingData ? 'Carregando instâncias...' : 'Selecione uma instância'} />
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
