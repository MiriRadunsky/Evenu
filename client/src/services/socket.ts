import { io, Socket } from 'socket.io-client';
import { addNotification } from '../store/notificationsSlice';
import type { AppDispatch } from '../store';

let socket: Socket;

export const initSocket = (userId: string, dispatch: AppDispatch) => {
  if (!socket) {
    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('🟢 Connected with id:', socket.id);
      socket.emit('register', userId);
    });

    socket.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    socket.on('disconnect', () => console.log('🔴 Disconnected'));
  }

  return socket;
};
