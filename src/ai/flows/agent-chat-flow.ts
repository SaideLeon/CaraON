
'use server';

/**
 * @fileOverview This file defines a Genkit flow for handling chat interactions with an agent.
 *
 * The flow takes the agent's ID, the user's message, and the chat history as input,
 * and calls the backend service to get the agent's orchestrated response.
 * - agentChat - The main function to interact with an agent.
 * - AgentChatInput - The input type for the agentChat function.
 * - AgentChatOutput - The return type for the agentChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callAgentChat } from '@/services/api';

const MessageSchema = z.object({
  sender: z.enum(['user', 'agent']),
  text: z.string(),
});

const AgentChatInputSchema = z.object({
  agentId: z.string().describe('The ID of the parent agent to chat with.'),
  message: z.string().describe('The latest message from the user.'),
  history: z.array(MessageSchema).describe('The history of the conversation.'),
});
export type AgentChatInput = z.infer<typeof AgentChatInputSchema>;

const AgentChatOutputSchema = z.object({
  reply: z.string().describe("The agent's final reply to the user."),
});
export type AgentChatOutput = z.infer<typeof AgentChatOutputSchema>;


export async function agentChat(input: AgentChatInput): Promise<AgentChatOutput> {
  return agentChatFlow(input);
}

const agentChatFlow = ai.defineFlow(
  {
    name: 'agentChatFlow',
    inputSchema: AgentChatInputSchema,
    outputSchema: AgentChatOutputSchema,
  },
  async (input) => {
    // This flow acts as a bridge to our existing backend orchestration logic.
    // It calls the backend API endpoint responsible for handling the chat.
    const response = await callAgentChat(input.agentId, {
        message: input.message,
        // We can decide how much history to send to the backend.
        // For now, let's send the last 10 messages to keep the payload reasonable.
        history: input.history.slice(-10), 
    });

    // The backend is expected to return a response in the correct format.
    // The 'response' from callAgentChat should be a simple string reply.
    return {
      reply: response,
    };
  }
);
