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
    budget: { type: Number },
    estimatedGuests: { type: Number, required: true },
    status: { type: String, enum: ['פעיל', 'הושלם', 'בוטל'], default: 'פעיל', index: true }
  },
  { timestamps: true }
);

eventSchema.index({ ownerId: 1, date: 1 });
export default model('Event', eventSchema);
