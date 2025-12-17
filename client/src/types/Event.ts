import type { BudgetHistoryItem } from "./Budget";

export interface Event {
  _id: string;
  ownerId: string;
  name: string;
  type: "חתונה" | "ברית" | "בר מצווה" | "בת מצווה" | "שבע ברכות" | "אחר";
  date: string;
  locationRegion: string;
  budget?: number;
  budgetAllocated?: number;
  budgetHistory?: BudgetHistoryItem[];
  estimatedGuests: number;
  status: "פעיל" | "הושלם" | "בוטל";
  autoStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}
