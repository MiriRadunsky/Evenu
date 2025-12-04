import { Schema, model, Types } from 'mongoose';
import { EVENT_TYPES } from '../shared/eventTypes.shared.js';

const eventSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: EVENT_TYPES,
      default: 'אחר',
      required: true
    },
    date: { type: Date, index: true, required: true },
    locationRegion: { type: String, trim: true },
    budget: { type: Number, min: 0 },
    estimatedGuests: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['פעיל', 'בפעולה', 'הושלם'],
      default: 'פעיל',
      index: true
    }
  },
  { timestamps: true }
);

// אינדקס לביצועים
eventSchema.index({ ownerId: 1, date: 1 });

// סטטוס אוטומטי לפי תאריך
eventSchema.virtual('autoStatus').get(function () {
  const now = new Date();

  if (this.status === 'בוטל') return 'בוטל';
  if (this.date < now.setHours(0, 0, 0, 0)) return 'הושלם';
  if (
    this.date.toDateString() === new Date().toDateString() &&
    this.status !== 'בוטל'
  )
    return 'בפעולה';
  return this.status;
});

export default model('Event', eventSchema);
