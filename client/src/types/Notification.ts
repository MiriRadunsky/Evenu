export interface Notification {
  id: string;
  userId: string;
  type: "תשלום" | "חוזה" | "פגישה" | "מערכת"|"אירוע"|"בקשה";
  payload: {
    contractId: string;
    paymentId: string;
    amount: number;
    note: string;
    time: Date;
  };
  scheduledFor?: Date;
  channel: "in-app" | "email";
  readAt?: Date;
  createdAt: Date;
  priority?: "high" | "medium" | "low";
}