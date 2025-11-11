
import { notificationQueue } from '../queues/scheduler.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { io } from '../websocket/notification.socket.js';

export const NotificationService = {
  async createNotification({ userId, type, payload, scheduledFor, channel = 'in-app' }) {
    const notification = await NotificationRepository.create({
      userId,
      type,
      payload,
      scheduledFor,
      channel
    });

    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      await notificationQueue.add('scheduled', { notificationId: notification._id, userId, type, payload }, { delay: new Date(scheduledFor) - Date.now() });
    } else {
      await sendNotification(notification);
      await NotificationRepository.markAsSent(notification._id);
    }

    return notification;
  }
};

// פונקציה לשליחה בפועל
// export async function sendNotification(notification) {
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

  if (notification.channel === 'in-app') {
    io.to(notification.userId.toString()).emit('notification', notification);
  } else {
    console.log(`📧 Sending email to ${notification.userId}`);
  }
}
