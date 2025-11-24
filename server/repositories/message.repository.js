// src/repositories/message.repo.js
import Message from '../models/message.model.js';

export async function createMessage(data) {
  return await Message.create(data);
}

export async function getMessagesByThread(threadId, limit = 100) {
  return await Message.find({ threadId }).sort({ createdAt: 1 }).limit(limit);
}

export async function hasUnreadMessages(threadId, viewerId) {
  return await Message.exists({
    threadId,
    from: { $ne: viewerId },
    isRead: false,
  });
}

export async function markThreadMessagesAsRead(threadId, userId) {
  return Message.updateMany(
    {
      threadId,
      to: userId,
      isRead: false
    },
    { $set: { isRead: true } }
  );
}
