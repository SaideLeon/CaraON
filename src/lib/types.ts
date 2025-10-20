

export interface User {
  id: string;
  name: string;
  email: string;
}

export type InstanceStatus = 'connected' | 'disconnected' | 'pending' | 'error' | 'reconnecting' | 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR' | 'PENDING_QR' | 'RECONNECTING';

export interface Instance {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  status: InstanceStatus;
  createdAt: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name?: string | null;
  pushName?: string | null;
  isBlocked: boolean;
  instanceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContacts {
  data: Contact[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export interface ContactSummary {
    totalContacts: number;
    phones: string[];
}

// Types for Agent Logs
export interface AgentSession {
    session_id: string; // This is the user's phone number
    user_id: string;
    instance_id: string;
    message_count: number;
    created_at: string;
    updated_at: string;
    contactName?: string; // Optional field to hold the contact's name
}

export interface AgentSessionResponse {
    sessions: AgentSession[];
}

export interface AgentMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AgentConversationResponse {
    conversation: AgentMessage[];
}
