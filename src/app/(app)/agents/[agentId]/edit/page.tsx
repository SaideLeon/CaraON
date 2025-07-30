
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateAgent, getAgentById, getUserParentAgents } from '@/services/api';
import type { Agent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';

const agentUpdateSchema = z.object({
  persona: z.string().min(10, { message: 'O template de persona deve ter pelo menos 10 caracteres.' }),
  priority: z.coerce.number().int().min(0, 'A prioridade deve ser um número positivo.'),
  routerAgentId: z.string().optional().nullable(),
  config: z.object({
    model: z.string().optional(),
    temperature: z.coerce.number().min(0).max(1).optional(),
    maxTokens: z.coerce.number().int().positive().optional(),
    systemPrompt: z.string().optional(),
    fallbackMessage: z.string().optional(),
    timeoutSeconds: z.coerce.number().int().positive().optional(),
    maxRetries: z.coerce.number().int().min(0).optional(),
  })
});

type AgentUpdateFormValues = z.infer<typeof agentUpdateSchema>;

export default function EditAgentPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const { toast } = useToast();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [parentAgents, setParentAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<AgentUpdateFormValues>({
    resolver: zodResolver(agentUpdateSchema),
    defaultValues: {
      config: {
        temperature: 0.7,
      }
    }
  });

  useEffect(() => {
    if (agentId) {
      const fetchAgentData = async () => {
        try {
          setLoading(true);
          const [foundAgent, allParentAgents] = await Promise.all([
            getAgentById(agentId),
            getUserParentAgents()
          ]);

          if (!foundAgent) {
            throw new Error("Agente não encontrado");
          }

          setAgent(foundAgent);
          setParentAgents(allParentAgents.filter(p => p.id !== agentId));

          form.reset({ 
            persona: foundAgent.persona || '',
            priority: foundAgent.priority || 0,
            routerAgentId: foundAgent.routerAgentId || 'none',
            config: {
              model: foundAgent.config?.model || 'googleai/gemini-2.0-flash',
              temperature: foundAgent.config?.temperature || 0.7,
              maxTokens: foundAgent.config?.maxTokens || 1000,
              systemPrompt: foundAgent.config?.systemPrompt || '',
              fallbackMessage: foundAgent.config?.fallbackMessage || '',
              timeoutSeconds: foundAgent.config?.timeoutSeconds || 30,
              maxRetries: foundAgent.config?.maxRetries || 3,
            }
          });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do agente.' });
        } finally {
          setLoading(false);
        }
      };
      fetchAgentData();
    }
  }, [agentId, form, toast]);

  const onSubmit = async (data: AgentUpdateFormValues) => {
    setSaving(true);
    try {
      const payload = {
        persona: data.persona,
        priority: data.priority,
        routerAgentId: data.routerAgentId === 'none' ? null : data.routerAgentId,
        config: {
          model: data.config.model,
          temperature: data.config.temperature,
          maxTokens: data.config.maxTokens,
          systemPrompt: data.config.systemPrompt,
          fallbackMessage: data.config.fallbackMessage,
          timeoutSeconds: data.config.timeoutSeconds,
          maxRetries: data.config.maxRetries,
        }
      };
      await updateAgent(agentId, payload);
      toast({ title: 'Sucesso', description: 'O agente foi atualizado.' });
      router.refresh(); 
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o agente.' });
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
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/2" />
                </div>
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
          <CardTitle>Editar Agente</CardTitle>
          <CardDescription>Modifique os prompts, prioridade e outras instruções do seu agente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="config.systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Defina o papel, objetivo e formato de saída do agente..."
                    className="min-h-[120px] font-mono text-xs"
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
                    className="min-h-[200px] font-mono text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-settings">
            <AccordionTrigger>
              <div className='flex items-center gap-2'>
                <BrainCircuit className='h-4 w-4' />
                Configurações Avançadas
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="config.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de IA</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="googleai/gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                        {/* Adicionar outros modelos aqui no futuro */}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O modelo de linguagem que o agente irá usar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura: {field.value}</FormLabel>
                     <FormControl>
                      <Slider
                        defaultValue={[field.value || 0.7]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={1}
                        step={0.1}
                      />
                    </FormControl>
                     <FormDescription>
                       Controla a aleatoriedade da resposta. Valores mais altos (e.g., 1.0) são mais criativos, valores mais baixos (e.g., 0.1) são mais determinísticos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="config.maxTokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tokens</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.timeoutSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (segundos)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.maxRetries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tentativas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="config.fallbackMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem de Fallback</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Peço desculpas, mas não consegui processar sua solicitação..." {...field} />
                      </FormControl>
                      <FormDescription>
                        A mensagem a ser enviada se o agente falhar após todas as tentativas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {agent?.type === 'PARENT' && (
            <FormField
              control={form.control}
              name="routerAgentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agente Roteador (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um agente para rotear"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {parentAgents.map((pAgent) => (
                        <SelectItem key={pAgent.id} value={pAgent.id}>
                          {pAgent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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

    