import type { Supplier } from "./Supplier";
import type { Event } from "./type";

export interface Request {
  _id: string;
  basicEventSummary: string; 
  clientId: string;
  createdAt: string; 
  updatedAt: string; 
  expiresAt: string; 
  notesFromClient: string;
  status: "ממתין" | "אושר" | "נדחה" | "פג תוקף";
  eventId: Event
  supplierId: Supplier,
  threadId?: string;
}
