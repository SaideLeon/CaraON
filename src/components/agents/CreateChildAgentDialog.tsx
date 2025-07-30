
'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Agent, Tool } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { getTools, createAgent } from '@/services/api';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';

const childAgentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  persona: z.string().min(10, 'A persona deve ter pelo menos 10 caracteres.'),
  config: z.object({
      flow: z.string().optional(),
  }).optional(),
  toolIds: z.array(z.string()).optional(),
});

type ChildAgentFormValues = z.infer<typeof childAgentSchema>;

interface CreateChildAgentDialogProps {
  children: ReactElement;
  parentAgentId: string;
  onChildAgentCreated: (agent: Agent) => void;
}

export function CreateChildAgentDialog({ children, parentAgentId, onChildAgentCreated }: CreateChildAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  const form = useForm<ChildAgentFormValues>({
    resolver: zodResolver(childAgentSchema),
    defaultValues: {
      name: '',
      persona: '',
      config: {
        flow: ''
      },
      toolIds: [],
    },
  });

  useEffect(() => {
    const fetchTools = async () => {
      if (open) {
        setLoadingTools(true);
        try {
          const fetchedTools = await getTools();
          setTools(fetchedTools);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as ferramentas.',
          });
        } finally {
          setLoadingTools(false);
        }
      }
    };
    fetchTools();
  }, [open, toast]);

  const onSubmit = async (data: ChildAgentFormValues) => {
    setLoading(true);
    try {
      const payload: Partial<Agent> = {
        name: data.name,
        persona: data.persona,
        parentAgentId: parentAgentId,
        type: 'CHILD',
        config: data.config?.flow ? { flow: JSON.parse(data.config.flow) } : {},
        tools: data.toolIds?.map(id => ({ id })) // Send only IDs
      };

      const newAgent = await createAgent(payload);
      
      toast({
        title: 'Agente Filho Criado',
        description: `O agente "${newAgent.name}" foi criado com sucesso.`,
      });
      onChildAgentCreated(newAgent);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
         toast({ variant: 'destructive', title: 'Erro de JSON', description: 'O formato do Flow é inválido.' });
      } else {
        const message = error.response?.data?.message || 'Falha ao criar o agente.';
        toast({ variant: 'destructive', title: 'Erro', description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Novo Agente Filho</DialogTitle>
          <DialogDescription>
            Configure um novo agente especializado para o seu agente pai.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] p-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Agente</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Especialista em Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="persona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva a personalidade e o papel do agente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="config.flow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flow (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Cole o JSON do seu fluxo aqui... ex: {"steps":[]}' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toolIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Ferramentas (Opcional)</FormLabel>
                       <p className="text-sm text-muted-foreground">
                          Selecione as ferramentas que este agente poderá usar.
                        </p>
                    </div>
                    {loadingTools ? <Loader2 className="animate-spin" /> :
                     tools.length > 0 ? (
                        <div className="space-y-2">
                        {tools.map((tool) => (
                            <FormField
                            key={tool.id}
                            control={form.control}
                            name="toolIds"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={tool.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(tool.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), tool.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== tool.id
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel className='font-normal'>
                                            {tool.name}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            {tool.description}
                                        </p>
                                    </div>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                     ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">Nenhuma ferramenta encontrada.</p>
                     )
                    }
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Agente Filho
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
