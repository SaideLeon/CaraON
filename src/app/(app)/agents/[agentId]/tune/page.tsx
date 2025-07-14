'use client';

import { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function TuneAgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [usefulnessScore, setUsefulnessScore] = useState(78); // Example score

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    // Simulate AI suggestion fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuggestion('Para aumentar o engajamento, tente adotar um tom mais proativo. Em vez de apenas responder, sugira próximos passos ou produtos relacionados. Por exemplo: "Posso te ajudar com mais alguma coisa ou talvez queira ver nossas promoções da semana?"');
    setIsLoading(false);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Afinar Persona com IA</CardTitle>
        <CardDescription>
          Use a nossa IA para obter sugestões sobre como melhorar a persona do seu agente com base nas interações e no desempenho.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Pontuação de Utilidade</h3>
            <Badge variant={usefulnessScore > 80 ? 'default' : 'secondary'} className={usefulnessScore > 80 ? 'bg-green-500' : ''}>
                {usefulnessScore}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Esta pontuação reflete o quão útil o seu agente foi nas conversas recentes.
          </p>
          <Progress value={usefulnessScore} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Sugestão da IA</h3>
           <Button onClick={handleGetSuggestion} disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Obter Sugestão
          </Button>
          {isLoading && <p className="text-sm text-muted-foreground animate-pulse">A IA está analisando as interações...</p>}
          {suggestion && (
            <div className="p-4 border rounded-md bg-accent/20">
                <p className="text-sm text-accent-foreground flex gap-2">
                    <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                </p>
            </div>
          )}
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
          <Button disabled>Aplicar Sugestão</Button>
       </CardFooter>
    </>
  );
}
