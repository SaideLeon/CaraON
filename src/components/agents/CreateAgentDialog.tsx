
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
import { createAgent, getInstanceOrganizations } from '@/services/api';

const agentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  persona: z.string().min(10, 'A persona deve ter pelo menos 10 caracteres.'),
  organizationId: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface CreateAgentDialogProps {
  children: ReactElement;
  instanceId: string;
  onAgentCreated: (agent: Agent) => void;
}

export function CreateAgentDialog({ children, instanceId, onAgentCreated }: CreateAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      persona: '',
      organizationId: 'none',
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (open && instanceId) {
        setLoadingOrgs(true);
        form.setValue('organizationId', 'none'); // Reset org selection
        setOrganizations([]);
        try {
          const fetchedOrgs = await getInstanceOrganizations(instanceId);
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
  }, [open, instanceId, form, toast]);

  const onSubmit = async (data: AgentFormValues) => {
    setLoading(true);
    try {
      const payload: Partial<Agent> = {
        name: data.name,
        persona: data.persona,
        instanceId: instanceId,
        type: data.organizationId === 'none' ? 'ROUTER' : 'PARENT',
        organizationId: data.organizationId === 'none' ? undefined : data.organizationId,
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
             <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Organização (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={loadingOrgs}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder={loadingOrgs ? "Carregando..." : "Nenhuma"} />
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
