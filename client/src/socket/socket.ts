// src/socket/socket.ts
import { io, type Socket } from "socket.io-client";
import type { SocketMessage } from "../types/SocketMessage";

export let socket: Socket | null = null;

export const initSocket = (token?: string) => {
  if (!token) throw new Error("Socket token is required");

  socket = io("http://localhost:3000", {
    auth: { token },        // שולח את הטוקן לשרת
    transports: ["websocket"], // ניתן להוסיף polling fallback
  });

  // אירועים בסיסיים
  socket.on("connect", () => console.log("Socket connected:", socket?.id));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
  socket.on("connect_error", (err) => console.error("Socket connect error:", err));

  return socket;
};
