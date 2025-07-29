
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Wand2, Loader2, Sparkles, Save, ShieldAlert } from 'lucide-react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { improveAgentPersona, type ImproveAgentPersonaOutput } from '@/ai/flows/improve-agent-persona';
import { getAgentById, updateAgent, getInstanceOrganizations } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Agent, Organization } from '@/lib/types';
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
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados necessários.' });
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

    let organizationName;
    if (agent.organizationId && agent.instanceId) {
        try {
            const orgs = await getInstanceOrganizations(agent.instanceId);
            organizationName = orgs.find(org => org.id === agent.organizationId)?.name;
        } catch (e) {
            console.error("Could not fetch organization name", e);
        }
    }


    try {
      const result = await improveAgentPersona({
        agentId: agent.id,
        currentPersona: agent.persona,
        agentType: agent.type,
        organizationName: agent.type === 'PARENT' ? organizationName : undefined,
        childAgentNames: agent.type === 'PARENT' ? agent.childAgents?.map(child => child.name) : undefined,
        toolNames: agent.type === 'CHILD' ? agent.tools?.map(tool => tool.name) : undefined,
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
      await updateAgent(agent.id, { persona: suggestion.suggestedPersona });
      toast({ title: 'Sucesso!', description: 'A persona do agente foi atualizada com a sugestão da IA.' });
      router.push(`/agents/${agent.id}/edit`); // Navigate to edit page to see the change
      router.refresh(); // Refresh server components
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
        <CardTitle>Afinar Persona com IA</CardTitle>
        <CardDescription>
          Use a nossa IA para obter sugestões sobre como melhorar a persona do agente <span className="font-bold text-foreground">{agent?.name}</span> com base no desempenho e nas interações.
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

          {isSuggesting && <p className="text-sm text-muted-foreground animate-pulse">A IA está analisando as interações...</p>}
          
          {suggestion && (
            <div className="space-y-4 pt-4">
                <div className="p-4 border rounded-md bg-accent/20 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent shrink-0" /> Nova Persona Sugerida</h4>
                    <Textarea 
                        readOnly 
                        value={suggestion.suggestedPersona}
                        className="bg-background/50 h-32"
                    />
                </div>
                 <div className="p-4 border rounded-md bg-accent/20 space-y-2">
                    <h4 className="font-semibold">Justificativa</h4>
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
