import * as repo from '../repositories/message.repository.js';
// Fetch messages by read/unread state for a user
export const getMessagesByReadState = asyncHandler(async (req, res) => {
  const { threadId, read } = req.query;
  const userId = req.user._id;
  const isRead = read === 'true';
  const messages = await repo.getMessagesByReadState(threadId, userId, isRead);
  res.json(messages);
});
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as messageService from '../services/message.service.js';

export const getMessages = asyncHandler(async (req, res) => {
  console.log("in", req.params.threadId);
  const threadId = req.params.threadId;
  const messages = await messageService.getThreadMessages(threadId);
  console.log('Messages:', messages);
  res.json(messages);
});

export const createMessage = asyncHandler(async (req, res) => {
  console.log("createMessage controller called with body:", req.body.to);
  const { threadId, from, to, body } = req.body;
  if (!body) return res.status(400).json({ message: 'Message body is required' });

  const message = await messageService.sendMessage({ threadId, from, to, body });
  res.status(201).json(message);
});

export const markMessagesAsRead = asyncHandler(async (req, res) => {
  console.log("markMessagesAsRead controller called");
  const { threadId } = req.params;
  const userId = req.user._id;
  console.log("Marking messages as read in thread:", threadId, "for user:", userId);
  await messageService.markMessagesAsRead(threadId, userId);
  res.status(200).end();
});