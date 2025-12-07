export interface Thread {
  _id: string;
  userId: string;         
  supplierId?: string;    
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
  supplierName?: string;
  clientName?: string;
  eventName?: string;
  status?: string;
  unreadCount?: number;
}
