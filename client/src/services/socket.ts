// import { io, Socket } from "socket.io-client";
// import { addNotification } from "../store/notificationsSlice";
// import { store, type AppDispatch } from "../store";
// import type { Notification } from "@/types/Notification";

// let socket: Socket;

// export const initSocket = (userId: string, dispatch: AppDispatch) => {
//   if (!socket) {
//     const socketUrl =
//       import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

//     socket = io(socketUrl, {
//       auth: {
//         token: store.getState().auth.token,
//       },
//     });

//     socket.on("connect", () => {
//       console.log("🟢 Connected with id:", socket.id);
//       socket.emit("register", userId);
//     });

//     socket.on("notification", (notification:Notification) => {
//       dispatch(addNotification(notification));
//     });

//     socket.on("disconnect", () => console.log("🔴 Disconnected"));
//   }

//   return socket;
// };
import { store, type AppDispatch } from "@/store";
import { addNotification } from "@/store/notificationsSlice";
import type { Notification } from "@/types/Notification";
import ioClient from "socket.io-client"; // default import

// השתמש ב־ReturnType במקום import type { Socket }
let socketInstance: ReturnType<typeof ioClient> | null = null;

export const initSocket = (userId: string, dispatch: AppDispatch) => {
  if (!socketInstance) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    socketInstance = ioClient(socketUrl, {
      auth: {
        token: store.getState().auth.token,
      },
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected with id:", socketInstance?.id);
      socketInstance?.emit("register", userId);
    });

    socketInstance.on("notification", (notification: Notification) => {
      dispatch(addNotification(notification));
    });

    socketInstance.on("disconnect", () => console.log("🔴 Disconnected"));
  }

  return socketInstance;
};
