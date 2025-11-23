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
  // console.log('📦 Request body:', req.body);
  const { threadId, from, to, body } = req.body;
  if (!body) return res.status(400).json({ message: 'Message body is required' });

  const message = await messageService.sendMessage({ threadId, from, to, body });
  res.status(201).json(message);
});