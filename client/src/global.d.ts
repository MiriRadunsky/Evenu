import type { Socket } from "socket.io-client";

declare global {
  // משתנה גלובלי מטוּיּפּ בלי any
  // TypeScript מכיר אותו בכל הפרויקט
  var __chat_socket: Socket | undefined;
}

export {};
