import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { registerNotificationHandlers } from "../sockets/notification.gateway.js";
import { registerChatHandlers } from "../sockets/message.gateway.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ---- JWT MIDDLEWARE ----
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Unauthorized"));
      socket.user = decoded;
      next();
    });
  });

  // ---- CONNECTION ----
  io.on("connection", socket => {
    console.log("Socket connected:", socket.user?.id || socket.id);

    // טעינת מודולי הודעות והתראות
    registerNotificationHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", reason => {
      console.log("Socket disconnected:", socket.user?.id || socket.id, reason);
    });
  });
}

export { io };
