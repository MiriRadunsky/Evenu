import { store, type AppDispatch } from "@/store";
import { addNotification } from "@/store/notificationsSlice";
import type { Notification } from "@/types/Notification";
import ioClient from "socket.io-client"; // default import

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
