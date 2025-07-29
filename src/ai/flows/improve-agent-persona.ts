
'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving an agent's persona.
 *
 * The flow takes the agent's ID, current persona, and contextual information 
 * (like type, organization, child agents, and tools) to generate suggestions for improvement.
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
  organizationName: z.string().optional().describe('The name of the organization the agent belongs to (for PARENT agents).'),
  childAgentNames: z.array(z.string()).optional().describe('A list of child agent names managed by this agent (for PARENT agents).'),
  toolNames: z.array(z.string()).optional().describe('A list of tool names available to this agent (for CHILD agents).'),
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

O agente que você irá refinar é do tipo: {{{agentType}}}
A persona atual dele é: {{{currentPersona}}}

{{#if organizationName}}
Ele atua no departamento (Organização): {{{organizationName}}}
{{/if}}

{{#if childAgentNames}}
Ele é responsável por gerenciar e delegar tarefas para os seguintes especialistas (Agentes Filhos):
{{#each childAgentNames}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if toolNames}}
Ele tem acesso e pode utilizar as seguintes ferramentas para obter dados da empresa:
{{#each toolNames}}
- {{{this}}}
{{/each}}
{{/if}}

Instruções para cada tipo de agente:
- Se o tipo for "PARENT" (ou "Gerente de Departamento"): A principal função dele é analisar a solicitação do usuário e delegar a tarefa para o agente "FILHO" (especialista) mais apropriado. Ele não executa a tarefa final, mas gerencia e roteia o fluxo. Com base no departamento que ele gerencia e nos especialistas que ele comanda, sugira uma nova persona que reforce sua capacidade de entender, gerenciar e delegar, agindo como um gerente eficiente.
- Se o tipo for "CHILD" (ou "Especialista"): A função dele é executar a tarefa final solicitada. Ele deve priorizar e acessar as ferramentas disponíveis para obter dados da empresa (como produtos, estoque, etc.) e, com base nisso, formular uma resposta completa. Com base nas ferramentas que ele possui, sugira uma nova persona que o posicione como um especialista prestativo e eficaz em sua área, capaz de realizar ações concretas e consultar informações internas.

Com base no tipo de agente, na persona atual e em todo o contexto fornecido (departamento, especialistas, ferramentas), forneça uma persona sugerida e uma justificativa clara e concisa do motivo pelo qual a nova persona é melhor, considerando o seu papel no sistema.`,
});

const improveAgentPersonaFlow = ai.defineFlow(
  {
    name: 'improveAgentPersonaFlow',
    inputSchema: ImproveAgentPersonaInputSchema,
    outputSchema: ImproveAgentPersonaOutputSchema,
  },
  async input => {
    // We prevent ROUTER type from being processed at the UI level,
    // but as a safeguard, we add a check here to prevent calling the LLM.
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
