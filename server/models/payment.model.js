import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const paymentSchema = new Schema(
  {
    contractId: {
      type: Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true, index: true },

    paidAt: { type: Date },

    status: {
      type: String,
      enum: ["ממתין", "שולם", "באיחור", "נדחה", "ממתין לאישור ספק"],
      default: "ממתין",
      index: true,
    },

    method: {
      type: String,
      enum: ["מזומן", "העברה בנקאית", "אשראי חיצוני", "צק", "other"],
    },

    note: { type: String },


    // 🔹 עבור ה־flow של לקוח -> ספק
    clientReportedPaidAt: { type: Date }, // מתי הלקוח דיווח ששילם
    clientReportedBy: { type: Types.ObjectId, ref: "User" },

    supplierConfirmedPaidAt: { type: Date }, // מתי הספק אישר ששולם
    supplierConfirmedBy: { type: Types.ObjectId, ref: "Supplier" },

    clientEvidenceKey: { type: String }, // אסמכתא מהלקוח (צילום העברה / קבלה)
    supplierEvidenceKey: { type: String }, // קבלה של הספק, אם יש
    rejectedReason: { type: String }, // למה נדחה
  },
  { timestamps: true }
);

// 🔹 אינדקס לשליפות לפי חוזה+סטטוס
paymentSchema.index({ contractId: 1, status: 1 });

export default model("Payment", paymentSchema);
