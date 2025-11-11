import { NotificationService } from '../services/notification.service.js';
import { NotificationRepository } from '../repositories/notification.repository.js';

export const NotificationController = {
  async create(req, res) {
    try {
      console.log(req.body);
      
      const notification = await NotificationService.createNotification({ ...req.body, userId: req.user._id });
      res.status(201).json(notification);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getUserNotifications(req, res) {
    try {
      const notifications = await NotificationRepository.findByUser(req.user._id);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const updated = await NotificationRepository.markAsRead(req.user._id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
