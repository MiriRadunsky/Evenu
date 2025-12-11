
import io from "socket.io-client";

let socketInstance: ReturnType<typeof io> | null = null;


export const initSocket = (userId: string) => {
  if (!socketInstance) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    socketInstance = io(socketUrl, {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected with id:", socketInstance?.id);
      socketInstance?.emit("register", userId);
    });
    socketInstance.on("disconnect", () =>
      console.log("🔴 Disconnected")
    );
  }

  return socketInstance;
};

export const getSocket=() =>{
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  if (socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
      console.log("socket connected");

    }
    return socketInstance;
  }

  socketInstance = io(url, {
    transports: ['websocket'],
  });

  socketInstance.on('connect', () => console.log('[Socket] Connected:', socketInstance?.id, 'to', url));
 socketInstance.on("disconnect", (reason: string) => {
  console.log("[Socket] Disconnected:", reason);
});


  socketInstance.on("connect_error", (err: Error) => {
    console.error("[Socket] Connect error:", err.message);
  });


  return socketInstance;
}


