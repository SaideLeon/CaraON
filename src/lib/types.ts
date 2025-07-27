

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

export type AgentType = 'ROUTER' | 'PARENT' | 'CHILD';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  persona: string;
  priority: number;
  instanceId: string;
  organizationId?: string | null;
  parentAgentId?: string | null;
  routerAgentId?: string | null;
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
    config: {
      connectionString?: string;
      collection?: string;
      query?: string;
    };
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface Organization {
  id: string;
  name: string;
  instanceId: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  parentId?: string | null;
  isActive: boolean;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductImage {
  id?: string;
  url: string;
  altText?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  sku: string;
  price: number;
  comparePrice?: number | null;
  cost?: number | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  status: ProductStatus;
  isDigital: boolean;
  trackStock: boolean;
  stock: number;
  minStock: number;
  maxStock?: number | null;
  featured: boolean;
  categoryId: string;
  brandId?: string | null;
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
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
