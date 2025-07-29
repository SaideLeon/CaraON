'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving an agent's persona.
 *
 * The flow takes the agent's ID and current persona as input, and returns suggestions on how to improve it.
 * - improveAgentPersona - A function that handles the agent persona improvement process.
 * - ImproveAgentPersonaInput - The input type for the improveAgentPersona function.
 * - ImproveAgentPersonaOutput - The return type for the improveAgentPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveAgentPersonaInputSchema = z.object({
  agentId: z.string().describe('The ID of the agent to improve.'),
  currentPersona: z.string().describe('The current persona of the agent.'),
  agentType: z.enum(['ROUTER', 'PARENT', 'CHILD']).describe('The type of the agent.'),
});
export type ImproveAgentPersonaInput = z.infer<typeof ImproveAgentPersonaInputSchema>;

const ImproveAgentPersonaOutputSchema = z.object({
  suggestedPersona: z.string().describe('The suggested new persona for the agent.'),
  reasoning: z.string().describe('The reasoning behind the suggested persona.'),
});
export type ImproveAgentPersonaOutput = z.infer<typeof ImproveAgentPersonaOutputSchema>;

export async function improveAgentPersona(input: ImproveAgentPersonaInput): Promise<ImproveAgentPersonaOutput> {
  return improveAgentPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveAgentPersonaPrompt',
  input: {schema: ImproveAgentPersonaInputSchema},
  output: {schema: ImproveAgentPersonaOutputSchema},
  prompt: `Você é um especialista em criar personas de agentes de IA eficazes para um sistema hierárquico.
A sua resposta (persona sugerida e justificativa) deve ser sempre em Português do Brasil.

O tipo de agente é: {{{agentType}}}
A persona atual do agente é: {{{currentPersona}}}

{{#if (eq agentType "PARENT")}}
Este é um agente "PAI" (ou "Gerente de Departamento"). Sua principal função é analisar a solicitação do usuário e delegar a tarefa para o agente "FILHO" (especialista) mais apropriado. Ele não executa a tarefa final, mas gerencia e roteia o fluxo.
Sugira uma nova persona que reforce sua capacidade de entender, gerenciar e delegar, agindo como um gerente eficiente.
{{/if}}

{{#if (eq agentType "CHILD")}}
Este é um agente "FILHO" (ou "Especialista"). Sua função é executar a tarefa final solicitada. Ele pode ter acesso a ferramentas (como consultar um banco de dados) para obter informações e formular uma resposta completa.
Sugira uma nova persona que o posicione como um especialista prestativo e eficaz em sua área, capaz de realizar ações concretas.
{{/if}}

Forneça uma persona sugerida e uma justificativa clara e concisa do motivo pelo qual a nova persona é melhor, considerando o seu papel no sistema.`,
});

const improveAgentPersonaFlow = ai.defineFlow(
  {
    name: 'improveAgentPersonaFlow',
    inputSchema: ImproveAgentPersonaInputSchema,
    outputSchema: ImproveAgentPersonaOutputSchema,
  },
  async input => {
    // We prevent ROUTER type from being processed at the UI level,
    // but as a safeguard, we could also add a check here.
    if (input.agentType === 'ROUTER') {
      return {
        suggestedPersona: input.currentPersona,
        reasoning: 'O Agente Roteador é configurado pelo sistema e não pode ser refinado pela IA para garantir a estabilidade do fluxo principal da instância.'
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
