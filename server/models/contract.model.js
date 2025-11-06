const { Schema, model, Types } = require('mongoose');

const signatureSub = new Schema(
  {
    party: { type: String, enum: ['client', 'supplier'], required: true },
    at: { type: Date, default: Date.now },
    signatureMeta: Schema.Types.Mixed
  },
  { _id: false }
);

const paymentPlanSub = new Schema(
  {
    dueDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending', index: true },
    receiptUrl: { type: String }
  },
  { _id: false }
);

const contractSchema = new Schema(
  {
    eventId:    { type: Types.ObjectId, ref: 'Event', required: true, index: true },
    supplierId: { type: Types.ObjectId, ref: 'Supplier', required: true, index: true },
    clientId:   { type: Types.ObjectId, ref: 'User', required: true, index: true },

    fileUrl:    { type: String, required: true }, 
    signatures: [signatureSub],

    status: {
      type: String,
      enum: ['draft', 'awaiting_sign', 'active', 'completed', 'cancelled'],
      default: 'draft',
      index: true
    },

    paymentPlan: [paymentPlanSub]
  },
  { timestamps: true }
);

module.exports = model('Contract', contractSchema);
