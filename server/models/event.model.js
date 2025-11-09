import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const eventSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true },
    type: {
      type: String,
      enum: ['חתונה', 'ברית', 'בר מצווה', 'בת מצווה', 'שבע ברכות', 'אחר'],
      default: 'אחר'
    },
    date: { type: Date, index: true },
    locationRegion: { type: String, trim: true },
    budget: { type: Number },
    estimatedGuests: { type: Number, required: true },
    status: { type: String, enum: ['פעיל', 'הושלם', 'בוטל'], default: 'פעיל', index: true }
  },
  { timestamps: true }
);

eventSchema.index({ ownerId: 1, date: 1 });

module.exports = model('Event', eventSchema);
