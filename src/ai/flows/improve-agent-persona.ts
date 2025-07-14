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
  prompt: `You are an expert in crafting effective agent personas. Given the current persona of an agent, provide a suggested new persona and reasoning for the change.

Agent ID: {{{agentId}}}
Current Persona: {{{currentPersona}}}

Suggest a new persona that would improve the agent's helpfulness and effectiveness. Provide a clear and concise reasoning for why the suggested persona is better.

New Persona: 
{{suggestedPersona}}

Reasoning:
{{reasoning}}`,
});

const improveAgentPersonaFlow = ai.defineFlow(
  {
    name: 'improveAgentPersonaFlow',
    inputSchema: ImproveAgentPersonaInputSchema,
    outputSchema: ImproveAgentPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
