
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
import { createAgent, getInstanceOrganizations, getAgentById } from '@/services/api';
import { ScrollArea } from '../ui/scroll-area';

const parentAgentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  persona: z.string().min(10, 'A persona deve ter pelo menos 10 caracteres.'),
  organizationId: z.string({ required_error: "Selecione uma organização." }),
});

type ParentAgentFormValues = z.infer<typeof parentAgentSchema>;

interface CreateParentAgentDialogProps {
  children: ReactElement;
  routerAgentId: string;
  onParentAgentCreated: (agent: Agent) => void;
}

export function CreateParentAgentDialog({ children, routerAgentId, onParentAgentCreated }: CreateParentAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [routerAgent, setRouterAgent] = useState<Agent | null>(null);

  const form = useForm<ParentAgentFormValues>({
    resolver: zodResolver(parentAgentSchema),
    defaultValues: {
      name: '',
      persona: '',
      organizationId: undefined,
    },
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      if (open && routerAgentId) {
        setLoadingDeps(true);
        try {
          const fetchedRouterAgent = await getAgentById(routerAgentId);
          setRouterAgent(fetchedRouterAgent);
          const fetchedOrgs = await getInstanceOrganizations(fetchedRouterAgent.instanceId);
          setOrganizations(fetchedOrgs);
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
  }, [open, routerAgentId, toast]);

  const onSubmit = async (data: ParentAgentFormValues) => {
    if (!routerAgent) return;
    setLoading(true);
    try {
      const payload: Partial<Agent> = {
        name: data.name,
        persona: data.persona,
        instanceId: routerAgent.instanceId,
        type: 'PARENT',
        organizationId: data.organizationId,
        routerAgentId: routerAgent.id,
      };

      const newAgent = await createAgent(payload);
      
      toast({
        title: `Agente Pai Criado`,
        description: `O agente "${newAgent.name}" foi criado com sucesso.`,
      });
      onParentAgentCreated(newAgent);
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
          <DialogTitle className="font-headline">Adicionar Agente Pai</DialogTitle>
          <DialogDescription>
            Crie um novo agente de departamento (Pai) que será orquestrado pelo roteador <span className="font-bold">{routerAgent?.name}</span>.
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
                      <Input placeholder="ex: Gerente de Vendas" {...field} />
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
                      <Textarea placeholder="Descreva a personalidade e o papel deste gerente de departamento..." {...field} />
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
                      <FormLabel>Organização</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loadingDeps}>
                      <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder={loadingDeps ? "Carregando..." : "Selecione uma organização"} />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {organizations.length === 0 && !loadingDeps ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma organização encontrada.</div>
                          ) : (
                              organizations.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                      {org.name}
                                  </SelectItem>
                              ))
                          )}
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loading || loadingDeps}>
                  {(loading || loadingDeps) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Agente Pai
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
