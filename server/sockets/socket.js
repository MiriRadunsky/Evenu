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
    const cookies = socket.request.headers.cookie;
    const token = cookies
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    console.log("auth object:", token);

    if (!token) {
      console.log("No token received");
      return next(new Error("Unauthorized"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("JWT verify failed:", err.message);
        return next(new Error("Unauthorized"));
      }
      console.log("JWT decoded:", decoded);
      socket.user = decoded;
      next();
    });
  });

  // ---- CONNECTION ----
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user?.id || socket.id);

    // טעינת מודולי הודעות והתראות
    registerNotificationHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.user?.id || socket.id, reason);
    });
  });
}

export { io };
