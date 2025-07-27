
import type { Agent } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Bot, Edit, Wand2, PlusCircle, Users, Loader2, Trash2, Wrench, Code, Route } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import { getChildAgents, getAgentById } from '@/services/api';
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

export function AgentCard({ agent: initialAgent, onDelete }: AgentCardProps) {
  const [agent, setAgent] = useState<Agent>(initialAgent);
  const [childAgents, setChildAgents] = useState<Agent[]>(initialAgent.childAgents || []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch full agent data to get tools, as it might not be in the initial list
    const fetchFullAgent = async () => {
        try {
            const fullAgentData = await getAgentById(initialAgent.id);
            setAgent(fullAgentData);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível carregar os detalhes do agente.'
            });
        }
    }
    fetchFullAgent();
  }, [initialAgent.id, toast])

  const fetchChildren = async () => {
    if (agent.type === 'ROUTER' || agent.type === 'PARENT') {
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
  
  const getBadgeVariant = (type: Agent['type']) => {
    switch(type) {
      case 'ROUTER': return 'default';
      case 'PARENT': return 'secondary';
      case 'CHILD': return 'outline';
      default: return 'secondary';
    }
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className='flex items-center gap-2 mb-2'>
              <Bot className="h-8 w-8 text-primary" />
              <Badge variant={getBadgeVariant(agent.type)}>
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

         {agent.routerAgentId && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md flex items-center gap-2">
                <Route className="h-4 w-4 shrink-0" />
                <div>Roteia para o ID: <span className="font-mono text-foreground">{agent.routerAgentId}</span></div>
            </div>
         )}

         <Accordion type="single" collapsible>
            {(agent.type === 'ROUTER' || agent.type === 'PARENT') && (
                <AccordionItem value="child-agents">
                <AccordionTrigger className='text-sm' onClick={() => fetchChildren()}>
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
            )}
             {agent.tools && agent.tools.length > 0 && (
                <AccordionItem value="tools">
                    <AccordionTrigger className='text-sm'>
                        <div className='flex items-center gap-2'>
                        <Wrench className='h-4 w-4'/>
                        Ferramentas ({agent.tools.length})
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                         <div className='space-y-2 p-2 max-h-48 overflow-y-auto'>
                            {agent.tools.map(tool => (
                                <div key={tool.id} className='flex items-center gap-2 p-2 rounded-md bg-muted/50'>
                                    <Code className='h-4 w-4 shrink-0' />
                                    <div>
                                        <p className='text-sm font-medium'>{tool.name}</p>
                                        <p className='text-xs text-muted-foreground line-clamp-1'>{tool.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
             )}
          </Accordion>

      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
         <Button asChild variant="outline" size="sm">
            <Link href={`/agents/${agent.id}/edit`}>
              <Edit className="mr-2 h-3 w-3"/>
              <span>Editar</span>
            </Link>
        </Button>
        {(agent.type === 'ROUTER' || agent.type === 'PARENT') && (
           <CreateChildAgentDialog parentAgentId={agent.id} onChildAgentCreated={handleChildAgentCreated}>
             <Button variant="default" size="sm">
                <PlusCircle className="mr-2 h-3 w-3"/>
                <span>Add Filho</span>
              </Button>
           </CreateChildAgentDialog>
        )}
        <Button asChild variant="secondary" size="sm">
            <Link href={`/agents/${agent.id}/tune`}>
              <Wand2 className="mr-2 h-3 w-3"/>
              <span>Afinar</span>
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
