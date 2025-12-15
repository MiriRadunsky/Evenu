// Fetch messages by read/unread state for a user
import { Router } from 'express';
import * as cnt from '../controllers/message.controller.js';
import { attachThreadId } from '../middlewares/thread.middlewares.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { threadAuthGuard } from '../middlewares/threadAuth.middleware.js';
const router = Router();

router.use(authGuard);
router.post('/', cnt.createMessage); 

router.get('/:threadId',threadAuthGuard, cnt.getMessages);

router.patch("/read/:threadId",threadAuthGuard,cnt.markMessagesAsRead);

export default router;

// router.get('/by-read-state', cnt.getMessagesByReadState);

