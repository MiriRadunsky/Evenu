
// import { Queue, Worker } from 'bullmq';
// import Redis from 'ioredis';
// import { sendNotification } from '../websocket/notification.socket.js';

// const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {

//   maxRetriesPerRequest: null, // ✅ חובה כדי למנוע את השגיאת BullMQ
//   tls: {               // 🔹 כאן צריך לשים את rejectUnauthorized
//     rejectUnauthorized: false
//   }});

// // תור לניהול התראות (גם מיידיות וגם עתידיות)
// export const notificationQueue = new Queue('notifications', { connection });

// // Worker שמבצע שליחה בפועל
// export const notificationWorker = new Worker(
//   'notifications',
//   async job => {
//     const { userId, type, payload } = job.data;

//     // שולח למשתמש דרך Socket.IO
//     await sendNotification({ userId, type, payload });

//     // אם מדובר בהתראה זמנית, אפשר למחוק מהרשימה ב־Redis
//     if (job.data.redisKey) {
//       await connection.lrem(job.data.redisKey, 0, JSON.stringify(job.data));
//     }
//   },
//   { connection }
// );

// notificationWorker.on('completed', job => console.log(`✅ Notification ${job.id} sent`));
// notificationWorker.on('failed', (job, err) => console.error(`❌ Notification ${job.id} failed`, err));
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendNotification } from '../websocket/notification.socket.js';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})

// תור לניהול התראות



// תור לניהול התראות (גם מיידיות וגם עתידיות)
export const notificationQueue = new Queue('notifications', { connection });

// Worker שמבצע שליחה בזמן הנכון
export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const notification = job.data;
    // שולח בפועל דרך Socket.IO
    await sendNotification(notification);

    // שומר ב־Redis רק אחרי השליחה (כדי שיופיע ב־client)
    const listKey = `user:${notification.userId}:notifications`;
    const mapKey = `user:${notification.userId}:notificationMap`;

    await connection.rpush(listKey, notification.id);
    await connection.hset(mapKey, notification.id, JSON.stringify(notification));

    console.log(`✅ Notification sent to user ${notification.userId}`);
  },
  { connection }
);

// אירועי דיבוג
notificationWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});
