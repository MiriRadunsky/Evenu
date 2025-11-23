import type { Event } from "./type";

export interface Request {
  _id: string;
  basicEventSummary: string;
  notesFromClient?: string;
  status: "ממתין" | "מאושר" | "נדחה" | "פג";
  createdAt: string;
  updatedAt: string;
  eventId: Event;
  clientId?: {
    _id: string;
    name: string;
    email: string;
  };
  supplierId?: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
}
