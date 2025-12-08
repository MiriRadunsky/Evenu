// import { ioClient } from 'socket.io-client';
// // // src/socket/socket.ts
// // import { io, type Socket } from "socket.io-client";
// // import type { SocketMessage } from "../types/SocketMessage";

// import { addNotification } from "@/store/notificationsSlice";
// import type { Notification } from "@/types/Notification";
// import type { AppDispatch } from '@/store';

// // export let socket: Socket | null = null;

// // export const initSocket = (token?: string) => {
// //   if (!token) throw new Error("Socket token is required");

// //   socket = io("http://localhost:3000", {
// //     auth: { token },        // שולח את הטוקן לשרת
// //     transports: ["websocket"], // ניתן להוסיף polling fallback
// //   });

// //   // אירועים בסיסיים
// //   socket.on("connect", () => console.log("Socket connected:", socket?.id));
// //   socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
// //   socket.on("connect_error", (err) => console.error("Socket connect error:", err));

// //   return socket;
// // };
// let socketInstance: ReturnType<typeof ioClient> | null = null;

// export const initSocket = (userId: string, dispatch: AppDispatch) => {
//   if (!socketInstance) {
//     const socketUrl =
//       import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

//     socketInstance = ioClient(socketUrl, {
//       // auth: { token },
//       transports: ['websocket'],
//       withCredentials: true,
//     });

//     socketInstance.on("connect", () => {
//       console.log("🟢 Connected with id:", socketInstance?.id);
//       socketInstance?.emit("register", userId);
//     });

//     socketInstance.on("notification", (notification: Notification) => {
//       dispatch(addNotification(notification));
//     });
//   }

//   return socketInstance;
// };
// src/socket/socket.ts
import { io, type Socket } from "socket.io-client";
import { addNotification } from "@/store/notificationsSlice";
import type { Notification } from "@/types/Notification";
import type { AppDispatch } from "@/store";

let socketInstance: Socket | null = null;

export const initSocket = (userId: string, dispatch: AppDispatch) => {
  if (!socketInstance) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    socketInstance = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected with id:", socketInstance?.id);
      socketInstance?.emit("register", userId);
    });

    socketInstance.on(
      "notification",
      (notification: Notification) => {
        dispatch(addNotification(notification));
      }
    );

    socketInstance.on("disconnect", () =>
      console.log("🔴 Disconnected")
    );
  }

  return socketInstance;
};
