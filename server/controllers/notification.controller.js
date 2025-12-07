import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import { NotificationService } from '../services/notification.service.js';

export const NotificationController = {
  create: asyncHandler(async (req, res) => {
      const {notification} = await NotificationService.createNotification({ ...req.body, userId: req.user._id });
      res.status(201).json(notification);
  }),

  getUserNotifications: asyncHandler(async (req, res) => {
      const {_v, ...notifications} = await NotificationService.getUserNotifications(req.user._id);
      res.status(201).json(notifications);
  }),

  markAsRead: asyncHandler(async (req, res) =>  {
      const notificationId = await NotificationService.markAsRead(req.user._id, req.body.notificationId);
      res.status(201).json({ notificationId });
  })
};
