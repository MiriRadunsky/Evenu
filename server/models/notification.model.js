const { Schema, model, Types } = require('mongoose');

// התראות In-App/Email/SMS
const notificationSchema = new Schema(
  {
    userId:  { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type:    { type: String, enum: ['payment', 'contract', 'meeting', 'system'], required: true },
    payload: Schema.Types.Mixed,      // { contractId, paymentId, ... }
    scheduledFor: { type: Date, index: true },
    sentAt:  { type: Date, index: true },
    channel: { type: String, enum: ['in-app', 'email', 'sms'], default: 'in-app' },
    readAt:  { type: Date }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, scheduledFor: 1 });
notificationSchema.index({ channel: 1, sentAt: 1 });

module.exports = model('Notification', notificationSchema);
