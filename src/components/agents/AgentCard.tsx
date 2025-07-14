import type { Agent } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Bot, Link as LinkIcon, Edit, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Bot className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate" title={agent.name}>{agent.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {agent.id}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <p className="text-sm text-muted-foreground line-clamp-3">
            <span className="font-semibold text-foreground">Persona: </span> 
            {agent.persona}
         </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         <Button asChild variant="outline" size="sm">
            <Link href="#">
                <Edit className="mr-2 h-3 w-3"/>
                Editar
            </Link>
        </Button>
        <Button asChild variant="default" size="sm">
            <Link href="#">
                <Wand2 className="mr-2 h-3 w-3"/>
                Afinar
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
