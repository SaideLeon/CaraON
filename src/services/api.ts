import axios from 'axios';
import type { Agent, User, Instance, Organization } from '@/lib/types';

const API_BASE_URL = 'https://app.caraon.qzz.io/api/v1'; // Use the production URL directly
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

// Agents
export const getParentAgentsByInstanceId = async (instanceId: string): Promise<Agent[]> => {
    const response = await api.get(`/agents/instance/${instanceId}`);
    // Attach an empty childAgents array to each parent for consistency
    return response.data.map((agent: Agent) => ({ ...agent, childAgents: [] }));
};

export const getChildAgents = async (parentAgentId: string): Promise<Agent[]> => {
    const response = await api.get(`/agents/child/${parentAgentId}`);
    return response.data;
};

export const createParentAgent = async (instanceId: string, organizationId: string | undefined, data: { name: string, persona: string }): Promise<Agent> => {
    const url = organizationId 
        ? `/agents/parent/${instanceId}/${organizationId}` 
        : `/agents/parent/${instanceId}`;
    const response = await api.post(url, data);
    return response.data;
};

export const updateAgentPersona = async (agentId: string, persona: string): Promise<Agent> => {
    const response = await api.patch(`/agents/${agentId}/persona`, { persona });
    return response.data;
};


// Auth
export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Instances
export const getUserInstances = async (): Promise<Instance[]> => {
    const response = await api.get('/user/instances');
    return response.data;
}

// Organizations
export const getInstanceOrganizations = async (instanceId: string): Promise<Organization[]> => {
    const response = await api.get(`/instances/${instanceId}/organizations`);
    return response.data;
}


export default api;
