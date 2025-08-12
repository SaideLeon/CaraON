

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

export interface AgentTool {
    type: 'DUCKDUCKGO' | 'YFINANCE' | string; // Making it extensible
    config?: Record<string, any> | null;
}

export interface AgentDefinition {
    agent_id?: string;
    name: string;
    role: string;
    model_provider: 'GEMINI' | string;
    model_id: string;
    tools: AgentTool[];
    parent_id?: string | null;
}

export interface AgentHierarchy {
    _id?: string;
    user_id?: string;
    instance_id: string;
    router_instructions: string;
    agents: AgentDefinition[];
    created_at?: string;
    updated_at?: string;
}

export interface Contact {
  id: string;
  phoneNumber: string; // Corrected from 'phone'
  name?: string | null;
  pushName?: string | null; // Added field
  isBlocked: boolean;
  instanceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContacts {
  data: Contact[];
  pagination: { // Corrected structure
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

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'error';

export interface Message {
    id: string;
    instanceId: string;
    contactId: string;
    fromMe: boolean;
    content: string;
    status: MessageStatus;
    timestamp: string;
    contact?: Contact;
}

export interface PaginatedMessages {
    data: Message[];
    total: number;
    page: number;
    limit: number;
}
