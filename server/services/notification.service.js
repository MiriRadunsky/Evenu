
import { io, sendNotification } from '../websocket/notification.socket.js';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})

export const NotificationService = {
  /**
   * יצירת התראה חדשה למשתמש
   */
 
async createNotification({ userId, type, payload, scheduledFor, channel = 'in-app' }) {
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
      // 🔹 שולחים עכשיו ושומרים ב-Redis
      await sendNotification(notification);
      await redis.rpush(`user:${userId}:notifications`, notification.id);
      await redis.hset(`user:${userId}:notificationMap`, notification.id, JSON.stringify(notification));
    }
  }

  return notification;
}


,
  /**
   * שליפת ההתראות למשתמש
   * (רק מה־Hash, כך שמחיקות "רכות" לא יופיעו)
   */
  async getUserNotifications(userId) {
    const mapKey = `user:${userId}:notificationMap`;
    const notifications = await redis.hvals(mapKey);
    return notifications.map(n => JSON.parse(n)).sort((a, b) => b.createdAt - a.createdAt);
  },

  /**
   * סימון כהתראה נקראה — מחיקה רק מהמפה (O(1))
   */
  async markAsRead(userId, notificationId) {
    const mapKey = `user:${userId}:notificationMap`;
    await redis.hdel(mapKey, notificationId);
    return notificationId;
  },

  /**
   * ניקוי התראות ישנות (קריאה ע"י job מתוזמן פעם ביום)
   * לא חובה — רק לניקיון הרשימות
   */
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

    // ניתן להשאיר את הרשימה כמות שהיא – לא משפיע על המערכת
  },
};
