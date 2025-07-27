

'use client';

import axios from 'axios';
import type { Agent, User, Instance, Organization, Tool, Brand, Category, Product, PaginatedContacts, ContactSummary, Message, PaginatedMessages } from '@/lib/types';

const API_BASE_URL = '/api/v1';
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
export const getUserParentAgents = async (): Promise<Agent[]> => {
    const response = await api.get('/agents/user/parents');
    return response.data;
};

export const getAgentById = async (agentId: string): Promise<Agent> => {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
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

export const createCustomChildAgent = async (parentAgentId: string, data: { name: string; persona: string; flow?: string; toolIds?: string[] }): Promise<Agent> => {
    const response = await api.post(`/agents/child/custom/${parentAgentId}`, data);
    return response.data;
};

export const updateAgent = async (agentId: string, data: { persona?: string, priority?: number, routerAgentId?: string | null }): Promise<Agent> => {
    const response = await api.put(`/agents/${agentId}`, data);
    return response.data;
};

export const deleteAgent = async (agentId: string): Promise<void> => {
    await api.delete(`/agents/${agentId}`);
}

// Agent Chat
export const callAgentChat = async (agentId: string, data: { message: string, history: any[] }): Promise<string> => {
    const response = await api.post(`/agents/${agentId}/chat`, data);
    return response.data; // Assuming the backend returns the string response directly
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

export const deleteInstance = async (instanceId: string): Promise<void> => {
    await api.delete(`/instances/${instanceId}`);
};

// Organizations
export const getInstanceOrganizations = async (instanceId: string): Promise<Organization[]> => {
    const response = await api.get(`/instances/${instanceId}/organizations`);
    return response.data;
}

// Tools
export const getTools = async (): Promise<Tool[]> => {
    const response = await api.get('/tools');
    return response.data;
}

export const createTool = async (data: Omit<Tool, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>): Promise<Tool> => {
    const response = await api.post('/tools', data);
    return response.data;
}

export const deleteTool = async (toolId: string): Promise<void> => {
    await api.delete(`/tools/${toolId}`);
}

// Brands
export const getBrands = async (): Promise<Brand[]> => {
    const response = await api.get('/brands');
    // The API returns a paginated response, so we extract the data array.
    return response.data.data;
};

export const createBrand = async (data: Omit<Brand, 'id' | 'isActive'>): Promise<Brand> => {
    const response = await api.post('/brands', data);
    return response.data;
};

export const deleteBrand = async (brandId: string): Promise<void> => {
    await api.delete(`/brands/${brandId}`);
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    // The API returns a paginated response, so we extract the data array.
    return response.data.data;
};

export const createCategory = async (data: Omit<Category, 'id' | 'isActive'>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
};

// Products
export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'images'> & { images: { url: string; altText?: string }[] }): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    await api.delete(`/products/${productId}`);
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
export const getMessages = async (instanceId: string, contactId: string, page = 1, limit = 20): Promise<PaginatedMessages> => {
    const response = await api.get(`/instances/${instanceId}/messages`, { params: { contactId, page, limit } });
    return response.data;
}

export const deleteMessage = async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
}


export default api;
