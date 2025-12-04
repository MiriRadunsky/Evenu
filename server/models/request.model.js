import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const evebtSummarySub = new Schema(
  {

    eventName: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    type: { type: String, trim: true },
    date: { type: Date, required: true },
  },
  { _id: false }
)
const supplierRequestSchema = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: 'Event', required: true, index: true },
    supplierId: { type: Types.ObjectId, ref: 'Supplier', required: true, index: true },
    clientId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    basicEventSummary: { type: evebtSummarySub, required: true },
    notesFromClient: { type: String },

    status: { type: String, enum: ['ממתין', 'מאושר', 'נדחה', 'פג'], default: 'ממתין', index: true },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      default: null,
    },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }

  },
  { timestamps: true }
);

supplierRequestSchema.index({ supplierId: 1, status: 1 });
supplierRequestSchema.index({ eventId: 1, status: 1 });

export default model('SupplierRequest', supplierRequestSchema);
