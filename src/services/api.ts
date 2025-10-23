
'use client';

import axios from 'axios';
import type { User, Instance, PaginatedContacts, ContactSummary, PaginatedMessages } from '@/lib/types';

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

// Auth
export const login = async (data: any): Promise<{ token: string, user: User }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const register = async (data: any): Promise<any> => {
    return await api.post('/auth/register', data);
};

export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Instances
export const getUserInstances = async (): Promise<Instance[]> => {
    const response = await api.get('/user/instances');
    return response.data;
}

export const createInstance = async (data: { name: string }): Promise<{ instance: Instance }> => {
    const response = await api.post('/new/instance', data);
    return response.data;
}

export const reconnectInstance = async (instanceId: string): Promise<void> => {
    await api.post(`/instances/${instanceId}/reconnect`);
}

export const disconnectInstance = async (instanceId: string): Promise<void> => {
    await api.post(`/instances/${instanceId}/disconnect`);
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
export const getInstanceMessages = async (instanceId: string, contactId: string, page = 1, limit = 20): Promise<PaginatedMessages> => {
    const response = await api.get(`/instances/${instanceId}/messages`, {
        params: { contactId, page, limit }
    });
    return response.data;
};


// Knowledge Base
export const uploadPdfToKnowledgeBase = async (instanceId: string, userId: string, file: File, onUploadProgress: (progressEvent: any) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/knowledge/upload-pdf/${userId}/${instanceId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
    return response.data;
};


export default api;
