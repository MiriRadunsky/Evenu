
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { notificationQueue } from '../queues/scheduler.js';
import { sendNotification } from '../sockets/notification.gateway.js';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})
 async function createNotificationUnsafe({ userId, type, payload, scheduledFor, channel = 'in-app' }) {
  const notification = {
    id: randomUUID(),
    userId,
    type,
    payload,
    scheduledFor,
    channel,
    createdAt: Date.now(),
  };

  if (channel === 'in-app') {
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      await notificationQueue.add('scheduled', notification, {
        delay: new Date(scheduledFor).getTime() - Date.now(),
      });
    } else {
      await sendNotification(notification);
      await redis.rpush(`user:${userId}:notifications`, notification.id);
      await redis.hset(`user:${userId}:notificationMap`, notification.id, JSON.stringify(notification));
    }
  }

  return notification;
}
export const NotificationService = {
  
 


 async createNotification(args) {
    try {
      return await createNotificationUnsafe(args);
    } catch (err) {
      console.error("Notification error:", err);
      return null;
    }
  },

  async getUserNotifications(userId) {
    const mapKey = `user:${userId}:notificationMap`;
    const notifications = await redis.hvals(mapKey);
    return notifications.map(n => JSON.parse(n)).sort((a, b) => b.createdAt - a.createdAt);
  },

  
  async markAsRead(userId, notificationId) {
    const mapKey = `user:${userId}:notificationMap`;
    await redis.hdel(mapKey, notificationId);
    return notificationId;
  },

  
  async cleanOldNotifications(userId, days = 7) {
    const listKey = `user:${userId}:notifications`;
    const mapKey = `user:${userId}:notificationMap`;

    const now = Date.now();
    const notifications = await redis.hgetall(mapKey);

    for (const [id, data] of Object.entries(notifications)) {
      const parsed = JSON.parse(data);
      if (now - parsed.createdAt > days * 24 * 60 * 60 * 1000) {
        await redis.hdel(mapKey, id);
      }
    }

  },
};
