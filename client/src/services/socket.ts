import { io, Socket } from 'socket.io-client';

// Singleton socket instance for chat and notifications
let socket: Socket | undefined;

export function getSocket(token?: string) {
  if (socket && socket.connected) return socket;
  const url = ((import.meta as any).env?.VITE_SOCKET_URL as string) || 'http://localhost:3000';
  socket = io(url, {
  query: { token },
  transports: ['websocket'],
  reconnection: true,
});
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id, 'to', url);
  });
  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });
  socket.on('connect_error', (err) => {
    console.error('[Socket] Connect error:', err);
  });
  return socket;
}
