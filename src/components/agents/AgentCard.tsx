import type { Agent } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Bot, Edit, Wand2, PlusCircle, Users, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import { getChildAgents } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CreateChildAgentDialog } from './CreateChildAgentDialog';


interface AgentCardProps {
  agent: Agent;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const [childAgents, setChildAgents] = useState<Agent[]>(agent.childAgents || []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const { toast } = useToast();

  const fetchChildren = async () => {
    if (agent.type === 'PAI') {
      setIsLoadingChildren(true);
      try {
        const children = await getChildAgents(agent.id);
        setChildAgents(children);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os agentes filhos.'
        })
      } finally {
        setIsLoadingChildren(false);
      }
    }
  }

  const handleChildAgentCreated = (newChildAgent: Agent) => {
    setChildAgents(prev => [newChildAgent, ...prev]);
  };
  
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className='flex items-center gap-2 mb-2'>
              <Bot className="h-8 w-8 text-primary" />
              <Badge variant={agent.type === 'PAI' ? 'default' : 'secondary'}>
                {agent.type}
              </Badge>
            </div>
            <CardTitle className="font-headline text-xl truncate" title={agent.name}>{agent.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {agent.id}</CardDescription>
          </div>
           <Button variant="ghost" size="icon" className='h-8 w-8 text-muted-foreground hover:text-destructive' onClick={() => onDelete(agent)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir Agente</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
         <p className="text-sm text-muted-foreground line-clamp-3">
            <span className="font-semibold text-foreground">Persona: </span> 
            {agent.persona}
         </p>

         {agent.type === 'PAI' && (
           <Accordion type="single" collapsible onValueChange={() => fetchChildren()}>
            <AccordionItem value="item-1">
              <AccordionTrigger className='text-sm'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4'/>
                  Agentes Filhos ({childAgents.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {isLoadingChildren ? (
                  <div className='flex items-center justify-center p-4'>
                    <Loader2 className='h-5 w-5 animate-spin' />
                  </div>
                ) : childAgents.length > 0 ? (
                  <div className='space-y-2 p-2 max-h-48 overflow-y-auto'>
                    {childAgents.map(child => (
                      <div key={child.id} className='flex items-center justify-between p-2 rounded-md bg-muted/50'>
                         <div>
                          <p className='text-sm font-medium'>{child.name}</p>
                          <p className='text-xs text-muted-foreground line-clamp-1'>{child.persona}</p>
                        </div>
                         <Button asChild variant="ghost" size="sm">
                            <Link href={`/agents/${child.id}/edit`}>
                                <Edit className="h-3 w-3"/>
                            </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-xs text-muted-foreground text-center p-4'>Nenhum agente filho encontrado.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
         )}

      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
         <Button asChild variant="outline" size="sm">
            <Link href={`/agents/${agent.id}/edit`}>
                <Edit className="mr-2 h-3 w-3"/>
                Editar
            </Link>
        </Button>
        {agent.type === 'PAI' && (
           <CreateChildAgentDialog parentAgentId={agent.id} onChildAgentCreated={handleChildAgentCreated}>
             <Button variant="default" size="sm">
                  <PlusCircle className="mr-2 h-3 w-3"/>
                  Add Filho
              </Button>
           </CreateChildAgentDialog>
        )}
        <Button asChild variant="secondary" size="sm">
            <Link href={`/agents/${agent.id}/tune`}>
                <Wand2 className="mr-2 h-3 w-3"/>
                Afinar
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
