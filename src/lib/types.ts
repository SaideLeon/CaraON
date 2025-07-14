export interface User {
  id: string;
  name: string;
  email: string;
}

export type InstanceStatus = 'connected' | 'disconnected' | 'pending' | 'error' | 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR';

export interface Instance {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  status: InstanceStatus;
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
