
'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { AgentHierarchy, AgentDefinition, Instance } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Bot, GripVertical, Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateAgentHierarchy } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const toolSchema = z.object({
  type: z.string().min(1, 'O tipo da ferramenta é obrigatório.'),
  config: z.any().optional(),
});

const agentDefinitionSchema = z.object({
  agent_id: z.string().optional(),
  name: z.string().min(3, 'O nome do agente deve ter pelo menos 3 caracteres.'),
  role: z.string().min(10, 'O papel deve ter pelo menos 10 caracteres.'),
  model_provider: z.string().default('GEMINI'),
  model_id: z.string().min(1, 'O ID do modelo é obrigatório.').default('gemini-1.5-flash'),
  tools: z.array(toolSchema),
});

const hierarchySchema = z.object({
  instance_id: z.string(),
  router_instructions: z.string().min(10, 'As instruções do roteador são obrigatórias.'),
  agents: z.array(agentDefinitionSchema),
});

type HierarchyFormValues = z.infer<typeof hierarchySchema>;

interface HierarchyEditorProps {
  hierarchy: AgentHierarchy;
  instance: Instance;
  onHierarchyUpdated: () => void;
}

const availableTools = [
    { type: 'DUCKDUCKGO', label: 'DuckDuckGo Search', config: null },
    { type: 'YFINANCE', label: 'Yahoo Finance', config: { stock_price: true, company_news: true } },
    { type: 'PUBMED', label: 'PubMed Search', config: null },
    { type: 'TAVILY', label: 'Tavily Advanced Search', config: null },
    { type: 'WIKIPEDIA', label: 'Wikipedia Search', config: null },
    { type: 'ARXIV', label: 'ArXiv Academic Search', config: null },
    { type: 'GMAIL', label: 'Gmail Assistant', config: null },
    { 
        type: 'EMAIL', 
        label: 'Email Assistant', 
        config: {
            receiver_email: "seu_email@exemplo.com",
            sender_email: "seu_email@exemplo.com",
            sender_name: "Seu Nome",
            sender_passkey: "sua_senha_de_app"
        } 
    },
    { 
        type: 'PDF_KNOWLEDGE', 
        label: 'PDF Knowledge Analyzer', 
        config: {
            path: "data/pdfs",
            table_name: "pdf_documents"
        }
    }
];


export function HierarchyEditor({ hierarchy, instance, onHierarchyUpdated }: HierarchyEditorProps) {
  const { toast } = useToast();
  
  const form = useForm<HierarchyFormValues>({
    resolver: zodResolver(hierarchySchema),
    defaultValues: {
      instance_id: hierarchy.instance_id,
      router_instructions: hierarchy.router_instructions || '',
      agents: hierarchy.agents || [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'agents',
  });

  const onSubmit = async (data: HierarchyFormValues) => {
    try {
      await updateAgentHierarchy(data);
      toast({ title: 'Sucesso', description: 'Hierarquia de agentes atualizada.' });
      onHierarchyUpdated();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a hierarquia.' });
    }
  };

  const addAgent = () => {
    append({
        name: `Novo Agente ${fields.length + 1}`,
        role: 'Descreva o papel e a especialidade deste agente.',
        model_provider: 'GEMINI',
        model_id: 'gemini-1.5-flash',
        tools: [],
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Editor de Hierarquia</CardTitle>
            <CardDescription>
              Defina as instruções do roteador principal e configure os agentes especialistas para a instância <span className='font-bold'>{instance.name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="router_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções do Roteador</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Você é um roteador inteligente..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Agentes Especialistas</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                    <AgentCard
                        key={field.id}
                        index={index}
                        control={form.control}
                        remove={remove}
                    />
                ))}
              </div>
               <Button type="button" variant="outline" onClick={addAgent} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Agente
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Hierarquia
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


// --- AgentCard Sub-component ---
interface AgentCardProps {
    index: number;
    control: any;
    remove: (index: number) => void;
}

function AgentCard({ index, control, remove }: AgentCardProps) {

    const { fields: toolFields, append: appendTool, remove: removeTool } = useFieldArray({
        control,
        name: `agents.${index}.tools`
    });

    const addTool = (toolType: string) => {
        const toolToAdd = availableTools.find(t => t.type === toolType);
        if (toolToAdd) {
            appendTool({ type: toolToAdd.type, config: toolToAdd.config });
        }
    }

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30 relative">
             <div className="flex items-center gap-2 mb-2">
                <Bot className="h-6 w-6 text-primary" />
                <h4 className="font-semibold text-lg">Agente {index + 1}</h4>
             </div>
             
             <FormField
                control={control}
                name={`agents.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Analista Financeiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`agents.${index}.role`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel (Role)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva a função e especialidade..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name={`agents.${index}.model_provider`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provedor do Modelo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um provedor" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="GEMINI">Gemini (Google)</SelectItem>
                                    <SelectItem value="OPENAI">OpenAI</SelectItem>
                                    <SelectItem value="CLAUDE">Claude (Anthropic)</SelectItem>
                                    <SelectItem value="GROQ">Groq</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name={`agents.${index}.model_id`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID do Modelo</FormLabel>
                            <FormControl>
                                <Input placeholder="ex: gemini-1.5-flash" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className='space-y-2'>
                <FormLabel>Ferramentas</FormLabel>
                {toolFields.length > 0 && (
                     <div className='space-y-2'>
                        {toolFields.map((toolField, toolIndex) => (
                             <div key={toolField.id} className="flex items-center gap-2 p-2 bg-background/50 rounded-md border">
                                <p className='flex-1 font-mono text-xs'>{`{ type: '${(toolField as any).type}' }`}</p>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTool(toolIndex)}>
                                    <Trash2 className='h-3 w-3 text-destructive' />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
               
                <Select onValueChange={addTool}>
                    <SelectTrigger>
                        <SelectValue placeholder="Adicionar uma ferramenta" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTools.map(tool => (
                             <SelectItem key={tool.type} value={tool.type} disabled={toolFields.some(t => (t as any).type === tool.type)}>
                                {tool.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


             <Button type="button" variant="destructive" size="sm" className="absolute top-4 right-4" onClick={() => remove(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Agente
             </Button>
        </div>
    )
}
