import type { Event } from "./Event";

export interface eventSummery{
   eventName: string;
    location: string;
    type:string;
    date:  string;
}
export interface Request {
  _id: string;
  basicEventSummary: eventSummery;
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
