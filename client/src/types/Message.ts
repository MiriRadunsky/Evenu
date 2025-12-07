// types/message.ts
export interface Message {
  _id: string;
  threadId: string;
  body: string;

  from: {
    id: string;       
    type: "user" | "supplier";
  };

  to: {
    id: string;         
    type: "user" | "supplier";
  };

  isRead: boolean;
  createdAt: string;    
}
