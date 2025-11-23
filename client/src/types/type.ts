
export interface Request {
  id: string;
  status: string;
}
// interface Payment {
//   id: string;
//   status: string;
//   amount?: number;
//   dueDate?: string;
// }
// interface Message {
//   id: string;
//   sentAt?: string;
// }

export interface DashboardState {
  events: Event[];
  requests: Request[];
  payments: Payment[];
  messages: Message[];
  loading: boolean;
}
// export type { Event, Request, Payment, Message, DashboardState };



// types.ts

// ---------------------
// User
// ---------------------
export interface User {
  _id: string;
  token:string
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'supplier' | 'admin';
  social?: {
    googleId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Event
// ---------------------
export interface Event {
  _id: string;
  ownerId: string;
  name: string;
  type: 'חתונה' | 'ברית' | 'בר מצווה' | 'בת מצווה' | 'שבע ברכות' | 'אחר';
  date: Date;
  locationRegion: string;
  budget?: number;
  estimatedGuests: number;
  status: 'פעיל' | 'הושלם' | 'בוטל';
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Category
// ---------------------
export interface Category {
  _id: string;
  label: 'צלם' | 'להקה' | 'אולם' | 'קייטרינג' | 'עיצוב' | 'אחר';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Supplier
// ---------------------
export interface Supplier {
  _id: string;
  name: string;
  category: string; // Category _id
  regions: string[];
  kashrut?: string;
  contact: {
    phone: string;
    email: string;
  };
  portfolio?: {
    url: string;
    title?: string;
  }[];
  profileImage?: {
    url: string;
    alt?: string;
  };
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// SupplierRequest
// ---------------------
export interface SupplierRequest {
  _id: string;
  eventId: string; // Event _id
  supplierId: string; // Supplier _id
  clientId: string; // User _id
  basicEventSummary: string;
  notesFromClient?: string;
  status: 'בהזמנה' | 'מאושר' | 'נדחה' | 'פג תוקף';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Contract
// ---------------------
export interface ContractSignature {
  party: 'user' | 'supplier';
  at: Date;
  signatureMeta?: {
    [key: string]: unknown;
  };
}

export interface PaymentPlanItem {
  dueDate: Date;
  amount: number;
  status: 'ממתין' | 'שולם' | 'פג תוקף';
  receiptUrl?: string;
}

export interface Contract {
  _id: string;
  eventId: string;
  supplierId: string;
  clientId: string;
  fileUrl: string;
  signatures: ContractSignature[];
  status: 'טיוטה' | 'ממתין לחתימה' | 'פעיל' | 'הושלם' | 'בוטל';
  paymentPlan?: PaymentPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Payment
// ---------------------
export interface Payment {
  _id: string;
  contractId: string;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  status: 'ממתין' | 'שולם' | 'פג תוקף';
  method?: 'cash' | 'bank_transfer' | 'check' | 'other';
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------
// Message
// ---------------------
export interface MessageUser {
  id: string;
  type: 'user' | 'supplier';
}

export interface Message {
  _id: string;
  threadId: string;
  from: MessageUser;
  to: MessageUser;
  body: string;
  createdAt: Date;
  ttlAt?: Date;
}

// ---------------------
// Notification
// ---------------------
export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'contract' | 'meeting' | 'system';
  payload: Record<string, unknown>;
  scheduledFor?: Date;
  sentAt: Date;
  channel: 'in-app' | 'email';
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


// ---------------------
// EventAudit
// ---------------------
export interface EventAudit {
  _id: string;
  entityType: 'event' | 'supplier' | 'contract' | 'payment' | 'request';
  entityId: string;
  action: string;
  actorId: string; // User _id
  at: Date;
  diff?: Record<string, unknown>;
}
