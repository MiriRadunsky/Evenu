// src/services/message.service.js
import * as repo from '../repositories/message.repository.js';

export async function sendMessage({ threadId, from, to, body }) {
  const ttlAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 ימים
  return await repo.createMessage({ threadId, from, to, body, ttlAt });
}

export async function getThreadMessages(threadId) {
  return await repo.getMessagesByThread(threadId);
}
