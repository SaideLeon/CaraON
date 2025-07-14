'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import type { Agent } from '@/lib/types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  const handleAgentCreated = (newAgent: Agent) => {
    // In a real app, we would re-fetch the list of agents
    // For now, we'll just log it until a GET endpoint is available
    console.log('New agent created:', newAgent);
  };
  
  const closeDialog = () => {
    // Placeholder for closing logic if needed
  }

  return (
    <>
      {agents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Agent cards would go here */}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No agents found</h3>
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
    </>
  );
}
