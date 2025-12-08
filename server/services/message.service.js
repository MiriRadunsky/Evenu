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
