
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Wand2, Loader2, Sparkles, Save, ShieldAlert, FileCode, Bot } from 'lucide-react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { improveAgentPersona, type ImproveAgentPersonaOutput } from '@/ai/flows/improve-agent-persona';
import { getAgentById, updateAgent } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Agent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TuneAgentPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const { toast } = useToast();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<ImproveAgentPersonaOutput | null>(null);
  const [usefulnessScore, setUsefulnessScore] = useState(78); // Example score, can be replaced with real data later

  useEffect(() => {
    if (agentId) {
      const fetchAgentData = async () => {
        try {
          setLoading(true);
          const foundAgent = await getAgentById(agentId);
          setAgent(foundAgent);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do agente.' });
        } finally {
          setLoading(false);
        }
      };
      fetchAgentData();
    }
  }, [agentId, toast]);

  const handleGetSuggestion = async () => {
    if (!agent || agent.type === 'ROUTER') return;

    setIsSuggesting(true);
    setSuggestion(null);

    try {
      const result = await improveAgentPersona({
        agentId: agent.id,
        currentPersona: agent.persona || '',
        currentSystemPrompt: agent.config?.systemPrompt || '',
        agentType: agent.type,
        organizationName: agent.organization?.name,
        childAgentNames: agent.childAgents?.map(child => child.name),
        toolNames: agent.tools?.map(tool => tool.name),
      });
      setSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro da IA', description: 'Não foi possível gerar uma sugestão.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestion = async () => {
    if (!suggestion || !agent) return;

    setIsSaving(true);
    try {
      const updatedAgent = await updateAgent(agent.id, { 
        persona: suggestion.suggestedPersonaTemplate,
        config: {
          ...agent.config,
          systemPrompt: suggestion.suggestedSystemPrompt,
        }
      });
      toast({ title: 'Sucesso!', description: 'Os prompts do agente foram atualizados com a sugestão da IA.' });
      
      setAgent(updatedAgent);
      
      router.push(`/agents/${agent.id}/edit`);
      router.refresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível aplicar a sugestão.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
        <>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </>
    )
  }

  const isRouterAgent = agent?.type === 'ROUTER';

  return (
    <>
      <CardHeader>
        <CardTitle>Afinar Prompt com IA</CardTitle>
        <CardDescription>
          Use nossa IA para sugerir um <span className="font-bold text-foreground">System Prompt</span> e um <span className="font-bold text-foreground">Template de Persona</span> para o agente {agent?.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Pontuação de Utilidade (Exemplo)</h3>
            <Badge variant={usefulnessScore > 80 ? 'default' : 'secondary'} className={usefulnessScore > 80 ? 'bg-green-500' : ''}>
                {usefulnessScore}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Esta pontuação reflete o quão útil o seu agente foi nas conversas recentes.
          </p>
          <Progress value={usefulnessScore} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sugestão da IA</h3>
          {isRouterAgent ? (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Refinamento não disponível</AlertTitle>
                <AlertDescription>
                   O Agente Roteador é configurado pelo sistema e a sua persona não pode ser modificada para garantir a estabilidade do fluxo principal da instância.
                </AlertDescription>
            </Alert>
          ) : (
             <Button onClick={handleGetSuggestion} disabled={isSuggesting}>
                {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Wand2 className="mr-2 h-4 w-4" />
                )}
                {suggestion ? 'Gerar Outra Sugestão' : 'Obter Sugestão'}
            </Button>
          )}

          {isSuggesting && <p className="text-sm text-muted-foreground animate-pulse">A IA está analisando o agente e gerando novos prompts...</p>}
          
          {suggestion && (
            <div className="space-y-6 pt-4">
                <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><Bot className="h-4 w-4 text-accent shrink-0" /> System Prompt Sugerido</h4>
                    <p className="text-xs text-muted-foreground">Define o papel, objetivo e formato de saída do agente. É mais estático.</p>
                    <Textarea 
                        readOnly 
                        value={suggestion.suggestedSystemPrompt}
                        className="bg-background/50 h-48 font-mono text-xs"
                    />
                </div>
                 <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><FileCode className="h-4 w-4 text-accent shrink-0" /> Template de Persona Sugerido</h4>
                    <p className="text-xs text-muted-foreground">Template Handlebars com os placeholders para o contexto dinâmico da conversa.</p>
                    <Textarea 
                        readOnly 
                        value={suggestion.suggestedPersonaTemplate}
                        className="bg-background/50 h-48 font-mono text-xs"
                    />
                </div>
                 <div className="p-4 border rounded-md bg-accent/20 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent shrink-0" /> Justificativa da IA</h4>
                    <p className="text-sm text-foreground">
                        {suggestion.reasoning}
                    </p>
                </div>
            </div>
          )}
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
          <Button onClick={handleApplySuggestion} disabled={!suggestion || isSaving || isSuggesting || isRouterAgent}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Aplicar Sugestão
          </Button>
       </CardFooter>
    </>
  );
}
