const { Schema, model, Types } = require('mongoose');

// הודעות Real-time עם שמירה קצרת-טווח (TTL)
const participantSub = new Schema(
  {
    id:   { type: Types.ObjectId, required: true },
    type: { type: String, enum: ['user', 'supplier'], required: true }
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    threadId: { type: Types.ObjectId, required: true, index: true }, // אפשר לזהות לפי event+supplier+client
    from: participantSub,
    to:   participantSub,
    body: { type: String, required: true, trim: true },

    // TTL: המסמך יימחק בזמן השווה לערך השדה הזה
    ttlAt: { type: Date, index: { expireAfterSeconds: 0 } }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ threadId: 1, createdAt: 1 });

module.exports = model('Message', messageSchema);
