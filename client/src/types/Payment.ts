export type PaymentStatus =
  | "ממתין"
  | "ממתין לספק"
  | "שולם"
  | "נדחה";

export interface Payment {
  _id: string;

  amount: number;
  status: PaymentStatus;

  dueDate?: string; // ISO Date
  note?: string;

  // קבלות
  clientEvidenceKey?: string;
  supplierEvidenceKey?: string;

  // במקרה של דחייה
  rejectedReason?: string;

  // חוזה ואירוע
  contractId: {
    _id: string;
    totalAmount: number;
    clientId?: {
      _id: string;
      name: string;
    };
    supplierId?: {
      _id: string;
      name?: string;  
      user?: {
        _id: string;
        name: string;
      };
    };
    eventId?: {
      _id: string;
      name: string;
      eventDate: string;
      eventType: string;
    };
  };

  createdAt?: string;
  updatedAt?: string;
}
