
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Instance, Organization } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import api from '@/services/api';

const organizationSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  instanceId: z.string({ required_error: 'Por favor, selecione uma instância.' }),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface CreateOrganizationDialogProps {
  children: ReactElement;
  onOrganizationCreated: (organization: Organization) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrganizationDialog({ children, onOrganizationCreated, open, onOpenChange }: CreateOrganizationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
    },
  });

  const dialogOpen = open ?? isDialogOpen;
  const setDialogOpen = onOpenChange ?? setIsDialogOpen;

  useEffect(() => {
    const fetchInstances = async () => {
      if (dialogOpen) {
        setLoadingInstances(true);
        try {
          const response = await api.get('/user/instances');
          setInstances(response.data);
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
  }, [dialogOpen, toast]);

  const onSubmit = async (data: OrganizationFormValues) => {
    setLoading(true);
    try {
      const response = await api.post(`/instances/${data.instanceId}/organizations`, { name: data.name, instanceId: data.instanceId });
      const newOrganization: Organization = response.data;
      
      toast({
        title: 'Organização Criada',
        description: `A organização "${newOrganization.name}" foi criada com sucesso.`,
      });
      onOrganizationCreated(newOrganization);
      setDialogOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar a organização.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Nova Organização</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar uma nova organização.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Organização</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Departamento de Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="instanceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instância</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingInstances}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingInstances ? 'Carregando...' : 'Selecione uma instância'} />
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
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Organização
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
