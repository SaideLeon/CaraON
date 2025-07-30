
'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving an agent's persona prompt.
 *
 * The flow takes the agent's ID, current persona, and contextual information
 * (like type, organization, child agents, and tools) to generate suggestions for a complete,
 * structured prompt for orchestration, following best practices.
 * - improveAgentPersona - A function that handles the agent persona improvement process.
 * - ImproveAgentPersonaInput - The input type for the improveAgentPersona function.
 * - ImproveAgentPersonaOutput - The return type for the improveAgentPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveAgentPersonaInputSchema = z.object({
  agentId: z.string().describe('The ID of the agent to improve.'),
  currentPersona: z.string().describe('The current persona/prompt of the agent.'),
  agentType: z.enum(['ROUTER', 'PARENT', 'CHILD']).describe('The type of the agent.'),
  organizationName: z.string().optional().describe('The name of the organization the agent belongs to (for PARENT agents).'),
  childAgentNames: z.array(z.string()).optional().describe('A list of child agent names managed by this agent (for PARENT agents).'),
  toolNames: z.array(z.string()).optional().describe('A list of tool names available to this agent (for CHILD agents).'),
});
export type ImproveAgentPersonaInput = z.infer<typeof ImproveAgentPersonaInputSchema>;

const ImproveAgentPersonaOutputSchema = z.object({
  suggestedPrompt: z.string().describe('The suggested new and complete structured prompt for the agent.'),
  reasoning: z.string().describe('The reasoning behind the suggested prompt.'),
});
export type ImproveAgentPersonaOutput = z.infer<typeof ImproveAgentPersonaOutputSchema>;

export async function improveAgentPersona(input: ImproveAgentPersonaInput): Promise<ImproveAgentPersonaOutput> {
  return improveAgentPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveAgentPersonaPrompt',
  input: {schema: ImproveAgentPersonaInputSchema},
  output: {schema: ImproveAgentPersonaOutputSchema},
  prompt: `Você é um especialista em engenharia de prompts para agentes de IA de um sistema de orquestração hierárquico chamado CaraON.
A sua resposta (prompt sugerido e justificativa) deve ser sempre em Português do Brasil.

Sua tarefa é criar um prompt completo e estruturado para um agente, seguindo as melhores práticas. O prompt deve ser claro, definir um papel, apresentar opções e exigir uma saída JSON estruturada.

O agente que você irá refinar é do tipo: {{{agentType}}}
A persona/prompt atual dele é: {{{currentPersona}}}

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

Instruções para a criação do prompt sugerido:

- Se o tipo for "PARENT" (ou "Gerente de Departamento"):
  O prompt que você criar deve instruir o agente a agir como um roteador que analisa a mensagem do cliente e a delega para o Agente Filho (especialista) mais apropriado.
  O prompt deve:
  1. Definir a persona como um gerente eficiente do departamento '{{{organizationName}}}'.
  2. Listar os agentes filhos disponíveis (usando um placeholder como '{{#each availableAgents}}') e suas especialidades.
  3. Exigir uma saída JSON com os campos "agentId" e "justificativa".
  4. Incluir uma lógica de fallback (retornar null) se nenhum agente for adequado.

- Se o tipo for "CHILD" (ou "Especialista"):
  O prompt que você criar deve instruir o agente a executar uma tarefa final. Ele deve decidir entre usar uma de suas ferramentas para obter informações ou responder diretamente ao cliente.
  O prompt deve:
  1. Definir a persona como um especialista prestativo e eficaz.
  2. Listar as ferramentas disponíveis (usando um placeholder como '{{#each availableTools}}') com nome e descrição.
  3. Exigir uma saída JSON com os campos "action" (com os valores "TOOL_CALL" ou "REPLY"), "toolName", "parameters" e "replyText".
  4. A lógica de decisão deve ser baseada na mensagem do cliente e no histórico da conversa.

Com base no tipo de agente e no contexto fornecido, gere um 'suggestedPrompt' completo e bem estruturado e uma 'reasoning' clara do motivo pelo qual o novo prompt é melhor.`,
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
        suggestedPrompt: input.currentPersona,
        reasoning: 'O Agente Roteador é configurado pelo sistema e não pode ser refinado pela IA para garantir a estabilidade do fluxo principal da instância.'
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
