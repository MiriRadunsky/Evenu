
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const messageSchema = new Schema(
  {
    threadId: {
      type: Types.ObjectId,
      ref: "Thread",
      required: true,
    },

    from: {
      type: Types.ObjectId,
      ref: "User", // או 'Supplier' אם רוצים להפריד סוגים
      required: true,
    },

    to: {
      type: Types.ObjectId,
      ref: "User", // או 'Supplier'
      required: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    // Array of user IDs who have read this message
    readBy: [{
      type: Types.ObjectId,
      ref: "User",
    }],
    // Timestamp of last read (optional, for analytics)
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// index לפי threadId ו־createdAt
messageSchema.index({ threadId: 1, createdAt: 1 });

export default model("Message", messageSchema);
