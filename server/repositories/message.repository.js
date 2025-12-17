// src/repositories/message.repo.js
import Message from '../models/message.model.js';

export async function createMessage(data) {
  console.log("saving message")
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


// Mark all messages in a thread as read by a user (add userId to readBy array)
export async function markThreadMessagesAsRead(threadId, userId) {
  return Message.updateMany(
    {
      threadId,
      readBy: { $ne: userId },
      to: userId
    },
    {
      $addToSet: { readBy: userId },
      $set: { readAt: new Date() }
    }
  );
}

// Fetch messages by read/unread state for a user
export async function getMessagesByReadState(threadId, userId, read = true) {
  const filter = { threadId };
  if (read) {
    filter.readBy = userId;
  } else {
    filter.readBy = { $ne: userId };
  }
  return Message.find(filter).sort({ createdAt: 1 });
}
