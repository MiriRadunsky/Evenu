// import { Server } from "socket.io";

// let io;

// export function initWebSocket(server) {
//   io = new Server(server, { cors: { origin: "*" } });

//   io.on("connection", (socket) => {
//     console.log("🟢 New client connected:", socket.id);
//     socket.on("register", (userId) => {
//       const room = userId.toString();
//       socket.join(room);
//       console.log(`📦 User ${room} joined room`);
//     });
//     socket.on("disconnect", () => console.log("🔴 Client disconnected"));
//   });
// }

// export { io };

// export async function sendNotification(notification) {
//   if (!io) {
//     console.error("❌ WebSocket not initialized!");
//     return;
//   }

//   const room = io.sockets.adapter.rooms.get(notification.userId.toString());

//   if (notification.channel === "in-app") {
//     if (room && room.size > 0) {
//       io.to(notification.userId.toString()).emit("notification", notification);
//     }
//   } else {
    
//     console.log(`📧 Sending email to ${notification.userId}`);
//   }
// }
