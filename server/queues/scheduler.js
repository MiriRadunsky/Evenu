
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { sendNotification } from '../services/notification.service.js';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // ✅ חובה כדי למנוע את השגיאת BullMQ
  tls: {               // 🔹 כאן צריך לשים את rejectUnauthorized
    rejectUnauthorized: false
  }});

// תור לניהול התראות
export const notificationQueue = new Queue('notifications', { connection });

// Worker שמבצע את השליחה בפועל
export const notificationWorker = new Worker('notifications', async job => {
  const { notificationId, userId, type, payload } = job.data;

  // שליחה בפועל
  await sendNotification({ userId, type, payload });

  // סימון כשלוחץ / כשלוח
  if (notificationId) {
    await NotificationRepository.markAsSent(notificationId);
  }
}, { connection });


notificationWorker.on('completed', job => {
  console.log(`✅ Notification ${job.id} sent successfully`);
});
notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification ${job.id} failed:`, err);
});
