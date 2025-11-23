// src/repositories/message.repo.js
import Message from '../models/message.model.js';

export async function createMessage(data) {
  return await Message.create(data);
}

export async function getMessagesByThread(threadId, limit = 100) {
  return await Message.find({ threadId }).sort({ createdAt: 1 }).limit(limit);
}

export async function countUnreadMessages(threadId, userId) {
  return Message.countDocuments({
    threadId,
    to: { id: userId },
    isRead: false
  });
}