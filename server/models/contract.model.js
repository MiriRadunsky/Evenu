import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// 🔹 סכמת משנה לתוכנית תשלומים
const paymentPlanSub = new Schema(
  {
    dueDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true },
    note: { type: String },
  },
  { _id: false }
);

// 🔹 סכמת חתימת לקוח
const clientSignatureSub = new Schema(
  {
    clientId: { type: Types.ObjectId, ref: 'User', required: true },
    signatureMeta: Schema.Types.Mixed,
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

// 🔹 סכמת חוזה ראשית
const contractSchema = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: 'Event', required: true, index: true },
    supplierId: { type: Types.ObjectId, ref: 'Supplier', required: true, index: true },
    clientId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    fileUrl: { type: String, required: true },

    // חתימת ספק
    supplierSignature: {
      signatureMeta: Schema.Types.Mixed,
      at: { type: Date, default: Date.now },
    },

    // חתימות לקוחות
    clientSignatures: [clientSignatureSub],

    status: {
      type: String,
      enum: ['draft', 'awaiting_supplier', 'awaiting_client', 'active', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },

    paymentPlan: [paymentPlanSub],
  },
  { timestamps: true }
);

// 🔹 middleware לחישוב אוטומטי של סטטוס
contractSchema.pre('save', function (next) {
  const supplierSigned = !!this.supplierSignature;
  const clientsSigned = this.clientSignatures.length > 0;

  if (supplierSigned && clientsSigned) this.status = 'active';
  else if (supplierSigned) this.status = 'awaiting_client';
  else if (clientsSigned) this.status = 'awaiting_supplier';
  else this.status = 'draft';

  next();
});

export default model('Contract', contractSchema);
