'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAgentById, updateAgentPersona } from '@/services/api';
import type { Agent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const personaSchema = z.object({
  persona: z.string().min(10, { message: 'A persona deve ter pelo menos 10 caracteres.' }),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

export default function EditAgentPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const { toast } = useToast();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
  });

  useEffect(() => {
    if (agentId) {
      const fetchAgent = async () => {
        try {
          setLoading(true);
          const foundAgent = await getAgentById(agentId);

          if (!foundAgent) {
            throw new Error("Agente não encontrado");
          }

          setAgent(foundAgent);
          form.reset({ persona: foundAgent.persona });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do agente.' });
        } finally {
          setLoading(false);
        }
      };
      fetchAgent();
    }
  }, [agentId, form, toast]);

  const onSubmit = async (data: PersonaFormValues) => {
    setSaving(true);
    try {
      await updateAgentPersona(agentId, data.persona);
      toast({ title: 'Sucesso', description: 'A persona do agente foi atualizada.' });
      router.refresh(); 
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a persona do agente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Editar Persona do Agente</CardTitle>
          <CardDescription>Modifique a personalidade e as instruções do seu agente. Esta é a principal diretriz que ele seguirá.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva a personalidade e o papel do agente..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
