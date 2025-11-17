import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const threadSchema = new Schema(
  {
    participants: [
      {
        id: { type: Types.ObjectId, required: true },
        type: { type: String, enum: ['user', 'supplier'], required: true }
      }
    ],
    eventId: { type: Types.ObjectId, ref: 'Event' }
  },
  { timestamps: true }
);

export default model('Thread', threadSchema);