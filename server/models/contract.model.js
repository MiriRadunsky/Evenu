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
    signatureS3Key: { type: String }, // S3 Key של תמונת החתימה
    ipAddress: { type: String },
    userAgent: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);
const SupplierSignuterSub = new Schema(
  {
      supplierId: { type: Types.ObjectId, ref: 'Supplier' },
      signatureMeta: Schema.Types.Mixed,
      signatureS3Key: { type: String }, 
      ipAddress: { type: String },
      userAgent: { type: String },
      at: { type: Date, default: Date.now },
    },
    { _id: true })
// 🔹 סכמת חוזה ראשית
const contractSchema = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: 'Event', required: true, index: true },
    supplierId: { type: Types.ObjectId, ref: 'Supplier', required: true, index: true },
    clientId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    s3Key: { type: String, required: true },
    // חתימת ספק
    supplierSignature: { type: SupplierSignuterSub,default:null },

    // חתימות לקוחות
    clientSignatures: [clientSignatureSub],

    status: {
      type: String,
      enum: ['טיוטה', 'ממתין לספק', 'ממתין ללקוח', 'פעיל', 'הושלם', 'מבוטל'],
      default: 'טיוטה',
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

  if (supplierSigned && clientsSigned) this.status = 'פעיל';
  else if (supplierSigned) this.status = 'ממתין ללקוח';
  else if (clientsSigned) this.status = 'ממתין לספק';
  else this.status = 'טיוטה';

  next();
});
// middleware שמופעל גם ב-findOneAndUpdate
contractSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  // בדיקה אם החתימות מעודכנות
  const supplierSigned = update.supplierSignature || false;
  const clientsSigned = update.clientSignatures?.length > 0;

  if (supplierSigned && clientsSigned) update.status = 'פעיל';
  else if (supplierSigned) update.status = 'ממתין ללקוח';
  else if (clientsSigned) update.status = 'ממתין לספק';
  else update.status = 'טיוטה';

  next();
});

export default model('Contract', contractSchema);
