'use client';

import { useState, type ReactNode } from 'react';
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
import type { Tool } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createTool } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

const configSchema = z.object({
  connectionString: z.string().optional(),
  collection: z.string().min(1, 'Collection is required for DATABASE type.'),
  query: z.string().min(1, 'Query is required for DATABASE type.'),
});

const toolSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  type: z.enum(['DATABASE'], { required_error: 'Please select a tool type.' }),
  config: configSchema,
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface CreateToolDialogProps {
  children: ReactNode;
  onToolCreated: (tool: Tool) => void;
}

export function CreateToolDialog({ children, onToolCreated }: CreateToolDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'DATABASE',
      config: {
        connectionString: '',
        collection: '',
        query: ''
      }
    },
  });

  const onSubmit = async (data: ToolFormValues) => {
    setLoading(true);
    try {
      const newTool = await createTool(data);
      
      toast({
        title: 'Ferramenta Criada',
        description: `A ferramenta "${newTool.name}" foi criada com sucesso.`,
      });
      onToolCreated(newTool);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar a ferramenta.';
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
          <DialogTitle className="font-headline">Criar Nova Ferramenta</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para configurar a sua nova ferramenta.
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
                    <FormLabel>Nome da Ferramenta</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Consultar Estoque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o que esta ferramenta faz..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Ferramenta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DATABASE">DATABASE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">Configuração do Banco de Dados</h4>
                    <FormField
                      control={form.control}
                      name="config.connectionString"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Connection String (Opcional)</FormLabel>
                          <FormControl>
                              <Input placeholder="Deixe em branco para usar a padrão" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                  <FormField
                      control={form.control}
                      name="config.collection"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Collection</FormLabel>
                          <FormControl>
                              <Input placeholder="ex: products" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                  <FormField
                      control={form.control}
                      name="config.query"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Query</FormLabel>
                          <FormControl>
                              <Textarea placeholder='ex: {"name": "{product_name}"}' {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
              </div>


              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Ferramenta
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
