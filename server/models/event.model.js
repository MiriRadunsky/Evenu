import { Schema, model, Types } from 'mongoose';

const eventSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: ['חתונה', 'ברית', 'בר מצווה', 'בת מצווה', 'שבע ברכות', 'אחר'],
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

export const Event = model('Event', eventSchema);
