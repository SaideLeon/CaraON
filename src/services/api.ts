
'use client';

import axios from 'axios';
import type { User, Instance, PaginatedContacts, ContactSummary, Message, PaginatedMessages, AgentHierarchy } from '@/lib/types';

const API_BASE_URL = '/api/v1';
const TOKEN_KEY = 'sariac-token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Main API instance that uses the /api/v1 prefix and includes the token.
api.interceptors.request.use(
  (config) => {
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


// Agent Hierarchy - Now using the main 'api' instance
export const getAgentHierarchyForInstance = async (instanceId: string): Promise<AgentHierarchy> => {
    // This now calls the main backend endpoint
    const response = await api.get(`/agents/hierarchy/${instanceId}`);
    return response.data;
};

export const updateAgentHierarchy = async (hierarchy: Omit<AgentHierarchy, 'user_id'>): Promise<{message: string}> => {
    // This now calls the main backend endpoint. Backend gets user_id from token.
    const response = await api.put(`/agents/hierarchy`, hierarchy);
    return response.data;
}


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

export const deleteInstance = async (instanceId: string): Promise<void> => {
    await api.delete(`/instances/${instanceId}`);
};

// Contacts
export const getInstanceContacts = async (instanceId: string, page = 1, limit = 10): Promise<PaginatedContacts> => {
    const response = await api.get(`/instances/${instanceId}/contacts`, { params: { page, limit } });
    return response.data;
};

export const getInstanceContactsSummary = async (instanceId: string): Promise<ContactSummary> => {
    const response = await api.get(`/instances/${instanceId}/contacts/summary`);
    return response.data;
}

// Messages
export const getMessages = async (instanceId: string, contactId: string, page = 1, limit = 50): Promise<PaginatedMessages> => {
    const response = await api.get(`/instances/${instanceId}/messages`, { params: { contactId, page, limit } });
    return response.data;
}

export const deleteMessage = async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
}

// Default export is the main API client
export default api;
