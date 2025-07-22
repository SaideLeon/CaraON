export interface User {
  id: string;
  name: string;
  email: string;
}

export type InstanceStatus = 'connected' | 'disconnected' | 'pending' | 'error' | 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR' | 'PENDING_QR';

export interface Instance {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  status: InstanceStatus;
}

export type AgentType = 'PAI' | 'FILHO';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  persona: string;
  instanceId: string;
  organizationId?: string | null;
  parentAgentId?: string | null;
  childAgents?: Agent[]; // Para aninhar agentes filhos
  config?: any; // Pode ser tipado de forma mais estrita se a estrutura for conhecida
  tools?: Tool[];
  templateId?: string | null;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    defaultPersona: string;
    isSystem: boolean;
    userId: string | null;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    type: string;
    config: any;
    isSystem: boolean;
}


export interface Organization {
  id: string;
  name: string;
  instanceId: string;
}
