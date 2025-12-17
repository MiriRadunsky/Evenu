// // types/message.ts
// export interface Message {
//   _id: string;
//   threadId: string;
//   body: string;

//   from: {
//     id: string;          // ObjectId של השולח
//     type: "user" | "supplier";
//   };

//   to: {
//     id: string;          // ObjectId של הנמען
//     type: "user" | "supplier";
//   };

//   isRead: boolean;
//   createdAt: string;     // ISO string שהשרת מחזיר
// }
export interface Message {
  _id: string;
  threadId: string;
  from: string;
  to: string;
  body: string;
  createdAt: string | Date;
  readBy?: string[]; // user IDs who have read this message
  readAt?: string | Date; // last read timestamp (optional)
}
