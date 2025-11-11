import { Server } from 'socket.io';

let io;

export function initWebSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', socket => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('register', async userId => {
      socket.join(userId.toString());
      console.log(`📦 User ${userId} joined room`);

      // שליחת התראות קיימות
      const notifications = await NotificationRepository.findByUser(userId);
      notifications.filter(n => !n.readAt)
                   .forEach(n => io.to(userId.toString()).emit('notification', n));
    });

    socket.on('disconnect', () => console.log('🔴 Client disconnected'));
  });
}

export { io };
