import { io, Socket } from "socket.io-client";
import { addNotification } from "../store/notificationsSlice";
import { store, type AppDispatch } from "../store";

let socket: Socket;

export const initSocket = (userId: string, dispatch: AppDispatch) => {
  if (!socket) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    socket = io(socketUrl, {
      auth: {
        token: store.getState().auth.token,
      },
    });

    socket.on("connect", () => {
      console.log("🟢 Connected with id:", socket.id);
      socket.emit("register", userId);
    });

    socket.on("notification", (notification) => {
      dispatch(addNotification(notification));
    });

    socket.on("disconnect", () => console.log("🔴 Disconnected"));
  }

  return socket;
};
