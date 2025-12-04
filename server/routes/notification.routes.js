import express from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { NotificationController } from '../controllers/notification.controller.js';
const router = express.Router();

router.get('/', authGuard, NotificationController.getUserNotifications);
router.post('/', authGuard, NotificationController.create);
router.post('/markAsRead', authGuard, NotificationController.markAsRead);

export default router;
