import { Router } from 'express';
import { getNotifications, sendTestNotification } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/test', authenticate, sendTestNotification);

export default router;
