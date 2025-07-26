
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
import type { Agent, Instance, Organization } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createParentAgent, getUserInstances, getInstanceOrganizations } from '@/services/api';

const agentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  persona: z.string().min(10, 'A persona deve ter pelo menos 10 caracteres.'),
  instanceId: z.string({ required_error: 'Por favor, selecione uma instância.' }),
  organizationId: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface CreateAgentDialogProps {
  children: ReactElement;
  onAgentCreated: (agent: Agent) => void;
}

export function CreateAgentDialog({ children, onAgentCreated }: CreateAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      persona: '',
    },
  });

  const selectedInstanceId = form.watch('instanceId');

  useEffect(() => {
    const fetchInstances = async () => {
      if (open) {
        setLoadingInstances(true);
        try {
          const fetchedInstances = await getUserInstances();
          setInstances(fetchedInstances);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as suas instâncias.',
          });
        } finally {
          setLoadingInstances(false);
        }
      }
    };
    fetchInstances();
  }, [open, toast]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (selectedInstanceId) {
        setLoadingOrgs(true);
        form.setValue('organizationId', undefined); // Reset org selection
        setOrganizations([]);
        try {
          const fetchedOrgs = await getInstanceOrganizations(selectedInstanceId);
          setOrganizations(fetchedOrgs);
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as organizações para esta instância.',
          });
        } finally {
          setLoadingOrgs(false);
        }
      }
    }
    fetchOrganizations();
  }, [selectedInstanceId, form, toast]);

  const onSubmit = async (data: AgentFormValues) => {
    setLoading(true);
    try {
      const orgId = data.organizationId === 'none' ? undefined : data.organizationId;
      const newAgent = await createParentAgent(data.instanceId, orgId, { name: data.name, persona: data.persona });
      
      toast({
        title: 'Agente Pai Criado',
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
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a personalidade e o papel do agente orquestrador..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="instanceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instância</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingInstances}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingInstances ? 'Carregando...' : 'Selecione'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instances.map((instance) => (
                            <SelectItem key={instance.id} value={instance.id}>
                              {instance.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                       <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={!selectedInstanceId || loadingOrgs}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                                !selectedInstanceId ? "Primeiro a instância" :
                                loadingOrgs ? "Carregando..." : "Nenhuma"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="none">Nenhuma</SelectItem>
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
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Agente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
