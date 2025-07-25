
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
import type { Brand } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createBrand } from '@/services/api';
import { ScrollArea } from '../ui/scroll-area';

const brandSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  slug: z.string().min(2, 'O slug deve ter pelo menos 2 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface CreateBrandDialogProps {
  children: ReactNode;
  onBrandCreated: (brand: Brand) => void;
}

export function CreateBrandDialog({ children, onBrandCreated }: CreateBrandDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const onSubmit = async (data: BrandFormValues) => {
    setLoading(true);
    try {
      const newBrand = await createBrand(data);
      
      toast({
        title: 'Marca Criada',
        description: `A marca "${newBrand.name}" foi criada com sucesso.`,
      });
      onBrandCreated(newBrand);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar a marca.';
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
          <DialogTitle className="font-headline">Criar Nova Marca</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para configurar a sua nova marca de produtos.
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
                    <FormLabel>Nome da Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Apple" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: apple" {...field} />
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
                      <Textarea placeholder="Descreva a marca..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Marca
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
