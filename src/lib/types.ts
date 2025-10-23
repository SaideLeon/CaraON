

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


// Types for Messages
export interface MessageContact {
    id: string;
    instanceId: string;
    phoneNumber: string;
    name: string | null;
    pushName: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    instanceId: string;
    contactId: string;
    wppId: string;
    direction: 'INCOMING' | 'OUTGOING';
    content: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    isRead: boolean;
    sentAt: string;
    deliveredAt: string | null;
    readAt: string | null;
    contact: MessageContact;
}

export interface PaginatedMessages {
    data: Message[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
