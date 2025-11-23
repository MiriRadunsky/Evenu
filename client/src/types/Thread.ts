export interface Thread {
  _id: string;
  userId: string;          // מזהה הלקוח
  supplierId?: string;     // מזהה הספק
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
  supplierName?: string;
  clientName?: string;
  eventName?: string;
  status?: string;
  unreadCount?: number;
}
