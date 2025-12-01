// src/types/SocketMessage.ts
export interface SocketMessage  {
  _id: string;
  body: string;
  from: string;
  to: string;
  threadId: string;
  createdAt: string; // מגיע כ־ISO string מהשרת
};
