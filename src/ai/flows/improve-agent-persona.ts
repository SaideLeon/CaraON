
'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving an agent's persona and system prompt.
 *
 * The flow takes the agent's ID, current persona, and contextual information
 * to generate suggestions for a complete, structured system prompt and a dynamic persona template,
 * following orchestration best practices.
 * - improveAgentPersona - A function that handles the agent persona improvement process.
 * - ImproveAgentPersonaInput - The input type for the improveAgentPersona function.
 * - ImproveAgentPersonaOutput - The return type for the improveAgentPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveAgentPersonaInputSchema = z.object({
  agentId: z.string().describe('The ID of the agent to improve.'),
  currentPersona: z.string().describe('The current persona/prompt template of the agent.'),
  currentSystemPrompt: z.string().optional().describe('The current system prompt of the agent.'),
  agentType: z.enum(['ROUTER', 'PARENT', 'CHILD']).describe('The type of the agent.'),
  organizationName: z.string().optional().describe('The name of the organization the agent belongs to (for PARENT agents).'),
  childAgentNames: z.array(z.string()).optional().describe('A list of child agent names managed by this agent (for PARENT agents).'),
  toolNames: z.array(z.string()).optional().describe('A list of tool names available to this agent (for CHILD agents).'),
});
export type ImproveAgentPersonaInput = z.infer<typeof ImproveAgentPersonaInputSchema>;

const ImproveAgentPersonaOutputSchema = z.object({
  suggestedSystemPrompt: z.string().describe("The suggested new static system prompt that defines the agent's role, objective, and strict output format."),
  suggestedPersonaTemplate: z.string().describe("The suggested new dynamic persona Handlebars template containing placeholders for context."),
  reasoning: z.string().describe('The reasoning behind the suggested changes.'),
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
Sua tarefa é refinar os prompts de um agente, separando a lógica entre um "System Prompt" (estático, define o papel e o formato de saída) e um "Template de Persona" (dinâmico, contém os dados do contexto).
A sua resposta (prompts sugeridos e justificativa) deve ser sempre em Português do Brasil.

O agente que você irá refinar é do tipo: {{{agentType}}}
Persona Template Atual: {{{currentPersona}}}
System Prompt Atual: {{{currentSystemPrompt}}}

{{#if organizationName}}
Ele atua no departamento (Organização): {{{organizationName}}}
{{/if}}

{{#if childAgentNames}}
Ele é responsável por delegar tarefas para os seguintes especialistas (Agentes Filhos):
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

Instruções para a criação dos prompts sugeridos:

- Gere um 'suggestedSystemPrompt':
  - Deve ser estático e reutilizável.
  - Deve definir claramente o papel/persona do agente.
  - Deve instruir o agente a usar o contexto do "Template de Persona" para tomar sua decisão.
  - Deve exigir uma saída ESTRITAMENTE EM JSON, definindo os campos exatos.

- Gere um 'suggestedPersonaTemplate':
  - Deve ser um template Handlebars dinâmico.
  - Deve conter apenas os placeholders para os dados que mudam a cada chamada (ex: mensagem do cliente, histórico, lista de ferramentas/agentes disponíveis).

- Modelos de Saída JSON esperados:
  - Para 'PARENT'/'ROUTER': { "agentId": "ID_DO_AGENTE_SELECIONADO | null", "justificativa": "MOTIVO_DA_ESCOLHA" }
  - Para 'CHILD': { "action": "TOOL_CALL | REPLY", "toolName": "NOME_DA_FERRAMENTA | null", "parameters": { ... } | null, "replyText": "RESPOSTA_AO_CLIENTE | null" }

- Se o tipo for "PARENT" (ou "Gerente de Departamento"):
  - System Prompt: Deve instruir o agente a agir como um roteador que analisa a mensagem do cliente (fornecida no template) e delega para o Agente Filho (especialista) mais apropriado. Deve mencionar o formato de saída JSON.
  - Persona Template: Deve conter placeholders como '{{messageContent}}' e '{{#each availableAgents}}...{{/each}}'.

- Se o tipo for "CHILD" (ou "Especialista"):
  - System Prompt: Deve instruir o agente a executar uma tarefa final. Ele deve decidir entre usar uma de suas ferramentas (listadas no template) ou responder diretamente ao cliente, com base no histórico e na mensagem atual. Deve mencionar o formato de saída JSON.
  - Persona Template: Deve conter placeholders como '{{messageContent}}', '{{conversationHistory}}', e '{{#each availableTools}}...{{/each}}'.

Com base no tipo de agente e no contexto, gere um 'suggestedSystemPrompt', um 'suggestedPersonaTemplate' e uma 'reasoning' clara do motivo pelo qual a nova estrutura é melhor.`,
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
        suggestedSystemPrompt: 'Este é um prompt de sistema para o agente roteador principal. Sua função é analisar a mensagem do cliente e o contexto fornecido para delegar a tarefa ao departamento (Agente Pai) mais apropriado. Responda apenas com um JSON no formato: { "agentId": "ID_DO_AGENTE_SELECIONADO | null", "justificativa": "MOTIVO_DA_ESCOLHA" }',
        suggestedPersonaTemplate: 'Mensagem do Cliente: "{{messageContent}}"\n\nDepartamentos Disponíveis:\n{{#each availableAgents}}\n- ID: "{{this.id}}", Nome: "{{this.name}}", Especialidade: "{{this.persona}}"\n{{/each}}',
        reasoning: 'O Agente Roteador é configurado pelo sistema e não pode ser refinado pela IA para garantir a estabilidade do fluxo principal da instância.'
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
