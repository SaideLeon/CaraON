export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Instance {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  status?: 'connected' | 'disconnected' | 'pending' | 'error';
}

export interface Agent {
  id: string;
  name: string;
  flowId: string;
  persona: string;
  instanceId: string;
  organizationId?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  instanceId: string;
}
