// // src/services/message.service.js
// import Redis from 'ioredis';
// import * as repo from '../repositories/message.repository.js';

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379' )

// const RECENT_LIMIT = 50;
// redis.on('error', (err) => {
//   console.error('Redis connection error:', err.code, err.message);
// });

// export async function sendMessage({ threadId, from, to, body }) {
//   const ttlAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 ימים
//   const message = await repo.createMessage({ threadId, from, to, body, ttlAt });

//   try {
//     const key = `thread:${threadId}:recent`;
//     await redis.lpush(key, JSON.stringify(message));
//     await redis.ltrim(key, 0, RECENT_LIMIT - 1);
//   } catch (err) {
//     console.error("Redis push error:", err.message);
//   }

//   return message;
// }

// export async function getThreadMessages(threadId) {
//   let cached = [];
//   const key = `thread:${threadId}:recent`;

//   try {
//     cached = await redis.lrange(key, 0, -1);
//   } catch (err) {
//     console.error("Redis read error:", err.message);
//   }

//   if (cached.length > 0) {
//     console.log("Messages from Redis cache");
//     return cached
//       .map((x) => {
//         try {
//           return JSON.parse(x);
//         } catch {
//           return null;
//         }
//       })
//       .filter(Boolean)
//       .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//   }

//   const messages = await repo.getMessagesByThread(threadId);
//   console.log("Messages from DB");

//   if (messages.length > 0) {
//     try {
//       const pipe = redis.pipeline();
//       messages.forEach((m) => pipe.rpush(key, JSON.stringify(m)));
//       pipe.ltrim(key, -RECENT_LIMIT, -1);
//       await pipe.exec();
//     } catch (err) {
//       console.error("Redis pipeline error:", err.message);
//     }
//   }

//   return messages;
// }

// export async function markMessagesAsRead(threadId, userId) {
//   return await repo.markThreadMessagesAsRead(threadId, userId);
// }


// src/services/message.service.js
import * as repo from '../repositories/message.repository.js';

export async function sendMessage({ threadId, from, to, body }) {
  console.log("sendMessage ",{ threadId, from, to, body });
  
  const ttlAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 ימים
  return await repo.createMessage({ threadId, from, to, body, ttlAt });
}

export async function getThreadMessages(threadId) {
  const res =  await repo.getMessagesByThread(threadId);
  console.log("res ", res);
  return res;
  
}
export async function markMessagesAsRead(threadId, userId) {
  return await repo.markThreadMessagesAsRead(threadId, userId);
}