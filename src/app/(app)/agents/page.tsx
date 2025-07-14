'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="text-center py-16 border-2 border-dashed rounded-lg">
      <h3 className="text-xl font-semibold">No agents found</h3>
      <p className="text-muted-foreground mt-2">
        Get started by creating your first AI agent.
      </p>
      <Button className="mt-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Agent
      </Button>
    </div>
  );
}
