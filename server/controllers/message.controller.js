import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as messageService from '../services/message.service.js';

export const getMessages = asyncHandler(async (req, res) => {
console.log("in", req.params);
    const threadId = req.threadId;

  const messages = await messageService.getThreadMessages(threadId);
  res.json({ threadId, messages });
});

export const createMessage = asyncHandler(async (req, res) => {
      console.log('📦 Request body:', req.body);
    const { from, to, body } = req.body;
    const threadId = req.threadId;

    if (!body) return res.status(400).json({ message: 'Message body is required' });

  const newMsg = await messageService.sendMessage({ threadId, from, to, body });
  res.status(201).json({ threadId, newMsg });
});