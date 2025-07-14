'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import type { Agent, Instance } from '@/lib/types';
import { AgentCard } from '@/components/agents/AgentCard';
import api from '@/services/api';
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
        const response = await api.get('/user/instances');
        setInstances(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your instances.',
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
      const response = await api.get(`/agents?instanceId=${instanceId}`);
      setAgents(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load agents for this instance.',
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAgentCreated = (newAgent: Agent) => {
    // If the new agent belongs to the currently selected instance, add it to the list
    if (newAgent.instanceId === selectedInstance) {
        setAgents(prev => [...prev, newAgent]);
    } else {
        // Otherwise, prompt the user to switch to the correct instance to see the new agent
        toast({
            title: 'Agent Created',
            description: `Select instance ${instances.find(i => i.id === newAgent.instanceId)?.name} to see your new agent.`
        })
    }
  };
  
  const closeDialog = () => {
    // Placeholder for closing logic if needed
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-medium">Select an Instance</h2>
                    <p className="text-sm text-muted-foreground">Choose an instance to view and manage its agents.</p>
                </div>
                <Select onValueChange={handleInstanceChange} disabled={loadingInstances}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder={loadingInstances ? 'Loading instances...' : 'Select an instance'} />
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
            <p className="ml-4 text-muted-foreground">Loading agents...</p>
        </div>
      )}

      {!loadingAgents && selectedInstance && agents.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}

      {!loadingAgents && selectedInstance && agents.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No agents found for this instance</h3>
          <p className="text-muted-foreground mt-2">
            Get started by creating your first AI agent.
          </p>
          <CreateAgentDialog onAgentCreated={handleAgentCreated}>
             <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
          </CreateAgentDialog>
        </div>
      )}

       {!selectedInstance && !loadingAgents && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Please select an instance</h3>
            <p className="text-muted-foreground mt-2">
                Select an instance from the dropdown above to manage its agents.
            </p>
         </div>
       )}
    </div>
  );
}
