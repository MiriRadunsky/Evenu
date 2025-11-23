// import mongoose from 'mongoose';
// const { Schema, model, Types } = mongoose;
// // הודעות Real-time עם שמירה קצרת-טווח (TTL)
// const participantSub = new Schema(
//   {
//     id: { type: Types.ObjectId, required: true },
//     type: { type: String, enum: ['user', 'supplier'], required: true }
//   },
//   { _id: false }
// );

// const messageSchema = new Schema(
//   {
//     threadId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Thread",
//       required: true,
//     },
//     from: participantSub,
//     to: participantSub,
//     body: { type: String, required: true, trim: true },

//     // TTL: המסמך יימחק בזמן השווה לערך השדה הזה
//     ttlAt: { type: Date, index: { expireAfterSeconds: 0 } },
//     isRead: { type: Boolean, default: false }
//   },
//   { timestamps: { createdAt: true, updatedAt: false } }
// );

// messageSchema.index({ threadId: 1, createdAt: 1 });

// export default model('Message', messageSchema);


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

    isRead: {
      type: Boolean,
      default: false,
    },

    // TTL: המסמך יימחק בזמן שהוגדר
    ttlAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// index לפי threadId ו־createdAt
messageSchema.index({ threadId: 1, createdAt: 1 });

export default model("Message", messageSchema);
