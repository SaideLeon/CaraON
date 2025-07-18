import axios from 'axios';
import type { Agent } from '@/lib/types';

const API_BASE_URL = 'https://steal-shaw-fold-surfaces.trycloudflare.com/api/v1'; // Use the production URL directly
const TOKEN_KEY = 'caraon-token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // Check if window is defined to ensure this runs only on the client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This is a workaround since there's no direct GET /agents/{id} endpoint
export const getAgentById = async (agentId: string): Promise<Agent> => {
    // First, get all instances to search through them
    const instancesResponse = await api.get('/user/instances');
    const instances = instancesResponse.data;

    // Search for the agent in all instances
    for (const instance of instances) {
        try {
            const agentsResponse = await api.get(`/agents?instanceId=${instance.id}`);
            const agent = agentsResponse.data.find((a: Agent) => a.id === agentId);
            if (agent) {
                return agent;
            }
        } catch (error) {
            // Ignore errors for instances where the user might not have agent access or it's empty
            console.warn(`Could not fetch agents for instance ${instance.id}, skipping.`);
        }
    }

    throw new Error('Agent not found across all instances');
};

export const updateAgentPersona = async (agentId: string, persona: string): Promise<Agent> => {
    const response = await api.patch(`/agents/${agentId}/persona`, { persona });
    return response.data;
}


export default api;
