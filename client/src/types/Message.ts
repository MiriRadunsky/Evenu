// types/message.ts
export interface Message {
  _id: string;
  threadId: string;
  body: string;

  from: {
    id: string;          // ObjectId של השולח
    type: "user" | "supplier";
  };

  to: {
    id: string;          // ObjectId של הנמען
    type: "user" | "supplier";
  };

  isRead: boolean;
  createdAt: string;     // ISO string שהשרת מחזיר
}
