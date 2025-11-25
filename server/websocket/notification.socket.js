
import { Server } from 'socket.io';
import { NotificationService } from '../services/notification.service.js';

let io;

export function initWebSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', socket => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('register', async userId => {
      socket.join(userId.toString());
      console.log(`📦 User ${userId} joined room`);

      // שולף התראות קיימות
      
      const notifications = await NotificationService.getUserNotifications(userId);
      notifications.forEach(n => socket.emit('notification', n));
    });

    socket.on('disconnect', () => console.log('🔴 Client disconnected'));
  });
}

export { io };

// export async function sendNotification(notification) {
//   if (!io) {
//     console.error('❌ WebSocket not initialized!');
//     return;
//   }

//   if (notification.channel === 'in-app') {
//     io.to(notification.userId.toString()).emit('notification', notification);
//   } else {
//     console.log(`📧 Sending email to ${notification.userId}`);
//   }
// }
export async function sendNotification(notification) {
  if (!io) {
    console.error('❌ WebSocket not initialized!');
    return;
  }

  const room = io.sockets.adapter.rooms.get(notification.userId.toString());
  
  if (notification.channel === 'in-app') {
    if (room && room.size > 0) {
      // יש לקוח מחובר – שולח מיידית
      io.to(notification.userId.toString()).emit('notification', notification);
    }
    // תמיד שמור ב־Redis כדי שאם הלקוח יחזור או יעשה ריענון, ההתראה תישמר
   
  } else {
    console.log(`📧 Sending email to ${notification.userId}`);
  }
}
