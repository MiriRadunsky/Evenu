import type { Socket } from "socket.io-client";

declare global {
  var __chat_socket: Socket | undefined;
}

export {};
