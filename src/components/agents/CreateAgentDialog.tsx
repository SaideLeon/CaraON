
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Agent, Organization } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createAgent, getInstanceOrganizations, getInstanceParentAgents } from '@/services/api';

const agentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  persona: z.string().min(10, 'A persona deve ter pelo menos 10 caracteres.'),
  organizationId: z.string().optional(),
  systemPrompt: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface CreateAgentDialogProps {
  children: ReactElement;
  instanceId: string;
  onAgentCreated: (agent: Agent) => void;
  onRequestCreateOrg: () => void;
}

export function CreateAgentDialog({ children, instanceId, onAgentCreated, onRequestCreateOrg }: CreateAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [parentAgents, setParentAgents] = useState<Agent[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      persona: '',
      organizationId: 'none',
      systemPrompt: '',
    },
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      if (open && instanceId) {
        setLoadingDeps(true);
        form.setValue('organizationId', 'none');
        setOrganizations([]);
        setParentAgents([]);
        try {
          const [fetchedOrgs, fetchedAgents] = await Promise.all([
            getInstanceOrganizations(instanceId),
            getInstanceParentAgents(instanceId)
          ]);
          setOrganizations(fetchedOrgs);
          setParentAgents(fetchedAgents);
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as dependências.',
          });
        } finally {
          setLoadingDeps(false);
        }
      }
    }
    fetchDependencies();
  }, [open, instanceId, form, toast]);

  const onSubmit = async (data: AgentFormValues) => {
    setLoading(true);
    try {
      const isCreatingRouter = data.organizationId === 'none';
      const routerExists = parentAgents.some(agent => agent.type === 'ROUTER');
      const hasNoOrganizations = organizations.length === 0;

      if (isCreatingRouter && routerExists) {
        if (hasNoOrganizations) {
            toast({
                title: 'Ação Necessária',
                description: 'Crie uma organização primeiro para associar novos agentes.',
            });
            setOpen(false); // Close this dialog
            onRequestCreateOrg(); // Request parent to open the other dialog
            return; 
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Esta instância já possui um Agente Roteador. Um agente pai deve ser associado a uma organização.',
            });
            return;
        }
      }

      const payload: Partial<Agent> & { config?: { systemPrompt?: string } } = {
        name: data.name,
        persona: data.persona,
        instanceId: instanceId,
        type: isCreatingRouter ? 'ROUTER' : 'PARENT',
        organizationId: isCreatingRouter ? undefined : data.organizationId,
        config: {
            systemPrompt: data.systemPrompt
        }
      };

      const newAgent = await createAgent(payload);
      
      toast({
        title: `Agente ${payload.type} Criado`,
        description: `O agente "${newAgent.name}" foi criado com sucesso.`,
      });
      onAgentCreated(newAgent);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar o agente.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Novo Agente Pai</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para configurar o seu novo agente orquestrador.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Agente</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Regente de Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Defina o papel, objetivo e formato de saída do agente..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
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
                  <FormLabel>Template de Persona (Handlebars)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o template da persona com placeholders como {{messageContent}}..."
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Organização (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={loadingDeps}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder={loadingDeps ? "Carregando..." : "Nenhuma"} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="none">Nenhuma (Será um Roteador)</SelectItem>
                        {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                            {org.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading || loadingDeps}>
                {(loading || loadingDeps) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Agente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
