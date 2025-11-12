//deleted code

import Notification from '../models/notification.model.js';

export const NotificationRepository = {
  async create(data) {
    return await Notification.create(data);
  },

  async findById(id) {
    return await Notification.findById(id);
  },

  async findByUser(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  },

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(id, { readAt: new Date() }, { new: true });
  },

  async markAsSent(id) {
    return await Notification.findByIdAndUpdate(id, { sentAt: new Date() }, { new: true });
  }
};
